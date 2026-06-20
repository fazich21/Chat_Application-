import { useEffect, useCallback, useRef, useState } from "react";
import { useMessageStore } from "../store/messageStore.js";
import {
  fetchMessages,
  sendTextMessage,
  sendImageMessage,
  sendAudioMessage,
  subscribeToMessages,
  markMessagesSeen,
  subscribeToSeenReceipts,
  fetchSeenReceipts,
} from "../services/messageService.js";
import { MESSAGES_PAGE_SIZE } from "../utils/constants.js";

/**
 * Loads message history for a conversation, subscribes to realtime INSERTs,
 * exposes `sendMessage` / `sendImage` with optimistic UI, and tracks seen receipts.
 *
 * Usage:
 *   const { messages, loading, error, sendMessage, loadOlder, hasMore } = useMessages(conversationId, userId);
 */
export function useMessages(conversationId, userId) {
  const {
    setMessages, appendMessage, prependMessages,
    reconcileMessage, markMessageFailed,
    setLoading, setError, setHasMore,
    getMessages, loadingByConv, errorByConv, hasMoreByConv,
  } = useMessageStore();

  const [seenByMessageId, setSeenByMessageId] = useState({}); // { [messageId]: userId[] }
  const messages   = getMessages(conversationId);
  const loading    = loadingByConv[conversationId] ?? false;
  const error      = errorByConv[conversationId] ?? null;
  const hasMore    = hasMoreByConv[conversationId] ?? true;

  const loadingRef = useRef(false);

  /* ── initial load ── */
  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;

    (async () => {
      setLoading(conversationId, true);
      setError(conversationId, null);
      try {
        const data = await fetchMessages(conversationId);
        if (cancelled) return;
        setMessages(conversationId, data);
        setHasMore(conversationId, data.length === MESSAGES_PAGE_SIZE);

        // Fetch seen receipts for the loaded batch
        const ids = data.map((m) => m.id);
        const receipts = await fetchSeenReceipts(ids);
        if (cancelled) return;
        const map = {};
        for (const r of receipts) {
          map[r.message_id] = [...(map[r.message_id] ?? []), r.user_id];
        }
        setSeenByMessageId(map);
      } catch (err) {
        if (!cancelled) setError(conversationId, err.message ?? "Failed to load messages.");
      } finally {
        if (!cancelled) setLoading(conversationId, false);
      }
    })();

    return () => { cancelled = true; };
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── realtime: new messages ── */
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMessages(conversationId, (message) => {
      appendMessage(conversationId, message);
    });
    return unsubscribe;
  }, [conversationId, appendMessage]);

  /* ── realtime: seen receipts ── */
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToSeenReceipts((receipt) => {
      setSeenByMessageId((prev) => ({
        ...prev,
        [receipt.message_id]: [...new Set([...(prev[receipt.message_id] ?? []), receipt.user_id])],
      }));
    });
    return unsubscribe;
  }, [conversationId]);

  /* ── auto mark-as-seen: whenever messages change, mark others' messages as seen ── */
  useEffect(() => {
    if (!conversationId || !userId || messages.length === 0) return;
    const unseenFromOthers = messages
      .filter((m) => m.sender_id !== userId && m.id && !String(m.id).startsWith("temp-"))
      .map((m) => m.id);
    if (unseenFromOthers.length) {
      markMessagesSeen(unseenFromOthers, userId).catch(() => {});
    }
  }, [conversationId, userId, messages]);

  /* ── load older (pagination) ── */
  const loadOlder = useCallback(async () => {
    if (!conversationId || loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    try {
      const oldest = messages[0];
      const older = await fetchMessages(conversationId, { before: oldest?.created_at });
      prependMessages(conversationId, older);
      setHasMore(conversationId, older.length === MESSAGES_PAGE_SIZE);
    } catch (err) {
      setError(conversationId, err.message ?? "Failed to load older messages.");
    } finally {
      loadingRef.current = false;
    }
  }, [conversationId, messages, hasMore, prependMessages, setHasMore, setError]);

  /* ── send text message (optimistic) ── */
  const sendMessage = useCallback(
    async (content, senderProfile) => {
      if (!content.trim() || !conversationId || !userId) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: userId,
        content_type: "text",
        content,
        created_at: new Date().toISOString(),
        status: "sending",
        profiles: senderProfile ?? { id: userId, username: "You" },
      };

      appendMessage(conversationId, optimisticMessage);

      try {
        const confirmed = await sendTextMessage({ conversationId, senderId: userId, content });
        reconcileMessage(conversationId, tempId, { ...confirmed, status: "sent" });
      } catch (err) {
        markMessageFailed(conversationId, tempId);
        setError(conversationId, err.message ?? "Failed to send message.");
      }
    },
    [conversationId, userId, appendMessage, reconcileMessage, markMessageFailed, setError]
  );

  /* ── send image message (optimistic, expects pre-uploaded URL) ── */
  const sendImage = useCallback(
    async (imageUrl, caption, senderProfile) => {
      if (!imageUrl || !conversationId || !userId) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: userId,
        content_type: "image",
        content: caption ?? null,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
        status: "sending",
        profiles: senderProfile ?? { id: userId, username: "You" },
      };

      appendMessage(conversationId, optimisticMessage);

      try {
        const confirmed = await sendImageMessage({ conversationId, senderId: userId, imageUrl, caption });
        reconcileMessage(conversationId, tempId, { ...confirmed, status: "sent" });
      } catch (err) {
        markMessageFailed(conversationId, tempId);
        setError(conversationId, err.message ?? "Failed to send image.");
      }
    },
    [conversationId, userId, appendMessage, reconcileMessage, markMessageFailed, setError]
  );

  /* ── send audio message (optimistic, expects pre-uploaded URL) ── */
  const sendAudio = useCallback(
    async (audioUrl, duration, senderProfile) => {
      if (!audioUrl || !conversationId || !userId) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: userId,
        content_type: "audio",
        audio_url: audioUrl,
        audio_duration: duration,
        created_at: new Date().toISOString(),
        status: "sending",
        profiles: senderProfile ?? { id: userId, username: "You" },
      };

      appendMessage(conversationId, optimisticMessage);

      try {
        const confirmed = await sendAudioMessage({ conversationId, senderId: userId, audioUrl, duration });
        reconcileMessage(conversationId, tempId, { ...confirmed, status: "sent" });
      } catch (err) {
        markMessageFailed(conversationId, tempId);
        setError(conversationId, err.message ?? "Failed to send voice message.");
      }
    },
    [conversationId, userId, appendMessage, reconcileMessage, markMessageFailed, setError]
  );

  return {
    messages,
    loading,
    error,
    hasMore,
    seenByMessageId,
    sendMessage,
    sendImage,
    sendAudio,
    loadOlder,
    clearError: () => setError(conversationId, null),
    setError: (msg) => setError(conversationId, msg),
  };
}
