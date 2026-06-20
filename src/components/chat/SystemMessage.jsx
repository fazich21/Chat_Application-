/**
 * Centered pill for group events: "X created the group", "Y joined", etc.
 */
export default function SystemMessage({ content }) {
  return (
    <div className="flex items-center justify-center py-1.5 px-4 animate-fade-in">
      <span className="rounded-full bg-surface-overlay border border-surface-border
                       px-3 py-1 text-[11px] text-surface-muted">
        {content}
      </span>
    </div>
  );
}
