import Avatar from "../shared/Avatar.jsx";
import { ArrowLeftIcon, PhoneIcon, VideoIcon, InfoIcon, UsersIcon } from "../shared/icons.jsx";

export default function ChatHeader({
  conversation, onBack, onOpenInfo, onStartCall, onStartVideoCall,
}) {
  if (!conversation) return null;
  const { name, avatarSrc, status, isGroup, memberCount, subtitle } = conversation;

  const statusLabel = isGroup
    ? `${memberCount ?? 0} members`
    : status === "online" ? "Active now" : subtitle ?? "Offline";

  return (
    <header className="flex items-center justify-between gap-3 border-b border-surface-border
                       bg-surface-raised/90 backdrop-blur-xl px-4 py-3 transition-colors duration-200">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button onClick={onBack}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl
                       text-surface-secondary hover:bg-black/5 dark:hover:bg-white/5
                       transition-colors md:hidden">
            <ArrowLeftIcon className="size-5"/>
          </button>
        )}
        <button onClick={onOpenInfo}
          className="flex items-center gap-3 min-w-0 rounded-xl px-1 py-1
                     hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors -ml-1">
          <Avatar name={name} src={avatarSrc} size="md" status={isGroup ? undefined : status}/>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-surface-primary">{name}</p>
            <p className={`truncate text-xs ${
              status === "online" && !isGroup ? "text-accent-mint" : "text-surface-muted"
            }`}>
              {isGroup && <UsersIcon className="inline size-3 mr-1 -mt-0.5"/>}
              {statusLabel}
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-1">
        {/* Voice call — only for direct chats */}
        {!isGroup && (
          <button
            onClick={onStartCall}
            className="flex size-9 items-center justify-center rounded-xl
                       text-surface-secondary hover:bg-black/5 dark:hover:bg-white/5
                       hover:text-brand-500 transition-colors"
            aria-label="Voice call"
          >
            <PhoneIcon className="size-[18px]"/>
          </button>
        )}

        {/* Video call — only for direct chats */}
        {!isGroup && (
          <button
            onClick={onStartVideoCall}
            className="hidden sm:flex size-9 items-center justify-center rounded-xl
                       text-surface-secondary hover:bg-black/5 dark:hover:bg-white/5
                       hover:text-brand-500 transition-colors"
            aria-label="Video call"
          >
            <VideoIcon className="size-[18px]"/>
          </button>
        )}

        <button
          onClick={onOpenInfo}
          className="flex size-9 items-center justify-center rounded-xl
                     text-surface-secondary hover:bg-black/5 dark:hover:bg-white/5
                     transition-colors"
          aria-label="Info"
        >
          <InfoIcon className="size-[18px]"/>
        </button>
      </div>
    </header>
  );
}
