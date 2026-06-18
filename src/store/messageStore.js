import { create } from "zustand";

/**
 * Holds messages per conversation: { [conversationId]: Message[] }
 * Also tracks per-conversation loading/error state and typing users.
 */
export const useMessageStore = create((set, get) => ({
  messagesByConv:   {},   // { [conversationId]: Message[] }
  loadingByConv:    {},   // { [conversationId]: boolean }
  errorByConv:      {},   // { [conversationId]: string | null }
  hasMoreByConv:    {},   // { [conversationId]: boolean }
  typingByConv:     {},   // { [conversationId]: { [userId]: username } }

  setMessages: (conversationId, messages) =>
    set((s) => ({
      messagesByConv: { ...s.messagesByConv, [conversationId]: messages },
    })),

  prependMessages: (conversationId, olderMessages) =>
    set((s) => ({
      messagesByConv: {
        ...s.messagesByConv,
        [conversationId]: [...olderMessages, ...(s.messagesByConv[conversationId] ?? [])],
      },
    })),

  appendMessage: (conversationId, message) =>
    set((s) => {
      const existing = s.messagesByConv[conversationId] ?? [];
      // Avoid duplicate inserts (optimistic + realtime echo)
      if (existing.some((m) => m.id === message.id)) return {};
      return {
        messagesByConv: { ...s.messagesByConv, [conversationId]: [...existing, message] },
      };
    }),

  /** Replace an optimistic temp message with the confirmed server row */
  reconcileMessage: (conversationId, tempId, confirmedMessage) =>
    set((s) => {
      const existing = s.messagesByConv[conversationId] ?? [];
      return {
        messagesByConv: {
          ...s.messagesByConv,
          [conversationId]: existing.map((m) => (m.id === tempId ? confirmedMessage : m)),
        },
      };
    }),

  /** Mark an optimistic message as failed (so UI can show retry) */
  markMessageFailed: (conversationId, tempId) =>
    set((s) => {
      const existing = s.messagesByConv[conversationId] ?? [];
      return {
        messagesByConv: {
          ...s.messagesByConv,
          [conversationId]: existing.map((m) =>
            m.id === tempId ? { ...m, status: "failed" } : m
          ),
        },
      };
    }),

  updateMessageStatus: (conversationId, messageId, status) =>
    set((s) => {
      const existing = s.messagesByConv[conversationId] ?? [];
      return {
        messagesByConv: {
          ...s.messagesByConv,
          [conversationId]: existing.map((m) =>
            m.id === messageId ? { ...m, status } : m
          ),
        },
      };
    }),

  setLoading: (conversationId, loading) =>
    set((s) => ({ loadingByConv: { ...s.loadingByConv, [conversationId]: loading } })),

  setError: (conversationId, error) =>
    set((s) => ({ errorByConv: { ...s.errorByConv, [conversationId]: error } })),

  setHasMore: (conversationId, hasMore) =>
    set((s) => ({ hasMoreByConv: { ...s.hasMoreByConv, [conversationId]: hasMore } })),

  setTypingUser: (conversationId, userId, username, isTyping) =>
    set((s) => {
      const current = { ...(s.typingByConv[conversationId] ?? {}) };
      if (isTyping) current[userId] = username;
      else delete current[userId];
      return { typingByConv: { ...s.typingByConv, [conversationId]: current } };
    }),

  getMessages: (conversationId) => get().messagesByConv[conversationId] ?? [],
  getTypingUsers: (conversationId) =>
    Object.values(get().typingByConv[conversationId] ?? {}),

  clearConversation: (conversationId) =>
    set((s) => {
      const { [conversationId]: _, ...rest } = s.messagesByConv;
      return { messagesByConv: rest };
    }),
}));
