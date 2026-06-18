import Avatar from "../shared/Avatar.jsx";

/**
 * Shows "X is typing…" bubble with animated dots, in the message stream.
 * Pass `users` array of names; renders avatar for the first user (group chats).
 */
export default function TypingIndicator({ users = [] }) {
  if (users.length === 0) return null;

  const label =
    users.length === 1
      ? `${users[0]} is typing…`
      : users.length === 2
        ? `${users[0]} and ${users[1]} are typing…`
        : `${users.length} people are typing…`;

  return (
    <div className="flex items-center gap-2 px-4 animate-fade-in">
      <div className="w-8 shrink-0">
        <Avatar name={users[0]} size="sm" />
      </div>
      <div className="glass flex items-center gap-1.5 rounded-2xl rounded-bl-md px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-gray-400 animate-bounce-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 hidden sm:inline">{label}</span>
    </div>
  );
}
