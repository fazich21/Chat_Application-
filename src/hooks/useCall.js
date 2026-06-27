import { useState, useEffect, useRef, useCallback } from "react";
import { createCallRoom, createCallChannel } from "../services/callService.js";

/**
 * Call states:
 *  idle       — no call active
 *  calling    — you started a call, waiting for the other person to accept
 *  incoming   — someone is calling you
 *  active     — call is connected (Daily room URL available)
 *  ended      — call just ended (brief transitional state before returning to idle)
 */

export function useCall(conversationId, currentUserId, otherUserId, currentUserName) {
  const [callState, setCallState] = useState("idle");
  const [roomUrl, setRoomUrl]     = useState(null);
  const [isVideo, setIsVideo]     = useState(false);
  const [callerName, setCallerName] = useState("");
  const [error, setError]         = useState(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const channelRef  = useRef(null);
  const timeoutRef  = useRef(null); // auto-cancel if no answer in 30s
  const calleeIdRef = useRef(null);

  /* ── Setup signaling channel when conversation changes ── */
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const ch = createCallChannel(conversationId, currentUserId, {
      onOffer: ({ callerId, roomUrl: url, callerName: name, isVideo: video }) => {
        setCallState("incoming");
        setRoomUrl(url);
        setIsVideo(video);
        setCallerName(name);
        calleeIdRef.current = callerId;
      },
      onAccepted: () => {
        clearTimeout(timeoutRef.current);
        setCallState("active");
      },
      onRejected: () => {
        clearTimeout(timeoutRef.current);
        setRoomUrl(null);
        setCallState("idle");
        setError("Call was declined.");
        setTimeout(() => setError(null), 3000);
      },
      onEnded: () => {
        clearTimeout(timeoutRef.current);
        setCallState("ended");
        setTimeout(() => {
          setCallState("idle");
          setRoomUrl(null);
          setIsVideo(false);
          setCallerName("");
        }, 1500);
      },
      onMissed: () => {
        setCallState("idle");
        setRoomUrl(null);
      },
    });

    channelRef.current = ch;
    return () => { ch.unsubscribe(); clearTimeout(timeoutRef.current); };
  }, [conversationId, currentUserId]);

  /* ── Start a call ── */
  const startCall = useCallback(async (video = false) => {
    if (!conversationId || !otherUserId) return;
    setError(null);
    setIsCreatingRoom(true);
    try {
      const { url } = await createCallRoom(conversationId);
      setRoomUrl(url);
      setIsVideo(video);
      setCallState("calling");

      channelRef.current?.sendOffer(otherUserId, url, currentUserName, video);

      // Auto-cancel after 30 seconds if no answer
      timeoutRef.current = setTimeout(() => {
        channelRef.current?.sendMissed(otherUserId);
        setCallState("idle");
        setRoomUrl(null);
        setError("No answer.");
        setTimeout(() => setError(null), 3000);
      }, 30_000);
    } catch (err) {
      setError(err.message ?? "Failed to start call.");
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsCreatingRoom(false);
    }
  }, [conversationId, otherUserId, currentUserName]);

  /* ── Accept an incoming call ── */
  const acceptCall = useCallback(() => {
    channelRef.current?.sendAccepted(calleeIdRef.current);
    setCallState("active");
  }, []);

  /* ── Reject an incoming call ── */
  const rejectCall = useCallback(() => {
    channelRef.current?.sendRejected(calleeIdRef.current);
    setCallState("idle");
    setRoomUrl(null);
  }, []);

  /* ── End an active call or cancel an outgoing one ── */
  const endCall = useCallback(() => {
    clearTimeout(timeoutRef.current);
    channelRef.current?.sendEnded();
    setCallState("ended");
    setTimeout(() => {
      setCallState("idle");
      setRoomUrl(null);
      setIsVideo(false);
      setCallerName("");
    }, 1500);
  }, []);

  return {
    callState,
    roomUrl,
    isVideo,
    callerName,
    error,
    isCreatingRoom,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  };
}
