import Sidebar from "./Sidebar.jsx";
import ChatHeader from "../chat/ChatHeader.jsx";
import MessageList from "../chat/MessageList.jsx";
import MessageInput from "../chat/MessageInput.jsx";
import EmptyState from "../chat/EmptyState.jsx";
import ChatErrorBanner from "../chat/ChatErrorBanner.jsx";

/**
 * Top-level responsive shell for the chat application.
 *
 * Desktop (md+): sidebar + chat window side by side, always both visible.
 * Mobile: single panel — sidebar OR chat window, slides in/out based on
 *         whether a conversation is active.
 */
export default function ChatLayout({
  conversations = [],
  conversationsLoading = false,
  conversationsError = null,
  activeId,
  activeConversation,
  messages = [],
  messagesLoading = false,
  messagesLoadingMore = false,
  messagesHasMore = false,
  messagesError = null,
  typingUsers = [],
  currentUser,
  onSelectConversation,
  onBack,
  onSend,
  onTyping,
  onLoadMoreMessages,
  onRetryMessage,
  onDismissError,
  onNewChat,
  onOpenSettings,
  onLogout,
  onToggleTheme,
  isDark = true,
  onOpenInfo,
  onAttachImage,
  imagePreview,
  onRemoveImage,
  imageUploading = false,
  sendDisabled = false,
}) {
  const showChatOnMobile = !!activeId;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-base">
      {/* ── Sidebar ── */}
      <div
        className={`h-full w-full shrink-0 md:w-[360px] lg:w-[400px]
                    ${showChatOnMobile ? "hidden md:flex" : "flex"}`}
      >
        <Sidebar
          conversations={conversations}
          loading={conversationsLoading}
          error={conversationsError}
          activeId={activeId}
          onSelect={onSelectConversation}
          currentUser={currentUser}
          onNewChat={onNewChat}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
          onToggleTheme={onToggleTheme}
          isDark={isDark}
        />
      </div>

      {/* ── Chat window ── */}
      <div
        className={`relative h-full flex-1 flex-col
                    ${showChatOnMobile ? "flex animate-slide-in-right md:animate-none" : "hidden md:flex"}`}
      >
        {/* Ambient gradient backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-40" />

        {activeConversation ? (
          <div className="relative z-10 flex h-full flex-col">
            <ChatHeader
              conversation={activeConversation}
              onBack={() => onBack?.()}
              onOpenInfo={onOpenInfo}
            />
            <MessageList
              items={messages}
              typingUsers={typingUsers}
              loading={messagesLoading}
              loadingMore={messagesLoadingMore}
              hasMore={messagesHasMore}
              onLoadMore={onLoadMoreMessages}
              onRetryMessage={onRetryMessage}
            />
            <ChatErrorBanner message={messagesError} onDismiss={onDismissError} />
            <MessageInput
              onSend={onSend}
              onTyping={onTyping}
              onAttachImage={onAttachImage}
              imagePreview={imagePreview}
              onRemoveImage={onRemoveImage}
              placeholder={`Message ${activeConversation.name}`}
              disabled={sendDisabled || imageUploading}
            />
          </div>
        ) : (
          <div className="relative z-10 h-full">
            <EmptyState onNewChat={onNewChat} />
          </div>
        )}
      </div>
    </div>
  );
}
