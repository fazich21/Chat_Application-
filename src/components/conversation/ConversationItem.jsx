import Avatar from "../shared/Avatar.jsx";
import { DoubleCheckIcon, CheckIcon } from "../shared/icons.jsx";

/**
 * Single row in the conversation list.
 *
 * Props (all UI-only, no data fetching):
 *  - name, avatarSrc, lastMessage, time
 *  - unreadCount (number, 0 = hide badge)
 *  - active (bool) — highlighted state
 *  - status: "online" | "away" | "offline"
 *  - isGroup (bool)
 *  - isTyping (bool) — shows "typing…" instead of lastMessage
 *  - seenStatus: "sent" | "delivered" | "seen" | undefined (only for own last message)
 *  - onClick
 */
export default function ConversationItem({
  name,
  avatarSrc,
  lastMessage,
  time,
  unreadCount = 0,
  active = false,
  status,
  isGroup = false,
  isTyping = false,
  seenStatus,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3
                  text-left transition-all duration-150
                  ${active
                    ? "bg-gradient-active glass"
                    : "hover:bg-white/[0.03]"}`}
    >
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full
                         bg-gradient-bubble" />
      )}

      <Avatar name={name} src={avatarSrc} size="lg" status={isGroup ? undefined : status} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`truncate text-sm font-medium ${
            active ? "text-white" : "text-gray-200"
          }`}>
            {name}
          </p>
          <span className={`shrink-0 text-[11px] ${
            unreadCount > 0 ? "text-accent-mint font-medium" : "text-gray-500"
          }`}>
            {time}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          {isTyping ? (
            <p className="flex items-center gap-1 text-xs text-accent-mint">
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1 rounded-full bg-accent-mint animate-bounce-dot"
                    style={{ animationDelay: `${i * 0.16}s` }}
                  />
                ))}
              </span>
              typing…
            </p>
          ) : (
            <p className="truncate text-xs text-gray-400 flex items-center gap-1">
              {seenStatus && (
                seenStatus === "seen"
                  ? <DoubleCheckIcon className="size-3.5 text-brand-400 shrink-0" />
                  : <CheckIcon className="size-3.5 text-gray-500 shrink-0" />
              )}
              <span className="truncate">{lastMessage}</span>
            </p>
          )}

          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center
                            rounded-full bg-gradient-bubble px-1.5 text-[11px]
                            font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
