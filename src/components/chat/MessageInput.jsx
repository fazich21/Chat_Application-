import { useState, useRef, useEffect } from "react";
import { PaperclipIcon, ImageIcon, EmojiIcon, SendIcon, MicIcon, XIcon } from "../shared/icons.jsx";
import EmojiPicker from "./EmojiPicker.jsx";
import VoiceRecorderBar from "./VoiceRecorderBar.jsx";
import { useAudioRecorder } from "../../hooks/useAudioRecorder.js";

export default function MessageInput({
  onSend, onTyping, onAttachImage, imagePreview, onRemoveImage,
  onSendAudio, audioUploading = false,
  placeholder = "Type a message", disabled = false,
}) {
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef(null);

  const recorder = useAudioRecorder();
  const isRecordingMode = recorder.status === "recording" || recorder.status === "stopped";

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const handleChange = (e) => { setText(e.target.value); onTyping?.(); };
  const handleEmojiSelect = (emoji) => {
    setText((t) => t + emoji);
    onTyping?.();
    textareaRef.current?.focus();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !imagePreview) return;
    onSend?.(trimmed);
    setText("");
    setEmojiOpen(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  const handleMicClick = () => {
    recorder.start();
  };

  const handleVoiceSend = async () => {
    if (!recorder.audioBlob) return;
    await onSendAudio?.(recorder.audioBlob, recorder.duration);
    recorder.reset();
  };

  // Permission denied / unsupported feedback
  if (recorder.status === "denied") {
    return (
      <div className="border-t border-surface-border bg-surface-raised/90 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center justify-between rounded-2xl bg-red-50 dark:bg-red-500/10
                        border border-red-200 dark:border-red-900/40 px-4 py-3">
          <p className="text-sm text-red-600 dark:text-red-400">
            Microphone access denied. Allow it in your browser settings to send voice messages.
          </p>
          <button onClick={recorder.reset} className="text-red-500 hover:text-red-600 shrink-0 ml-3">
            <XIcon className="size-4"/>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-surface-border bg-surface-raised/90 backdrop-blur-xl
                    px-3 sm:px-4 py-3 transition-colors duration-200">

      {imagePreview && !isRecordingMode && (
        <div className="mb-2 flex items-center gap-2 animate-pop-in">
          <div className="relative">
            <img src={imagePreview.url} alt={imagePreview.name}
                 className="size-16 rounded-xl object-cover ring-1 ring-surface-border"/>
            <button onClick={onRemoveImage}
              className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center
                         rounded-full bg-surface-raised ring-1 ring-surface-border
                         text-surface-muted hover:bg-red-500 hover:text-white transition-colors">
              <XIcon className="size-3"/>
            </button>
          </div>
          <p className="text-xs text-surface-muted truncate max-w-[140px]">{imagePreview.name}</p>
        </div>
      )}

      {isRecordingMode ? (
        <VoiceRecorderBar
          status={recorder.status}
          duration={recorder.duration}
          audioUrl={recorder.audioUrl}
          uploading={audioUploading}
          onCancel={recorder.cancel}
          onStop={recorder.stop}
          onSend={handleVoiceSend}
        />
      ) : (
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <div className="flex items-center gap-1 pb-2">
            <button type="button" onClick={onAttachImage}
              className="flex size-9 items-center justify-center rounded-xl
                         text-surface-muted hover:text-brand-500 hover:bg-brand-50
                         dark:hover:bg-white/5 transition-colors">
              <ImageIcon className="size-5"/>
            </button>
            <button type="button"
              className="hidden sm:flex size-9 items-center justify-center rounded-xl
                         text-surface-muted hover:text-brand-500 hover:bg-brand-50
                         dark:hover:bg-white/5 transition-colors">
              <PaperclipIcon className="size-5"/>
            </button>
          </div>

          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={placeholder}
              className="w-full resize-none rounded-2xl border border-surface-border
                         bg-surface-overlay py-2.5 pl-4 pr-10 text-sm text-surface-primary
                         placeholder:text-surface-muted outline-none transition-all duration-150
                         focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20
                         disabled:opacity-50 scroll-dark"
            />
            <button type="button" onClick={() => setEmojiOpen((o) => !o)}
              className="absolute right-2.5 bottom-2.5 text-surface-muted hover:text-brand-500
                         transition-colors">
              <EmojiIcon className="size-[18px]"/>
            </button>
            {emojiOpen && (
              <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setEmojiOpen(false)}/>
            )}
          </div>

          {text.trim() || imagePreview ? (
            <button type="submit"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl
                         bg-gradient-bubble text-white shadow-glow
                         transition-transform active:scale-90 animate-pop-in">
              <SendIcon className="size-[18px]"/>
            </button>
          ) : (
            <button type="button" onClick={handleMicClick}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl
                         text-surface-muted hover:text-brand-500 hover:bg-brand-50
                         dark:hover:bg-white/5 transition-colors"
              aria-label="Record voice message">
              <MicIcon className="size-[18px]"/>
            </button>
          )}
        </form>
      )}
    </div>
  );
}
