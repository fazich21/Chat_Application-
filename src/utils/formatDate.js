/**
 * Returns a friendly time string for chat timestamps.
 * - Same day     → "2:34 PM"
 * - Yesterday    → "Yesterday"
 * - This week    → "Monday"
 * - Older        → "12 Jan"
 */
export function formatMessageTime(dateString) {
  const date = new Date(dateString);
  const now  = new Date();

  const isToday     = isSameDay(date, now);
  const isYesterday = isSameDay(date, new Date(now - 86_400_000));
  const isThisWeek  = now - date < 7 * 86_400_000;

  if (isToday)     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isYesterday) return "Yesterday";
  if (isThisWeek)  return date.toLocaleDateString([], { weekday: "long" });
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

/** Returns a full datetime string for tooltips (e.g. "Monday, 12 January at 2:34 PM") */
export function formatFullDate(dateString) {
  return new Date(dateString).toLocaleString([], {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    hour:    "2-digit",
    minute:  "2-digit",
  });
}

/** Returns "last seen X ago" string */
export function formatLastSeen(dateString) {
  if (!dateString) return "a while ago";
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);

  if (seconds < 60)              return "just now";
  if (seconds < 3_600)           return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400)          return `${Math.floor(seconds / 3_600)}h ago`;
  if (seconds < 7 * 86_400)      return `${Math.floor(seconds / 86_400)}d ago`;
  return new Date(dateString).toLocaleDateString([], { day: "numeric", month: "short" });
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}
