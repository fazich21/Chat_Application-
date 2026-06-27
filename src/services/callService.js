import { supabase } from "./supabase.js";

/**
 * Creates a Jitsi Meet room URL — completely free, no API key needed.
 * Jitsi is open source and runs on meet.jit.si (free public server).
 * Anyone with the URL can join — we use a long random ID to keep it private.
 */
export async function createCallRoom(conversationId) {
  // Generate a unique unguessable room name
  const random = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Use a simple short name — Jitsi has issues with long names containing dashes
  const roomName = `PulseMeet${random}`;
  const url      = `https://meet.jit.si/${roomName}`;

  return { url, name: roomName };
}

/**
 * Call signaling via Supabase Realtime Broadcast.
 * No database writes — purely ephemeral pub/sub.
 */
export function createCallChannel(conversationId, currentUserId, handlers) {
  const topic = `call:${conversationId}`;

  const existing = supabase.getChannels().find(
    (c) => c.topic === `realtime:${topic}`
  );
  if (existing) supabase.removeChannel(existing);

  const channel = supabase.channel(topic, {
    config: { broadcast: { self: false } },
  });

  channel
    .on("broadcast", { event: "call_offer" }, ({ payload }) => {
      if (payload.calleeId === currentUserId) handlers.onOffer?.(payload);
    })
    .on("broadcast", { event: "call_accepted" }, ({ payload }) => {
      if (payload.callerId === currentUserId) handlers.onAccepted?.(payload);
    })
    .on("broadcast", { event: "call_rejected" }, ({ payload }) => {
      if (payload.callerId === currentUserId) handlers.onRejected?.(payload);
    })
    .on("broadcast", { event: "call_ended" }, () => {
      handlers.onEnded?.();
    })
    .on("broadcast", { event: "call_missed" }, ({ payload }) => {
      if (payload.calleeId === currentUserId) handlers.onMissed?.(payload);
    })
    .subscribe();

  const send = (event, payload) =>
    channel.send({ type: "broadcast", event, payload });

  return {
    sendOffer:    (calleeId, roomUrl, callerName, isVideo) =>
      send("call_offer",    { callerId: currentUserId, calleeId, roomUrl, callerName, isVideo }),
    sendAccepted: (callerId) =>
      send("call_accepted", { callerId, calleeId: currentUserId }),
    sendRejected: (callerId) =>
      send("call_rejected", { callerId, calleeId: currentUserId }),
    sendEnded:    () =>
      send("call_ended",    { by: currentUserId }),
    sendMissed:   (calleeId) =>
      send("call_missed",   { callerId: currentUserId, calleeId }),
    unsubscribe:  () => supabase.removeChannel(channel),
  };
}
