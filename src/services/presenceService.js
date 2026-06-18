import { supabase, db } from "./supabase.js";
import { PRESENCE_ONLINE, PRESENCE_OFFLINE } from "../utils/constants.js";

const PRESENCE_TOPIC = "presence:online";

/**
 * Tracks which users are currently online using a single global Presence channel.
 * Call `joinPresence` once per session (e.g. in a top-level provider).
 *
 * Defensive against rapid join/leave cycles (e.g. React StrictMode's
 * mount→cleanup→mount, or fast navigation): if a channel with this topic
 * already exists on the client, it's removed first so we always start
 * from a clean, unsubscribed channel before attaching listeners.
 *
 * Returns { unsubscribe }
 */
export function joinPresence(userId, onPresenceChange) {
  // Defensively clear out any stale channel with the same topic before
  // creating a new one — supabase-js caches channels by topic name, and
  // calling .on() on an already-subscribed channel throws.
  const existing = supabase.getChannels().find((c) => c.topic === `realtime:${PRESENCE_TOPIC}`);
  if (existing) {
    supabase.removeChannel(existing);
  }

  const channel = supabase.channel(PRESENCE_TOPIC, {
    config: { presence: { key: userId } },
  });

  let cancelled = false;

  channel
    .on("presence", { event: "sync" }, () => {
      if (cancelled) return;
      const state = channel.presenceState();
      const onlineIds = Object.keys(state);
      onPresenceChange(onlineIds);
    })
    .subscribe(async (status) => {
      if (cancelled) return;
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: new Date().toISOString() });
        await updatePresenceStatus(userId, PRESENCE_ONLINE);
      }
    });

  const unsubscribe = async () => {
    cancelled = true;
    await updatePresenceStatus(userId, PRESENCE_OFFLINE);
    supabase.removeChannel(channel);
  };

  // Mark offline on tab close
  const handleUnload = () => updatePresenceStatus(userId, PRESENCE_OFFLINE);
  window.addEventListener("beforeunload", handleUnload);

  return {
    unsubscribe: () => {
      window.removeEventListener("beforeunload", handleUnload);
      unsubscribe();
    },
  };
}

/** Persist presence_status + last_seen_at to the profiles table */
export async function updatePresenceStatus(userId, status) {
  const { error } = await db("profiles")
    .update({
      presence_status: status,
      last_seen_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) console.error("[presence] failed to update status:", error.message);
}
