import { useEffect, useRef, useCallback } from "react";
import { useMessageStore } from "../store/messageStore.js";
import { createTypingChannel } from "../services/typingService.js";
import { TYPING_TIMEOUT_MS, TYPING_DEBOUNCE_MS } from "../utils/constants.js";

/**
 * Wires a conversation's typing-indicator channel.
 * Returns `notifyTyping()` — call on every keystroke in the message input.
 * Remote typers are written into useMessageStore's typingByConv automatically.
 */
export function useTyping(conversationId, currentUserId, currentUsername) {
  const { setTypingUser, getTypingUsers } = useMessageStore();
  const channelRef = useRef(null);
  const stopTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const joinedKeyRef = useRef(null);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const key = `${conversationId}:${currentUserId}`;
    if (joinedKeyRef.current === key) return; // guard against StrictMode double-invoke
    joinedKeyRef.current = key;

    const { sendTyping, sendStopTyping, unsubscribe } = createTypingChannel(
      conversationId,
      currentUserId,
      (userId, username, isTyping) => {
        setTypingUser(conversationId, userId, username, isTyping);
      }
    );

    channelRef.current = { sendTyping, sendStopTyping };

    return () => {
      joinedKeyRef.current = null;
      clearTimeout(stopTimeoutRef.current);
      channelRef.current = null;
      unsubscribe();
    };
  }, [conversationId, currentUserId, setTypingUser]);

  const notifyTyping = useCallback(() => {
    if (!channelRef.current) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      channelRef.current.sendTyping(currentUsername);
    }

    // Reset the "stop typing" timer on every keystroke
    clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      channelRef.current?.sendStopTyping(currentUsername);
    }, TYPING_TIMEOUT_MS);
  }, [currentUsername]);

  return {
    notifyTyping,
    typingUsers: getTypingUsers(conversationId),
  };
}
