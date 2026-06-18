import Avatar from "../shared/Avatar.jsx";
import { CheckIcon, DoubleCheckIcon, ClockIcon, AlertCircleIcon, RefreshIcon } from "../shared/icons.jsx";

/**
 * A single chat message bubble.
 *
 * Props:
 *  - content (text)
 *  - imageUrl (optional — renders image message)
 *  - time (string, e.g. "2:34 PM")
 *  - isOwn (bool) — sent by current user → right-aligned gradient bubble
 *  - status: "sending" | "sent" | "delivered" | "seen" | "failed" (own messages only)
 *  - onRetry — called when a failed message's retry button is clicked
 *  - senderName, senderAvatar — shown for group chats on others' messages
 *  - showAvatar (bool) — show avatar (first message in a consecutive group)
 *  - showTail (bool) — slightly larger corner radius break (last in group)
 *  - replyTo: { senderName, content } | undefined
 */
export default function MessageBubble({
  content,
  imageUrl,
  time,
  isOwn = false,
  status,
  onRetry,
  senderName,
  senderAvatar,
  showAvatar = true,
  showTail = true,
  replyTo,
}) {
  const StatusIcon = {
    sending:   ClockIcon,
    sent:      CheckIcon,
    delivered: CheckIcon,
    seen:      DoubleCheckIcon,
  }[status];

  const isFailed = status === "failed";

  return (
    <div className={`flex w-full gap-2 px-4 animate-slide-up ${isOwn ? "justify-end" : "justify-start"}`}>
      {/* Avatar (others only, group chats) */}
      {!isOwn && (
        <div className="w-8 shrink-0">
          {showAvatar && senderName && (
            <Avatar name={senderName} src={senderAvatar} size="sm" />
          )}
        </div>
      )}

      <div className={`flex max-w-[75%] sm:max-w-[60%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name (group chats, others only) */}
        {!isOwn && senderName && showAvatar && (
          <p className="mb-1 px-1 text-xs font-medium text-brand-400">{senderName}</p>
        )}

        {/* Reply preview */}
        {replyTo && (
          <div className={`mb-1 max-w-full rounded-xl border-l-2 px-3 py-1.5 text-xs
                          ${isOwn
                            ? "border-white/30 bg-white/10 text-white/70"
                            : "border-brand-500/50 bg-white/[0.03] text-gray-400"}`}>
            <p className="font-medium opacity-80">{replyTo.senderName}</p>
            <p className="truncate opacity-70">{replyTo.content}</p>
          </div>
        )}

        <div className="flex items-end gap-1.5">
          {/* Retry button for failed own-messages */}
          {isFailed && onRetry && (
            <button
              onClick={onRetry}
              className="flex size-7 shrink-0 items-center justify-center rounded-full
                         bg-red-500/10 text-red-400 hover:bg-red-500/20
                         transition-colors duration-150"
              aria-label="Retry sending message"
              title="Failed to send — tap to retry"
            >
              <RefreshIcon className="size-3.5" />
            </button>
          )}

          {/* Bubble */}
          <div
            className={`relative px-3.5 py-2.5 shadow-message
                        ${isFailed
                          ? "border border-red-500/40 bg-red-500/10 text-gray-100 rounded-2xl"
                          : isOwn
                            ? `bg-gradient-bubble text-white
                               ${showTail ? "rounded-2xl rounded-br-md" : "rounded-2xl"}`
                            : `glass text-gray-100
                               ${showTail ? "rounded-2xl rounded-bl-md" : "rounded-2xl"}`}`}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Shared image"
                className="mb-1.5 max-h-72 w-full rounded-lg object-cover"
              />
            )}
            {content && (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {content}
              </p>
            )}

            {/* Time + status, inline at bottom-right */}
            <div className={`mt-1 flex items-center justify-end gap-1
                            ${isFailed ? "text-red-400" : isOwn ? "text-white/70" : "text-gray-500"}`}>
              {isFailed ? (
                <>
                  <AlertCircleIcon className="size-3.5" />
                  <span className="text-[10px]">Failed to send</span>
                </>
              ) : (
                <>
                  <span className="text-[10px]">{time}</span>
                  {isOwn && StatusIcon && (
                    <StatusIcon
                      className={`size-3.5 ${status === "seen" ? "text-cyan-200" : ""}
                                  ${status === "sending" ? "animate-spin-slow" : ""}`}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
