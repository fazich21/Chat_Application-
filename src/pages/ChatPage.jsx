import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useConversations } from "../hooks/useConversations.js";
import { useMessages } from "../hooks/useMessages.js";
import { useTyping } from "../hooks/useTyping.js";
import { usePresence } from "../hooks/usePresence.js";
import { useCall } from "../hooks/useCall.js";
import { useConversationStore } from "../store/conversationStore.js";
import {
  fetchConversationDetail,
  findOrCreateDirectConversation,
} from "../services/conversationService.js";
import { uploadChatImage, uploadChatAudio } from "../services/storageService.js";
import { buildMessageListItems } from "../utils/messageTransform.js";
import { formatLastSeen } from "../utils/formatDate.js";
import ChatLayout from "../components/layout/ChatLayout.jsx";
import CallOverlay from "../components/chat/CallOverlay.jsx";
import NewChatModal from "../components/conversation/NewChatModal.jsx";
import CreateGroupModal from "../components/conversation/CreateGroupModal.jsx";
import GroupInfoPanel from "../components/conversation/GroupInfoPanel.jsx";

export default function ChatPage() {
  const { user, profile, logout } = useAuth();
  const { toggle: toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { id: conversationId } = useParams();

  const [activeDetail, setActiveDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const fileInputRef = useRef(null);

  /* ── presence ── */
  const { onlineUserIds } = usePresence(user?.id);

  /* ── conversation list ── */
  const {
    conversations, loading: conversationsLoading,
    error: conversationsError, markRead,
  } = useConversations(user?.id);

  const { setActiveId } = useConversationStore();
  useEffect(() => { setActiveId(conversationId ?? null); }, [conversationId, setActiveId]);

  /* ── active conversation detail ── */
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

  useEffect(() => {
    if (conversationId) markRead(conversationId);
  }, [conversationId, markRead]);

  /* ── live presence merge ── */
  const liveActiveDetail = useMemo(() => {
    if (!activeDetail || activeDetail.isGroup) return activeDetail;
    const isOnline = onlineUserIds.includes(activeDetail.otherUserId);
    return {
      ...activeDetail,
      status:   isOnline ? "online" : "offline",
      subtitle: isOnline ? "Active now" : formatLastSeen(activeDetail.lastSeenAt),
    };
  }, [activeDetail, onlineUserIds]);

  const liveConversations = useMemo(() =>
    conversations.map((c) =>
      c.isGroup ? c : {
        ...c,
        status: onlineUserIds.includes(c.otherUserId) ? "online" : "offline",
      }
    ), [conversations, onlineUserIds]
  );

  /* ── messages ── */
  const {
    messages: rawMessages,
    loading: messagesLoading,
    error: messagesError,
    hasMore: messagesHasMore,
    seenByMessageId,
    sendMessage, sendImage, sendAudio, loadOlder, clearError,
  } = useMessages(conversationId, user?.id);

  /* ── typing ── */
  const { notifyTyping, typingUsers } = useTyping(
    conversationId, user?.id, profile?.username
  );

  /* ── calls ── */
  const {
    callState, roomUrl, isVideo, callerName, error: callError,
    isCreatingRoom, startCall, acceptCall, rejectCall, endCall,
  } = useCall(
    conversationId,
    user?.id,
    liveActiveDetail?.otherUserId,
    profile?.username ?? "Someone"
  );

  /* ── message items ── */
  const messageItems = useMemo(() => {
    if (!conversationId) return [];
    const otherMemberIds = liveActiveDetail?.isGroup
      ? (liveActiveDetail.members ?? []).filter((m) => m.user_id !== user?.id).map((m) => m.user_id)
      : liveActiveDetail?.otherUserId ? [liveActiveDetail.otherUserId] : [];
    return buildMessageListItems({
      messages: rawMessages,
      currentUserId: user?.id,
      seenByMessageId,
      otherMemberIds,
      isGroup: !!liveActiveDetail?.isGroup,
    });
  }, [rawMessages, user?.id, seenByMessageId, liveActiveDetail]);

  /* ── handlers ── */
  const handleSelectConversation = useCallback((id) => navigate(`/chat/${id}`), [navigate]);
  const handleBack = useCallback(() => navigate("/chat"), [navigate]);

  const handleSend = useCallback(async (text) => {
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
    if (text.trim()) sendMessage(text, profile);
  }, [imageFile, conversationId, user, profile, sendImage, sendMessage]);

  const handleSendAudio = useCallback(async (audioBlob, duration) => {
    if (!audioBlob || !conversationId || !user?.id) return;
    setAudioUploading(true);
    try {
      const url = await uploadChatAudio(audioBlob, conversationId, user.id);
      await sendAudio(url, duration, profile);
    } catch (err) {
      console.error("Audio upload failed:", err.message);
    } finally {
      setAudioUploading(false);
    }
  }, [conversationId, user, profile, sendAudio]);

  const handleRetry = useCallback((messageId) => {
    const failed = rawMessages.find((m) => m.id === messageId);
    if (failed) sendMessage(failed.content, profile);
  }, [rawMessages, sendMessage, profile]);

  const handleAttachImage = useCallback(() => fileInputRef.current?.click(), []);
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview({ url: URL.createObjectURL(file), name: file.name });
    e.target.value = "";
  }, []);
  const handleRemoveImage = useCallback(
    () => { setImageFile(null); setImagePreview(null); }, []
  );

  const handleSelectUser = useCallback(async (otherUserId) => {
    setNewChatOpen(false);
    try {
      const convId = await findOrCreateDirectConversation(user.id, otherUserId);
      navigate(`/chat/${convId}`);
    } catch (err) {
      console.error("Failed to start conversation:", err.message);
    }
  }, [user, navigate]);

  const handleGroupCreated = useCallback((convId) => {
    setNewGroupOpen(false);
    navigate(`/chat/${convId}`);
  }, [navigate]);

  const handleGroupLeft = useCallback(() => {
    setGroupInfoOpen(false);
    navigate("/chat");
  }, [navigate]);

  useEffect(() => { setGroupInfoOpen(false); }, [conversationId]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*"
             className="hidden" onChange={handleFileChange}/>

      {/* Call error toast */}
      {callError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-pop-in">
          <div className="flex items-center gap-2.5 rounded-xl bg-surface-raised
                          border border-surface-border shadow-glass px-4 py-2.5">
            <svg className="size-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.625 6.375h.008v.008h-.008z"/>
            </svg>
            <p className="text-sm text-surface-primary">{callError}</p>
          </div>
        </div>
      )}

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
          name:      profile?.username ?? "You",
          avatarSrc: profile?.avatar_url,
          status:    "online",
        }}
        onSelectConversation={handleSelectConversation}
        onBack={handleBack}
        onSend={handleSend}
        onTyping={notifyTyping}
        onLoadMoreMessages={loadOlder}
        onRetryMessage={handleRetry}
        onDismissError={clearError}
        onNewChat={() => setNewChatOpen(true)}
        onNewGroup={() => setNewGroupOpen(true)}
        onOpenSettings={() => navigate("/settings")}
        onLogout={handleLogout}
        onToggleTheme={toggleTheme}
        isDark={isDark}
        onOpenInfo={() => liveActiveDetail?.isGroup && setGroupInfoOpen(true)}
        onStartCall={() => startCall(false)}
        onStartVideoCall={() => startCall(true)}
        onAttachImage={handleAttachImage}
        imagePreview={imagePreview}
        onRemoveImage={handleRemoveImage}
        imageUploading={imageUploading}
        onSendAudio={handleSendAudio}
        audioUploading={audioUploading}
      />

      {/* Call overlay — renders on top of everything when a call is active */}
      <CallOverlay
        callState={callState}
        roomUrl={roomUrl}
        isVideo={isVideo}
        callerName={callerName}
        otherUserName={liveActiveDetail?.name ?? ""}
        otherUserAvatar={liveActiveDetail?.avatarSrc}
        currentUserName={profile?.username ?? "Pulse User"}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
      />

      <NewChatModal
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSelectUser={handleSelectUser}
        currentUserId={user?.id}
      />

      <CreateGroupModal
        open={newGroupOpen}
        onClose={() => setNewGroupOpen(false)}
        onCreated={handleGroupCreated}
        currentUserId={user?.id}
      />

      <GroupInfoPanel
        open={groupInfoOpen && !!liveActiveDetail?.isGroup}
        onClose={() => setGroupInfoOpen(false)}
        conversationId={conversationId}
        currentUserId={user?.id}
        onLeft={handleGroupLeft}
      />
    </>
  );
}
