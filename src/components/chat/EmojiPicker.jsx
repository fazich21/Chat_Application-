import { useState, useRef, useEffect } from "react";

const CATEGORIES = {
  "😊 Smileys": ["😀","😁","😂","🤣","😊","😍","😘","😜","🤔","😎","😴","🥳","😭","😡","🥰","😇","🙃","😏","🤩","🤗","😤","🤯","🥺","😬","😈"],
  "👋 Gestures": ["👍","👎","👏","🙏","💪","🤝","✌️","🤞","👌","🙌","👋","🤙","💯","🔥","✨","🎉","❤️","💔","💕","⭐","🎊","🏆","💎","🚀","💡"],
  "🐶 Animals":  ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🦄","🐝","🦋","🐬","🐳","🦈","🐙","🦁"],
  "🍕 Food":     ["🍎","🍕","🍔","🍟","🌮","🍣","🍩","🍪","🎂","🍰","☕","🍺","🍷","🥤","🍿","🍫","🍉","🍓","🥑","🍜","🧁","🥐","🍦","🧃","🫐"],
};

export default function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(Object.keys(CATEGORIES)[0]);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  return (
    <div ref={ref}
      className="absolute bottom-full right-0 mb-2 w-72 rounded-2xl
                 bg-surface-raised border border-surface-border shadow-glass
                 p-3 animate-pop-in z-30">
      {/* Category tabs */}
      <div className="flex gap-1 mb-2 border-b border-surface-border pb-2 overflow-x-auto">
        {Object.keys(CATEGORIES).map((cat) => (
          <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors
                        ${activeCategory === cat
                          ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300"
                          : "text-surface-muted hover:text-surface-secondary hover:bg-surface-overlay"}`}>
            {cat}
          </button>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-8 gap-0.5 max-h-44 overflow-y-auto scroll-dark">
        {CATEGORIES[activeCategory].map((emoji) => (
          <button key={emoji} type="button" onClick={() => onSelect(emoji)}
            className="flex items-center justify-center rounded-lg p-1.5 text-lg
                       hover:bg-surface-overlay transition-colors">
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
