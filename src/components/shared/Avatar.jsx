/**
 * Avatar — circular image or gradient-initial fallback, with optional
 * presence status dot.
 *
 * size: "sm" (32px) | "md" (40px) | "lg" (48px) | "xl" (64px)
 * status: "online" | "away" | "offline" | undefined (no dot)
 */
const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-xl",
};

const dotSizes = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
  xl: "size-3.5",
};

const statusColors = {
  online:  "bg-accent-mint",
  away:    "bg-accent-amber",
  offline: "bg-gray-500",
};

// Deterministic gradient pick based on name, so each user gets a stable color
const gradients = [
  "from-indigo-500 to-fuchsia-500",
  "from-violet-500 to-pink-500",
  "from-blue-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-500",
];

function gradientFor(name = "") {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export default function Avatar({ name = "?", src, size = "md", status, className = "" }) {
  const initial = name.trim()[0]?.toUpperCase() ?? "?";

  return (
    <div className={`relative shrink-0 ${sizes[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`size-full rounded-full object-cover ring-1 ring-white/10`}
        />
      ) : (
        <div
          className={`flex size-full items-center justify-center rounded-full
                      bg-gradient-to-br ${gradientFor(name)}
                      font-semibold text-white ring-1 ring-white/10`}
        >
          {initial}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full
                      ${statusColors[status]} ring-2 ring-surface-base
                      ${status === "online" ? "animate-pulse-ring" : ""}`}
        />
      )}
    </div>
  );
}
