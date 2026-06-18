import { useEffect, useRef } from "react";
import { useConversationStore } from "../store/conversationStore.js";
import { joinPresence } from "../services/presenceService.js";

/**
 * Tracks the current user as "online" for the lifetime of the app session,
 * and keeps a global list of online user IDs in the conversation store
 * (used to show live status dots without re-fetching profiles).
 *
 * Guards against React StrictMode's mount→cleanup→mount double-invoke:
 * without this guard, the dev-only double effect can call joinPresence()
 * twice in quick succession. Supabase caches realtime channels by topic
 * name, so the second join can receive an already-subscribed channel
 * instance and crash with "cannot add callbacks after subscribe()".
 */
export function usePresence(userId) {
  const { setOnlineUserIds, onlineUserIds } = useConversationStore();
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!userId || joinedRef.current) return;
    joinedRef.current = true;

    const { unsubscribe } = joinPresence(userId, (ids) => setOnlineUserIds(ids));

    return () => {
      joinedRef.current = false;
      unsubscribe();
    };
  }, [userId, setOnlineUserIds]);

  return { onlineUserIds };
}
