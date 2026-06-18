import { useState, useRef, useEffect } from "react";
import { PaperclipIcon, ImageIcon, EmojiIcon, SendIcon, MicIcon, XIcon } from "../shared/icons.jsx";
import EmojiPicker from "./EmojiPicker.jsx";

/**
 * Bottom message composer.
 * Pure UI — `onSend(text)` called on submit, `onTyping()` called on input change
 * (parent wires this to typing-indicator broadcasts).
 * `imagePreview` — { url, name } | null — shows an attached-image chip above input.
 */
export default function MessageInput({
  onSend,
  onTyping,
  onAttachImage,
  imagePreview,
  onRemoveImage,
  placeholder = "Type a message",
  disabled = false,
}) {
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping?.();
  };

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
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-surface-border bg-surface-raised/80 backdrop-blur-xl
                    px-3 sm:px-4 py-3">

      {/* Image preview chip */}
      {imagePreview && (
        <div className="mb-2 flex items-center gap-2 animate-pop-in">
          <div className="relative">
            <img
              src={imagePreview.url}
              alt={imagePreview.name}
              className="size-16 rounded-xl object-cover ring-1 ring-white/10"
            />
            <button
              onClick={onRemoveImage}
              className="absolute -right-1.5 -top-1.5 flex size-5 items-center
                         justify-center rounded-full bg-gray-900 text-gray-300
                         ring-1 ring-white/10 hover:bg-red-500 hover:text-white
                         transition-colors duration-150"
              aria-label="Remove image"
            >
              <XIcon className="size-3" />
            </button>
          </div>
          <p className="text-xs text-gray-400 truncate max-w-[140px]">{imagePreview.name}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        {/* Attach buttons */}
        <div className="flex items-center gap-1 pb-2">
          <button
            type="button"
            onClick={onAttachImage}
            className="flex size-9 items-center justify-center rounded-xl
                       text-gray-400 hover:bg-white/5 hover:text-brand-400
                       transition-colors duration-150"
            aria-label="Attach image"
          >
            <ImageIcon className="size-5" />
          </button>
          <button
            type="button"
            className="hidden sm:flex size-9 items-center justify-center rounded-xl
                       text-gray-400 hover:bg-white/5 hover:text-brand-400
                       transition-colors duration-150"
            aria-label="Attach file"
          >
            <PaperclipIcon className="size-5" />
          </button>
        </div>

        {/* Textarea */}
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
                       bg-surface-overlay py-2.5 pl-4 pr-10 text-sm text-gray-100
                       placeholder:text-gray-500 outline-none transition-all duration-150
                       focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20
                       disabled:opacity-50 scroll-dark"
          />
          <button
            type="button"
            onClick={() => setEmojiOpen((o) => !o)}
            className="absolute right-2.5 bottom-2.5 text-gray-500 hover:text-brand-400
                       transition-colors duration-150"
            aria-label="Add emoji"
          >
            <EmojiIcon className="size-[18px]" />
          </button>

          {emojiOpen && (
            <EmojiPicker
              onSelect={handleEmojiSelect}
              onClose={() => setEmojiOpen(false)}
            />
          )}
        </div>

        {/* Send / mic button */}
        {text.trim() || imagePreview ? (
          <button
            type="submit"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl
                       bg-gradient-bubble text-white shadow-glow
                       transition-transform duration-150 active:scale-90 animate-pop-in"
            aria-label="Send message"
          >
            <SendIcon className="size-[18px]" />
          </button>
        ) : (
          <button
            type="button"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl
                       text-gray-400 hover:bg-white/5 hover:text-brand-400
                       transition-colors duration-150"
            aria-label="Record voice message"
          >
            <MicIcon className="size-[18px]" />
          </button>
        )}
      </form>
    </div>
  );
}
