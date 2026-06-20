import Avatar from "../shared/Avatar.jsx";
import VoiceMessagePlayer from "./VoiceMessagePlayer.jsx";
import { CheckIcon, DoubleCheckIcon, ClockIcon, AlertCircleIcon, RefreshIcon } from "../shared/icons.jsx";

export default function MessageBubble({
  content, imageUrl, audioUrl, audioDuration, time, isOwn = false, status, onRetry,
  senderName, senderAvatar, showAvatar = true, showTail = true, replyTo,
}) {
  const StatusIcon = { sending: ClockIcon, sent: CheckIcon, delivered: CheckIcon, seen: DoubleCheckIcon }[status];
  const isFailed = status === "failed";

  return (
    <div className={`flex w-full gap-2 px-4 animate-slide-up ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && (
        <div className="w-8 shrink-0">
          {showAvatar && senderName && <Avatar name={senderName} src={senderAvatar} size="sm"/>}
        </div>
      )}

      <div className={`flex max-w-[75%] sm:max-w-[60%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && senderName && showAvatar && (
          <p className="mb-1 px-1 text-xs font-medium text-brand-500">{senderName}</p>
        )}

        {replyTo && (
          <div className={`mb-1 max-w-full rounded-xl border-l-2 px-3 py-1.5 text-xs
                          ${isOwn
                            ? "border-white/30 bg-white/20 text-white/70"
                            : "border-brand-400/50 bg-black/5 dark:bg-white/[0.03] text-surface-muted"}`}>
            <p className="font-medium opacity-80">{replyTo.senderName}</p>
            <p className="truncate opacity-70">{replyTo.content}</p>
          </div>
        )}

        <div className="flex items-end gap-1.5">
          {isFailed && onRetry && (
            <button onClick={onRetry}
              className="flex size-7 items-center justify-center rounded-full
                         bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              title="Retry">
              <RefreshIcon className="size-3.5"/>
            </button>
          )}

          <div className={`relative px-3.5 py-2.5 shadow-message
                           ${isFailed
                             ? "border border-red-400/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 rounded-2xl"
                             : isOwn
                               ? `bg-gradient-bubble text-white
                                  ${showTail ? "rounded-2xl rounded-br-md" : "rounded-2xl"}`
                               : `bg-white dark:bg-surface-overlay border border-surface-border text-surface-primary
                                  ${showTail ? "rounded-2xl rounded-bl-md" : "rounded-2xl"}`}`}>
            {imageUrl && (
              <img src={imageUrl} alt="Shared image"
                   className="mb-1.5 max-h-72 w-full rounded-lg object-cover"/>
            )}
            {audioUrl && (
              <VoiceMessagePlayer src={audioUrl} duration={audioDuration} isOwn={isOwn} />
            )}
            {content && (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{content}</p>
            )}
            <div className={`mt-1 flex items-center justify-end gap-1
                            ${isFailed ? "text-red-400"
                              : isOwn ? "text-white/70"
                              : "text-surface-muted"}`}>
              {isFailed ? (
                <>
                  <AlertCircleIcon className="size-3.5"/>
                  <span className="text-[10px]">Failed</span>
                </>
              ) : (
                <>
                  <span className="text-[10px]">{time}</span>
                  {isOwn && StatusIcon && (
                    <StatusIcon className={`size-3.5 ${status === "seen" ? "text-cyan-200" : ""}
                                           ${status === "sending" ? "animate-spin-slow" : ""}`}/>
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
