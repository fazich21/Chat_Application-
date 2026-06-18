import Avatar from "../shared/Avatar.jsx";
import { ArrowLeftIcon, PhoneIcon, VideoIcon, InfoIcon, UsersIcon } from "../shared/icons.jsx";

/**
 * Top bar of the active conversation.
 * Pure UI — pass `conversation` object: { name, avatarSrc, status, isGroup, memberCount, subtitle }
 * `onBack` shown only on mobile (pass null to hide).
 */
export default function ChatHeader({ conversation, onBack, onOpenInfo, onCall, onVideoCall }) {
  if (!conversation) return null;

  const { name, avatarSrc, status, isGroup, memberCount, subtitle } = conversation;

  const statusLabel = isGroup
    ? `${memberCount ?? 0} members`
    : status === "online"
      ? "Active now"
      : subtitle ?? "Offline";

  return (
    <header className="flex items-center justify-between gap-3 border-b
                       border-surface-border bg-surface-raised/80 backdrop-blur-xl
                       px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Back button — mobile only */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl
                       text-gray-400 hover:bg-white/5 hover:text-white
                       transition-colors duration-150 md:hidden"
            aria-label="Back to conversations"
          >
            <ArrowLeftIcon className="size-5" />
          </button>
        )}

        <button
          onClick={onOpenInfo}
          className="flex items-center gap-3 min-w-0 rounded-xl px-1 py-1
                     hover:bg-white/[0.03] transition-colors duration-150 -ml-1"
        >
          <Avatar name={name} src={avatarSrc} size="md" status={isGroup ? undefined : status} />
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className={`truncate text-xs ${
              status === "online" && !isGroup ? "text-accent-mint" : "text-gray-500"
            }`}>
              {isGroup && <UsersIcon className="inline size-3 mr-1 -mt-0.5" />}
              {statusLabel}
            </p>
          </div>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onCall}
          className="flex size-9 items-center justify-center rounded-xl
                     text-gray-400 hover:bg-white/5 hover:text-white
                     transition-colors duration-150"
          aria-label="Voice call"
        >
          <PhoneIcon className="size-[18px]" />
        </button>
        <button
          onClick={onVideoCall}
          className="hidden sm:flex size-9 items-center justify-center rounded-xl
                     text-gray-400 hover:bg-white/5 hover:text-white
                     transition-colors duration-150"
          aria-label="Video call"
        >
          <VideoIcon className="size-[18px]" />
        </button>
        <button
          onClick={onOpenInfo}
          className="flex size-9 items-center justify-center rounded-xl
                     text-gray-400 hover:bg-white/5 hover:text-white
                     transition-colors duration-150"
          aria-label="Conversation info"
        >
          <InfoIcon className="size-[18px]" />
        </button>
      </div>
    </header>
  );
}
