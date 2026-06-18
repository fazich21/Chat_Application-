import { useRef, useEffect, useState, useCallback } from "react";
import MessageBubble from "./MessageBubble.jsx";
import DateDivider from "./DateDivider.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

/**
 * Scrollable message stream.
 *
 * `items` — array of either:
 *   { type: "divider", label: "Today" }
 *   { type: "message", ...MessageBubble props, id }
 *
 * `typingUsers` — array of names currently typing
 * `loading` — initial history load spinner
 * `loadingMore` — older-messages pagination spinner (shown at top)
 * `onLoadMore` — called when user scrolls near the top (if hasMore)
 * `hasMore` — whether older messages exist
 * `onRetryMessage(messageId)` — called when a failed message's retry is tapped
 *
 * Auto-scrolls to bottom on new messages, but only if the user was already
 * near the bottom (so it doesn't yank them down while reading history).
 */
export default function MessageList({
  items = [],
  typingUsers = [],
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  onRetryMessage,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const prevItemCount = useRef(items.length);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsNearBottom(distanceFromBottom < 120);

    if (el.scrollTop < 80 && hasMore && !loadingMore) {
      onLoadMore?.();
    }
  }, [hasMore, loadingMore, onLoadMore]);

  // Auto-scroll to bottom only when appropriate (new message arrived + user was at bottom)
  useEffect(() => {
    const grew = items.length > prevItemCount.current;
    prevItemCount.current = items.length;
    if (grew && isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [items.length, isNearBottom]);

  // Always scroll to bottom on first load of a conversation
  useEffect(() => {
    if (!loading && items.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── initial loading skeleton ── */
  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-3 px-4 py-6 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"} animate-pulse`}
          >
            <div
              className={`h-10 rounded-2xl bg-white/[0.04] ${
                i % 3 === 0 ? "w-48" : i % 3 === 1 ? "w-64" : "w-36"
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  /* ── empty conversation ── */
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl glass mb-3">
          <svg className="size-6 text-gray-500" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863
                     9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3
                     12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400">No messages yet</p>
        <p className="text-xs text-gray-500 mt-1">Say hello to start the conversation</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto scroll-dark py-4 space-y-1.5"
    >
      {loadingMore && (
        <div className="flex justify-center py-2">
          <div className="size-5 animate-spin rounded-full border-2 border-white/10 border-t-brand-400" />
        </div>
      )}

      {items.map((item, i) =>
        item.type === "divider" ? (
          <DateDivider key={`d-${i}`} label={item.label} />
        ) : (
          <MessageBubble
            key={item.id}
            {...item}
            onRetry={item.status === "failed" ? () => onRetryMessage?.(item.id) : undefined}
          />
        )
      )}

      {typingUsers.length > 0 && (
        <div className="pt-1">
          <TypingIndicator users={typingUsers} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
