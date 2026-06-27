import Sidebar from "./Sidebar.jsx";
import ChatHeader from "../chat/ChatHeader.jsx";
import MessageList from "../chat/MessageList.jsx";
import MessageInput from "../chat/MessageInput.jsx";
import EmptyState from "../chat/EmptyState.jsx";
import ChatErrorBanner from "../chat/ChatErrorBanner.jsx";

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
  onNewGroup,
  onOpenSettings,
  onLogout,
  onToggleTheme,
  isDark = true,
  onOpenInfo,
  onStartCall,
  onStartVideoCall,
  onAttachImage,
  imagePreview,
  onRemoveImage,
  imageUploading = false,
  onSendAudio,
  audioUploading = false,
  sendDisabled = false,
}) {
  const showChatOnMobile = !!activeId;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-base transition-colors duration-200">

      {/* Sidebar */}
      <div className={`h-full w-full shrink-0 md:w-[360px] lg:w-[400px]
                       ${showChatOnMobile ? "hidden md:flex" : "flex"}`}>
        <Sidebar
          conversations={conversations}
          loading={conversationsLoading}
          error={conversationsError}
          activeId={activeId}
          onSelect={onSelectConversation}
          currentUser={currentUser}
          onNewChat={onNewChat}
          onNewGroup={onNewGroup}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
          onToggleTheme={onToggleTheme}
          isDark={isDark}
        />
      </div>

      {/* Chat window */}
      <div className={`relative h-full flex-1 flex-col
                       ${showChatOnMobile ? "flex animate-slide-in-right md:animate-none" : "hidden md:flex"}`}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-30"/>

        {activeConversation ? (
          <div className="relative z-10 flex h-full flex-col">
            <ChatHeader
              conversation={activeConversation}
              onBack={() => onBack?.()}
              onOpenInfo={onOpenInfo}
              onStartCall={onStartCall}
              onStartVideoCall={onStartVideoCall}
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
            <ChatErrorBanner message={messagesError} onDismiss={onDismissError}/>
            <MessageInput
              onSend={onSend}
              onTyping={onTyping}
              onAttachImage={onAttachImage}
              imagePreview={imagePreview}
              onRemoveImage={onRemoveImage}
              onSendAudio={onSendAudio}
              audioUploading={audioUploading}
              placeholder={`Message ${activeConversation.name}`}
              disabled={sendDisabled || imageUploading}
            />
          </div>
        ) : (
          <div className="relative z-10 h-full">
            <EmptyState onNewChat={onNewChat}/>
          </div>
        )}
      </div>
    </div>
  );
}
