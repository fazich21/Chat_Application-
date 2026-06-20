import { formatMessageTime } from "./formatDate.js";

/**
 * Converts raw Supabase message rows + seen-receipt map into the shape
 * <MessageList> / <MessageBubble> expect: a flat array with date dividers
 * interleaved, consecutive-message grouping (showAvatar/showTail), and
 * per-message seen status.
 */
export function buildMessageListItems({
  messages,
  currentUserId,
  seenByMessageId = {},
  otherMemberIds = [], // for group seen-status: array of all other member user ids
  isGroup = false,
}) {
  const items = [];
  let lastDateLabel = null;
  let lastSenderId = null;

  messages.forEach((msg, i) => {
    const dateLabel = getDateLabel(msg.created_at);
    if (dateLabel !== lastDateLabel) {
      items.push({ type: "divider", label: dateLabel });
      lastDateLabel = dateLabel;
      lastSenderId = null; // reset grouping after a date break
    }

    // System messages (group created, member joined/left/removed) render as
    // centered pills, not chat bubbles — skip all the bubble-grouping logic.
    if (msg.content_type === "system") {
      items.push({ type: "system", id: msg.id, content: msg.content, time: formatMessageTime(msg.created_at) });
      lastSenderId = null; // break grouping around system events
      return;
    }

    const isOwn = msg.sender_id === currentUserId;
    const nextMsg = messages[i + 1];
    const isLastInGroup =
      !nextMsg || nextMsg.sender_id !== msg.sender_id || nextMsg.content_type === "system" ||
      getDateLabel(nextMsg.created_at) !== dateLabel;
    const isFirstInGroup = lastSenderId !== msg.sender_id;

    let status;
    if (isOwn) {
      if (msg.status === "sending") status = "sending";
      else if (msg.status === "failed") status = "failed";
      else {
        const seenIds = seenByMessageId[msg.id] ?? [];
        const relevantOthers = isGroup ? otherMemberIds : otherMemberIds.slice(0, 1);
        const seenByAllOthers =
          relevantOthers.length > 0 && relevantOthers.every((id) => seenIds.includes(id));
        status = seenByAllOthers ? "seen" : "delivered";
      }
    }

    items.push({
      type: "message",
      id: msg.id,
      content: msg.content,
      imageUrl: msg.image_url,
      audioUrl: msg.audio_url,
      audioDuration: msg.audio_duration,
      time: formatMessageTime(msg.created_at),
      isOwn,
      status,
      senderName: msg.profiles?.username,
      senderAvatar: msg.profiles?.avatar_url,
      showAvatar: isFirstInGroup,
      showTail: isLastInGroup,
    });

    lastSenderId = msg.sender_id;
  });

  return items;
}

function getDateLabel(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" });
}
