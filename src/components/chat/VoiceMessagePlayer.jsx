import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Inline audio player for voice messages — play/pause button, scrubbing
 * progress bar, and elapsed/total time. Styled to sit inside a MessageBubble.
 */
export default function VoiceMessagePlayer({ src, duration = 0, isOwn = false }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadedDuration, setLoadedDuration] = useState(duration);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMeta = () => {
      if (isFinite(audio.duration)) setLoadedDuration(audio.duration);
    };
    const onEnded = () => { setPlaying(false); setCurrentTime(0); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  }, [playing]);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !loadedDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * loadedDuration;
    setCurrentTime(audio.currentTime);
  };

  const progress = loadedDuration > 0 ? (currentTime / loadedDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5 min-w-[200px] sm:min-w-[220px]">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={togglePlay}
        className={`flex size-9 shrink-0 items-center justify-center rounded-full
                    transition-colors ${isOwn ? "bg-white/20 hover:bg-white/30" : "bg-brand-500/15 hover:bg-brand-500/25"}`}
      >
        {playing ? (
          <svg className={`size-4 ${isOwn ? "text-white" : "text-brand-600 dark:text-brand-400"}`}
               fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="5" width="4" height="14" rx="1"/>
            <rect x="14" y="5" width="4" height="14" rx="1"/>
          </svg>
        ) : (
          <svg className={`size-4 ml-0.5 ${isOwn ? "text-white" : "text-brand-600 dark:text-brand-400"}`}
               fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        {/* Waveform-style progress bar */}
        <div
          onClick={handleSeek}
          className={`relative h-7 cursor-pointer flex items-center gap-[2px]`}
        >
          {Array.from({ length: 28 }).map((_, i) => {
            const barProgress = (i / 28) * 100;
            const isActive = barProgress <= progress;
            // Pseudo-random but stable bar heights for a waveform look
            const heightPct = 30 + ((i * 37) % 70);
            return (
              <span
                key={i}
                className={`flex-1 rounded-full transition-colors duration-100 ${
                  isActive
                    ? (isOwn ? "bg-white" : "bg-brand-500")
                    : (isOwn ? "bg-white/30" : "bg-surface-border")
                }`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>
        <p className={`text-[10px] mt-0.5 ${isOwn ? "text-white/70" : "text-surface-muted"}`}>
          {formatTime(playing || currentTime > 0 ? currentTime : loadedDuration)}
        </p>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
