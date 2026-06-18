import { supabase } from "./supabase.js";

/**
 * Typing indicators use Supabase Realtime's ephemeral Broadcast feature —
 * no database writes, just a pub/sub message on a per-conversation channel.
 *
 * Defensively removes any stale channel with the same topic before creating
 * a new one — React StrictMode's mount→cleanup→mount double-invoke (and fast
 * navigation between conversations) can otherwise leave a leftover
 * already-subscribed channel that silently breaks subsequent .on()/.send()
 * calls, which is why typing indicators can appear to do nothing.
 *
 * Returns { channel, sendTyping, sendStopTyping, unsubscribe }
 */
export function createTypingChannel(conversationId, currentUserId, onTypingChange) {
  const topic = `typing:${conversationId}`;

  const existing = supabase.getChannels().find((c) => c.topic === `realtime:${topic}`);
  if (existing) {
    supabase.removeChannel(existing);
  }

  const channel = supabase.channel(topic, {
    config: { broadcast: { self: false } },
  });

  channel
    .on("broadcast", { event: "typing" }, ({ payload }) => {
      if (payload.userId !== currentUserId) {
        onTypingChange(payload.userId, payload.username, true);
      }
    })
    .on("broadcast", { event: "stop_typing" }, ({ payload }) => {
      if (payload.userId !== currentUserId) {
        onTypingChange(payload.userId, payload.username, false);
      }
    })
    .subscribe();

  const sendTyping = (username) => {
    channel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId, username },
    });
  };

  const sendStopTyping = (username) => {
    channel.send({
      type: "broadcast",
      event: "stop_typing",
      payload: { userId: currentUserId, username },
    });
  };

  const unsubscribe = () => supabase.removeChannel(channel);

  return { channel, sendTyping, sendStopTyping, unsubscribe };
}
