import { useState, useRef, useCallback, useEffect } from "react";

const MAX_RECORDING_SECONDS = 120; // 2 minute cap

/**
 * Wraps the browser MediaRecorder API for voice messages.
 *
 * Returns:
 *  - status: "idle" | "recording" | "stopped" | "denied" | "unsupported"
 *  - duration: seconds elapsed (live while recording)
 *  - audioBlob: Blob | null — the recorded audio once stopped
 *  - audioUrl: string | null — object URL for local playback preview
 *  - start(), stop(), cancel(), reset()
 */
export function useAudioRecorder() {
  const [status, setStatus] = useState("idle");
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const isSupported = typeof window !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const start = useCallback(async () => {
    if (!isSupported) { setStatus("unsupported"); return; }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setStatus("stopped");
        stopStream();
        clearTimer();
      };

      recorder.start();
      setStatus("recording");
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d + 1 >= MAX_RECORDING_SECONDS) {
            recorder.stop();
          }
          return d + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("[useAudioRecorder] mic permission denied or unavailable:", err);
      setStatus("denied");
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancel = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      // Discard chunks so onstop doesn't produce a usable blob
      chunksRef.current = [];
      mediaRecorderRef.current.onstop = () => { stopStream(); clearTimer(); };
      mediaRecorderRef.current.stop();
    } else {
      stopStream();
      clearTimer();
    }
    setStatus("idle");
    setDuration(0);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  }, [audioUrl]);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setStatus("idle");
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => () => { stopStream(); clearTimer(); if (audioUrl) URL.revokeObjectURL(audioUrl); }, []); // eslint-disable-line

  return { status, duration, audioBlob, audioUrl, isSupported, start, stop, cancel, reset };
}
