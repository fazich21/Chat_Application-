import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useConversations } from "../hooks/useConversations.js";
import { useMessages } from "../hooks/useMessages.js";
import { useTyping } from "../hooks/useTyping.js";
import { usePresence } from "../hooks/usePresence.js";
import { useConversationStore } from "../store/conversationStore.js";
import {
  fetchConversationDetail,
  findOrCreateDirectConversation,
} from "../services/conversationService.js";
import { uploadChatImage } from "../services/storageService.js";
import { buildMessageListItems } from "../utils/messageTransform.js";
import { formatLastSeen } from "../utils/formatDate.js";
import ChatLayout from "../components/layout/ChatLayout.jsx";
import NewChatModal from "../components/conversation/NewChatModal.jsx";

export default function ChatPage() {
  const { user, profile, logout } = useAuth();
  const { toggle: toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { id: conversationId } = useParams();

  const [activeDetail, setActiveDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  /* ── presence: mark self online for the session, track who else is online ── */
  const { onlineUserIds } = usePresence(user?.id);

  /* ── conversation list (live) ── */
  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    markRead,
  } = useConversations(user?.id);

  const { setActiveId } = useConversationStore();

  useEffect(() => {
    setActiveId(conversationId ?? null);
  }, [conversationId, setActiveId]);

  /* ── load active conversation's header detail ── */
  useEffect(() => {
    if (!conversationId || !user?.id) { setActiveDetail(null); return; }
    let cancelled = false;
    setDetailLoading(true);
    fetchConversationDetail(conversationId, user.id)
      .then((d) => { if (!cancelled) setActiveDetail(d); })
      .catch(() => { if (!cancelled) setActiveDetail(null); })
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [conversationId, user?.id]);

  // Mark conversation as read once opened
  useEffect(() => {
    if (conversationId) markRead(conversationId);
  }, [conversationId, markRead]);

  /* ── merge live presence into the header's status/last-seen display ──
     activeDetail's `status` is a snapshot from the DB at load time; without
     this, the header never reflects the other user coming online/offline
     or updates "last seen" while you're looking at the conversation. */
  const liveActiveDetail = useMemo(() => {
    if (!activeDetail || activeDetail.isGroup) return activeDetail;

    const isOnline = onlineUserIds.includes(activeDetail.otherUserId);
    return {
      ...activeDetail,
      status: isOnline ? "online" : "offline",
      subtitle: isOnline
        ? "Active now"
        : formatLastSeen(activeDetail.lastSeenAt),
    };
  }, [activeDetail, onlineUserIds]);

  /* ── messages (history + realtime + send) ── */
  const {
    messages: rawMessages,
    loading: messagesLoading,
    error: messagesError,
    hasMore: messagesHasMore,
    seenByMessageId,
    sendMessage,
    sendImage,
    loadOlder,
    clearError,
  } = useMessages(conversationId, user?.id);

  /* ── typing indicator channel ── */
  const { notifyTyping, typingUsers } = useTyping(conversationId, user?.id, profile?.username);

  /* ── transform raw rows into MessageList items (dividers, grouping, seen ticks) ── */
  const messageItems = useMemo(() => {
    if (!conversationId) return [];
    const otherMemberIds = activeDetail?.isGroup
      ? (activeDetail.members ?? []).filter((m) => m.user_id !== user?.id).map((m) => m.user_id)
      : activeDetail?.otherUserId ? [activeDetail.otherUserId] : [];

    return buildMessageListItems({
      messages: rawMessages,
      currentUserId: user?.id,
      seenByMessageId,
      otherMemberIds,
      isGroup: !!activeDetail?.isGroup,
    });
  }, [rawMessages, user?.id, seenByMessageId, activeDetail]);

  /* ── merge live presence into sidebar conversation statuses ── */
  const liveConversations = useMemo(
    () =>
      conversations.map((c) =>
        c.isGroup ? c : { ...c, status: onlineUserIds.includes(c.otherUserId) ? "online" : "offline" }
      ),
    [conversations, onlineUserIds]
  );

  /* ── navigation handlers ── */
  const handleSelectConversation = useCallback((id) => navigate(`/chat/${id}`), [navigate]);
  const handleBack = useCallback(() => navigate("/chat"), [navigate]);

  /* ── send text ── */
  const handleSend = useCallback(
    async (text) => {
      if (imageFile) {
        setImageUploading(true);
        try {
          const url = await uploadChatImage(imageFile, conversationId, user.id);
          await sendImage(url, text || null, profile);
        } catch (err) {
          console.error("Image upload failed:", err.message);
        } finally {
          setImageUploading(false);
          setImageFile(null);
          setImagePreview(null);
        }
        return;
      }
      if (text.trim()) {
        sendMessage(text, profile);
      }
    },
    [imageFile, conversationId, user, profile, sendImage, sendMessage]
  );

  const handleRetry = useCallback(
    (messageId) => {
      const failed = rawMessages.find((m) => m.id === messageId);
      if (failed) sendMessage(failed.content, profile);
    },
    [rawMessages, sendMessage, profile]
  );

  /* ── image attach ── */
  const handleAttachImage = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview({ url: URL.createObjectURL(file), name: file.name });
    e.target.value = "";
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
  }, []);

  /* ── new chat ── */
  const handleSelectUser = useCallback(
    async (otherUserId) => {
      setNewChatOpen(false);
      try {
        const convId = await findOrCreateDirectConversation(user.id, otherUserId);
        navigate(`/chat/${convId}`);
      } catch (err) {
        console.error("Failed to start conversation:", err.message);
      }
    },
    [user, navigate]
  );

  /* ── logout ── */
  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <ChatLayout
        conversations={liveConversations}
        conversationsLoading={conversationsLoading}
        conversationsError={conversationsError}
        activeId={conversationId}
        activeConversation={liveActiveDetail}
        messages={messageItems}
        messagesLoading={detailLoading || (!!conversationId && messagesLoading)}
        messagesLoadingMore={false}
        messagesHasMore={messagesHasMore}
        messagesError={messagesError}
        typingUsers={typingUsers}
        currentUser={{
          name: profile?.username ?? "You",
          avatarSrc: profile?.avatar_url,
          status: "online",
        }}
        onSelectConversation={handleSelectConversation}
        onBack={handleBack}
        onSend={handleSend}
        onTyping={notifyTyping}
        onLoadMoreMessages={loadOlder}
        onRetryMessage={handleRetry}
        onDismissError={clearError}
        onNewChat={() => setNewChatOpen(true)}
        onOpenSettings={() => navigate("/settings")}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
        isDark={isDark}
        onOpenInfo={() => {}}
        onAttachImage={handleAttachImage}
        imagePreview={imagePreview}
        onRemoveImage={handleRemoveImage}
        imageUploading={imageUploading}
      />

      <NewChatModal
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSelectUser={handleSelectUser}
        currentUserId={user?.id}
      />
    </>
  );
}
