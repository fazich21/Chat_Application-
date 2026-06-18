/**
 * Centered date label between message groups, e.g. "Today", "Yesterday", "12 June"
 */
export default function DateDivider({ label }) {
  return (
    <div className="flex items-center justify-center py-3">
      <span className="rounded-full glass px-3 py-1 text-[11px] font-medium text-gray-400">
        {label}
      </span>
    </div>
  );
}
