import { db } from "./supabase.js";

/**
 * Fetch all conversations the current user is a member of,
 * along with the other participant(s) and the most recent message.
 *
 * Returns an array shaped for direct use by <ConversationItem>:
 *  { id, name, avatarSrc, lastMessage, time, unreadCount, status, isGroup,
 *    otherUserId (direct only), memberCount (group only) }
 */
export async function fetchConversations(userId) {
  // 1. Get all conversation_ids this user belongs to, with last_read_at
  const { data: memberships, error: memErr } = await db("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId);

  if (memErr) throw memErr;
  if (!memberships?.length) return [];

  const convIds = memberships.map((m) => m.conversation_id);
  const lastReadMap = Object.fromEntries(
    memberships.map((m) => [m.conversation_id, m.last_read_at])
  );

  // 2. Fetch conversation rows
  const { data: conversations, error: convErr } = await db("conversations")
    .select("id, type, name, avatar_url, created_at")
    .in("id", convIds);

  if (convErr) throw convErr;

  // 3. Fetch all members (to resolve direct-chat display name + group member count)
  const { data: allMembers, error: allMemErr } = await db("conversation_members")
    .select("conversation_id, user_id, profiles(id, username, avatar_url, presence_status, last_seen_at)")
    .in("conversation_id", convIds);

  if (allMemErr) throw allMemErr;

  // 4. Fetch the latest message per conversation
  const { data: latestMessages, error: msgErr } = await db("messages")
    .select("id, conversation_id, sender_id, content, content_type, created_at")
    .in("conversation_id", convIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (msgErr) throw msgErr;

  const latestByConv = {};
  for (const m of latestMessages ?? []) {
    if (!latestByConv[m.conversation_id]) latestByConv[m.conversation_id] = m;
  }

  // 5. Unread counts — messages newer than last_read_at, not sent by self
  const { data: unreadRows, error: unreadErr } = await db("messages")
    .select("id, conversation_id, sender_id, created_at")
    .in("conversation_id", convIds)
    .neq("sender_id", userId)
    .is("deleted_at", null);

  if (unreadErr) throw unreadErr;

  const unreadCountByConv = {};
  for (const row of unreadRows ?? []) {
    const lastRead = lastReadMap[row.conversation_id];
    if (!lastRead || new Date(row.created_at) > new Date(lastRead)) {
      unreadCountByConv[row.conversation_id] = (unreadCountByConv[row.conversation_id] ?? 0) + 1;
    }
  }

  // 6. Assemble final shape
  return conversations.map((c) => {
    const members = allMembers.filter((m) => m.conversation_id === c.id);
    const otherMember = members.find((m) => m.user_id !== userId);
    const isGroup = c.type === "group";

    const name = isGroup ? (c.name ?? "Unnamed group") : (otherMember?.profiles?.username ?? "Unknown user");
    const avatarSrc = isGroup ? c.avatar_url : otherMember?.profiles?.avatar_url;
    const status = isGroup ? undefined : otherMember?.profiles?.presence_status;

    const last = latestByConv[c.id];
    const lastMessage = last
      ? last.content_type === "image" ? "📷 Photo" : (last.content ?? "")
      : "No messages yet";

    return {
      id: c.id,
      type: c.type,
      isGroup,
      name,
      avatarSrc,
      status,
      memberCount: members.length,
      otherUserId: isGroup ? undefined : otherMember?.user_id,
      lastMessage,
      lastMessageAt: last?.created_at ?? c.created_at,
      time: formatListTime(last?.created_at ?? c.created_at),
      unreadCount: unreadCountByConv[c.id] ?? 0,
      seenStatus: last?.sender_id === userId ? "sent" : undefined,
    };
  }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
}

/** Mark a conversation as read up to now (updates last_read_at) */
export async function markConversationRead(conversationId, userId) {
  const { error } = await db("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Fetch a single conversation's display info (for ChatHeader) */
export async function fetchConversationDetail(conversationId, userId) {
  const { data: conv, error } = await db("conversations")
    .select("id, type, name, avatar_url")
    .eq("id", conversationId)
    .single();
  if (error) throw error;

  const { data: members, error: memErr } = await db("conversation_members")
    .select("user_id, role, profiles(id, username, avatar_url, presence_status, last_seen_at)")
    .eq("conversation_id", conversationId);
  if (memErr) throw memErr;

  const isGroup = conv.type === "group";
  const otherMember = members.find((m) => m.user_id !== userId);

  return {
    id: conv.id,
    isGroup,
    name: isGroup ? (conv.name ?? "Unnamed group") : (otherMember?.profiles?.username ?? "Unknown user"),
    avatarSrc: isGroup ? conv.avatar_url : otherMember?.profiles?.avatar_url,
    status: isGroup ? undefined : otherMember?.profiles?.presence_status,
    subtitle: isGroup ? undefined : formatLastSeenLabel(otherMember?.profiles?.last_seen_at),
    lastSeenAt: isGroup ? undefined : otherMember?.profiles?.last_seen_at,
    memberCount: members.length,
    members,
    otherUserId: isGroup ? undefined : otherMember?.user_id,
  };
}

/** Find or create a direct (1:1) conversation between two users */
export async function findOrCreateDirectConversation(userId, otherUserId) {
  // Look for an existing direct conversation containing both users
  const { data: myConvs, error: myErr } = await db("conversation_members")
    .select("conversation_id, conversations!inner(type)")
    .eq("user_id", userId)
    .eq("conversations.type", "direct");
  if (myErr) throw myErr;

  for (const row of myConvs ?? []) {
    const { data: members } = await db("conversation_members")
      .select("user_id")
      .eq("conversation_id", row.conversation_id);
    const ids = members.map((m) => m.user_id);
    if (ids.includes(otherUserId) && ids.length === 2) {
      return row.conversation_id;
    }
  }

  // Create new
  const { data: newConv, error: createErr } = await db("conversations")
    .insert({ type: "direct", created_by: userId })
    .select()
    .single();
  if (createErr) throw createErr;

  const { error: addErr } = await db("conversation_members").insert([
    { conversation_id: newConv.id, user_id: userId, role: "admin" },
    { conversation_id: newConv.id, user_id: otherUserId, role: "member" },
  ]);
  if (addErr) throw addErr;

  return newConv.id;
}

/* ── helpers ── */
function formatListTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const isYesterday = date.toDateString() === new Date(now - 86_400_000).toDateString();
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

function formatLastSeenLabel(dateString) {
  if (!dateString) return "Offline";
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 120) return "Last seen recently";
  if (seconds < 3600) return `Last seen ${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `Last seen ${Math.floor(seconds / 3600)}h ago`;
  return `Last seen ${new Date(dateString).toLocaleDateString([], { day: "numeric", month: "short" })}`;
}
