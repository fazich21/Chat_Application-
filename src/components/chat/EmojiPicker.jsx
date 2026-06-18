import { useState, useRef, useEffect } from "react";

const CATEGORIES = {
  "Smileys": ["😀","😁","😂","🤣","😊","😍","😘","😜","🤔","😎","😴","🥳","😭","😡","🥰","😇","🙃","😏","🤩","🤗"],
  "Gestures": ["👍","👎","👏","🙏","💪","🤝","✌️","🤞","👌","🙌","👋","🤙","💯","🔥","✨","🎉","❤️","💔","💕","⭐"],
  "Animals": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦄","🐝"],
  "Food": ["🍎","🍕","🍔","🍟","🌮","🍣","🍩","🍪","🎂","🍰","☕","🍺","🍷","🥤","🍿","🍫","🍉","🍓","🥑","🍜"],
};

/**
 * Lightweight emoji picker popover — no external dependency.
 * Renders a fixed grid of common emojis grouped by category, with a tab bar.
 * Calls `onSelect(emoji)` when one is tapped, and `onClose()` on outside click.
 */
export default function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState("Smileys");
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 mb-2 w-72 rounded-2xl glass-strong
                 shadow-glass p-3 animate-pop-in z-20"
    >
      {/* Category tabs */}
      <div className="flex gap-1 mb-2 border-b border-white/[0.06] pb-2">
        {Object.keys(CATEGORIES).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium
                        transition-colors duration-150
                        ${activeCategory === cat
                          ? "bg-white/10 text-white"
                          : "text-gray-500 hover:text-gray-300"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-8 gap-1 max-h-44 overflow-y-auto scroll-dark">
        {CATEGORIES[activeCategory].map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="flex items-center justify-center rounded-lg p-1.5 text-lg
                       hover:bg-white/10 transition-colors duration-100"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
