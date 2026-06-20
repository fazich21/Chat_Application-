import { XIcon, SendIcon } from "../shared/icons.jsx";

/**
 * Replaces the text input row while recording a voice message.
 * Shows a pulsing red dot, live duration, cancel (trash) and send buttons.
 * `previewMode` — true after stop(), shows playback instead of live recording.
 */
export default function VoiceRecorderBar({
  status, duration, audioUrl, onCancel, onStop, onSend, uploading = false,
}) {
  const isRecording = status === "recording";
  const isPreview   = status === "stopped";

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface-overlay
                    border border-surface-border px-3 py-2.5 animate-pop-in">

      {/* Cancel / delete */}
      <button
        type="button"
        onClick={onCancel}
        disabled={uploading}
        className="flex size-9 shrink-0 items-center justify-center rounded-full
                   text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        aria-label="Cancel recording"
      >
        <XIcon className="size-5"/>
      </button>

      {/* Recording state */}
      {isRecording && (
        <div className="flex flex-1 items-center gap-2.5">
          <span className="size-2.5 rounded-full bg-red-500 animate-pulse-ring"/>
          <span className="text-sm font-medium text-surface-primary tabular-nums">
            {formatTime(duration)}
          </span>
          <div className="flex-1 flex items-center gap-0.5 h-6">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i}
                className="flex-1 rounded-full bg-brand-400/60 animate-pulse"
                style={{
                  height: `${20 + ((i * 53 + duration * 17) % 80)}%`,
                  animationDelay: `${i * 0.03}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preview / playback state */}
      {isPreview && audioUrl && (
        <div className="flex-1 flex items-center gap-2">
          <audio src={audioUrl} controls className="h-9 flex-1" style={{ maxWidth: "100%" }} />
          <span className="text-xs text-surface-muted tabular-nums shrink-0">{formatTime(duration)}</span>
        </div>
      )}

      {/* Stop (while recording) or Send (after stop) */}
      {isRecording ? (
        <button
          type="button"
          onClick={onStop}
          className="flex size-9 shrink-0 items-center justify-center rounded-full
                     bg-red-500 text-white hover:bg-red-600 transition-colors"
          aria-label="Stop recording"
        >
          <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={onSend}
          disabled={uploading}
          className="flex size-9 shrink-0 items-center justify-center rounded-full
                     bg-gradient-bubble text-white shadow-glow transition-transform
                     active:scale-90 disabled:opacity-60"
          aria-label="Send voice message"
        >
          {uploading ? (
            <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          ) : (
            <SendIcon className="size-4"/>
          )}
        </button>
      )}
    </div>
  );
}

function formatTime(seconds) {
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
