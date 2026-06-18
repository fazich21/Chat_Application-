import { create } from "zustand";

export const useConversationStore = create((set, get) => ({
  conversations:    [],
  activeId:         null,
  loading:          true,
  error:            null,
  onlineUserIds:    [],

  setConversations: (conversations) => set({ conversations }),

  upsertConversation: (conv) =>
    set((s) => {
      const exists = s.conversations.some((c) => c.id === conv.id);
      return {
        conversations: exists
          ? s.conversations.map((c) => (c.id === conv.id ? { ...c, ...conv } : c))
          : [conv, ...s.conversations],
      };
    }),

  /** Bump a conversation's preview (last message + time + unread) after a new message arrives */
  touchConversation: (conversationId, { lastMessage, time, lastMessageAt, incrementUnread }) =>
    set((s) => ({
      conversations: s.conversations
        .map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: lastMessage ?? c.lastMessage,
                time: time ?? c.time,
                lastMessageAt: lastMessageAt ?? c.lastMessageAt,
                unreadCount: incrementUnread ? (c.unreadCount ?? 0) + 1 : c.unreadCount,
              }
            : c
        )
        .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)),
    })),

  clearUnread: (conversationId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    })),

  setActiveId:  (id)      => set({ activeId: id }),
  setLoading:   (loading) => set({ loading }),
  setError:     (error)   => set({ error }),
  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),

  getActiveConversation: () => {
    const { conversations, activeId } = get();
    return conversations.find((c) => c.id === activeId) ?? null;
  },
}));
