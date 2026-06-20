import { db } from "./supabase.js";
import { supabase } from "./supabase.js";
import { STORAGE_BUCKET } from "../utils/constants.js";

/**
 * Create a new group conversation.
 * `memberIds` — array of user IDs to add (NOT including the creator; they're added automatically).
 */
export async function createGroup({ name, avatarFile, memberIds, createdBy }) {
  // 1. Upload group avatar if provided
  let avatarUrl = null;
  if (avatarFile) {
    const ext  = avatarFile.name.split(".").pop();
    const path = `groups/${createdBy}-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, avatarFile, { cacheControl: "3600", upsert: true });
    if (uploadErr) throw uploadErr;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    avatarUrl = data.publicUrl;
  }

  // 2. Insert conversation row
  const { data: conv, error: convErr } = await db("conversations")
    .insert({ type: "group", name: name.trim(), avatar_url: avatarUrl, created_by: createdBy })
    .select()
    .single();
  if (convErr) throw convErr;

  // 3. Insert all members (creator as admin, others as member)
  const allMembers = [
    { conversation_id: conv.id, user_id: createdBy,  role: "admin"  },
    ...memberIds.map((uid) => ({ conversation_id: conv.id, user_id: uid, role: "member" })),
  ];
  const { error: memErr } = await db("conversation_members").insert(allMembers);
  if (memErr) throw memErr;

  // 4. Insert a system message "Group created"
  await db("messages").insert({
    conversation_id: conv.id,
    sender_id:       createdBy,
    content_type:    "system",
    content:         "Group created",
  });

  return conv.id;
}

/** Add a member to an existing group (admin only enforced by RLS) */
export async function addGroupMember(conversationId, userId) {
  const { error } = await db("conversation_members").insert({
    conversation_id: conversationId,
    user_id:         userId,
    role:            "member",
  });
  if (error) throw error;

  // System message
  const { data: profile } = await db("profiles").select("username").eq("id", userId).single();
  await db("messages").insert({
    conversation_id: conversationId,
    sender_id:       userId,
    content_type:    "system",
    content:         `${profile?.username ?? "Someone"} joined the group`,
  });
}

/** Remove a member from a group */
export async function removeGroupMember(conversationId, userId, removedByUsername) {
  const { data: profile } = await db("profiles").select("username").eq("id", userId).single();
  const { error } = await db("conversation_members")
    .delete()
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
  if (error) throw error;

  await db("messages").insert({
    conversation_id: conversationId,
    sender_id:       userId,
    content_type:    "system",
    content:         `${profile?.username ?? "Someone"} was removed from the group`,
  });
}

/** Leave a group */
export async function leaveGroup(conversationId, userId) {
  const { data: profile } = await db("profiles").select("username").eq("id", userId).single();
  const { error } = await db("conversation_members")
    .delete()
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
  if (error) throw error;

  await db("messages").insert({
    conversation_id: conversationId,
    sender_id:       userId,
    content_type:    "system",
    content:         `${profile?.username ?? "Someone"} left the group`,
  });
}

/** Update group name or avatar */
export async function updateGroup(conversationId, { name, avatarFile, updatedBy }) {
  const updates = {};
  if (name) updates.name = name.trim();

  if (avatarFile) {
    const ext  = avatarFile.name.split(".").pop();
    const path = `groups/${conversationId}-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, avatarFile, { upsert: true });
    if (uploadErr) throw uploadErr;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    updates.avatar_url = data.publicUrl;
  }

  const { data, error } = await db("conversations")
    .update(updates)
    .eq("id", conversationId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Fetch full group details including members list with roles */
export async function fetchGroupDetail(conversationId) {
  const { data: conv, error } = await db("conversations")
    .select("id, name, avatar_url, created_by, created_at")
    .eq("id", conversationId)
    .single();
  if (error) throw error;

  const { data: members, error: memErr } = await db("conversation_members")
    .select("user_id, role, joined_at, profiles(id, username, avatar_url, presence_status)")
    .eq("conversation_id", conversationId)
    .order("joined_at", { ascending: true });
  if (memErr) throw memErr;

  return { ...conv, members: members ?? [] };
}
