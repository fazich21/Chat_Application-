import { db, supabase } from "./supabase.js";
import { MESSAGES_PAGE_SIZE } from "../utils/constants.js";

/**
 * Fetch a page of messages for a conversation, oldest-first within the page.
 * `before` — ISO timestamp cursor; pass the oldest loaded message's created_at
 * to fetch the page before it (for "load older messages on scroll up").
 */
export async function fetchMessages(conversationId, { before } = {}) {
  let query = db("messages")
    .select(`
      id, conversation_id, sender_id, content_type, content, image_url,
      reply_to_id, created_at, deleted_at,
      profiles!messages_sender_id_fkey(id, username, avatar_url)
    `)
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(MESSAGES_PAGE_SIZE);

  if (before) query = query.lt("created_at", before);

  const { data, error } = await query;
  if (error) throw error;

  // Reverse to chronological (oldest → newest) for rendering
  return (data ?? []).reverse();
}

/** Send a text message. Returns the inserted row. */
export async function sendTextMessage({ conversationId, senderId, content, replyToId }) {
  const { data, error } = await db("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content_type: "text",
      content,
      reply_to_id: replyToId ?? null,
    })
    .select(`
      id, conversation_id, sender_id, content_type, content, image_url,
      reply_to_id, created_at,
      profiles!messages_sender_id_fkey(id, username, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

/** Send an image message. `imageUrl` must already be uploaded to Storage. */
export async function sendImageMessage({ conversationId, senderId, imageUrl, caption }) {
  const { data, error } = await db("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content_type: "image",
      content: caption ?? null,
      image_url: imageUrl,
    })
    .select(`
      id, conversation_id, sender_id, content_type, content, image_url,
      reply_to_id, created_at,
      profiles!messages_sender_id_fkey(id, username, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

/** Soft-delete a message (keeps row for "message deleted" placeholder) */
export async function deleteMessage(messageId) {
  const { error } = await db("messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", messageId);
  if (error) throw error;
}

/** Mark a single message as seen by the current user */
export async function markMessageSeen(messageId, userId) {
  const { error } = await db("message_seen")
    .upsert({ message_id: messageId, user_id: userId }, { onConflict: "message_id,user_id" });
  if (error) throw error;
}

/** Mark all currently-loaded messages (not sent by self) as seen, in one batch */
export async function markMessagesSeen(messageIds, userId) {
  if (!messageIds.length) return;
  const rows = messageIds.map((message_id) => ({ message_id, user_id: userId }));
  const { error } = await db("message_seen")
    .upsert(rows, { onConflict: "message_id,user_id" });
  if (error) throw error;
}

/** Fetch which users have seen which messages, for a set of message ids */
export async function fetchSeenReceipts(messageIds) {
  if (!messageIds.length) return [];
  const { data, error } = await db("message_seen")
    .select("message_id, user_id, seen_at")
    .in("message_id", messageIds);
  if (error) throw error;
  return data ?? [];
}

/**
 * Subscribe to new messages in a conversation via Supabase Realtime.
 * Calls `onInsert(message)` for every new row. Returns an unsubscribe function.
 */
export function subscribeToMessages(conversationId, onInsert) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      async (payload) => {
        // Fetch the row with sender profile joined (the realtime payload is the raw row only)
        const { data } = await db("messages")
          .select(`
            id, conversation_id, sender_id, content_type, content, image_url,
            reply_to_id, created_at,
            profiles!messages_sender_id_fkey(id, username, avatar_url)
          `)
          .eq("id", payload.new.id)
          .single();
        if (data) onInsert(data);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/**
 * Subscribe to seen-receipt updates for a conversation (any insert into message_seen
 * for messages belonging to this conversation). Since message_seen has no conversation_id
 * column, we subscribe broadly and let the caller filter by message id.
 */
export function subscribeToSeenReceipts(onInsert) {
  const channel = supabase
    .channel(`message_seen:all`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "message_seen" },
      (payload) => onInsert(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
