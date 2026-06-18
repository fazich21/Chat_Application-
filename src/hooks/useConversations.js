import { useEffect, useCallback, useRef } from "react";
import { useConversationStore } from "../store/conversationStore.js";
import {
  fetchConversations,
  markConversationRead,
} from "../services/conversationService.js";
import { supabase } from "../services/supabase.js";

/**
 * Loads the user's conversation list and keeps it live via Realtime —
 * listens for new messages on ANY conversation to bump previews/unread counts,
 * and for new conversation_members rows (being added to a new chat).
 */
export function useConversations(userId) {
  const {
    conversations, loading, error,
    setConversations, setLoading, setError,
    touchConversation, clearUnread, activeId,
  } = useConversationStore();

  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const reload = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchConversations(userId);
      setConversations(data);
    } catch (err) {
      setError(err.message ?? "Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, [userId, setConversations, setLoading, setError]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Live updates: any new message anywhere bumps that conversation's preview
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`conversations-overview:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          const isOwn = msg.sender_id === userId;
          const isActive = msg.conversation_id === activeIdRef.current;

          touchConversation(msg.conversation_id, {
            lastMessage: msg.content_type === "image" ? "📷 Photo" : msg.content,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            lastMessageAt: msg.created_at,
            incrementUnread: !isOwn && !isActive,
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, touchConversation]);

  const markRead = useCallback(
    async (conversationId) => {
      clearUnread(conversationId);
      try {
        await markConversationRead(conversationId, userId);
      } catch {
        // non-critical — unread badge will resync on next reload
      }
    },
    [userId, clearUnread]
  );

  return { conversations, loading, error, reload, markRead };
}
