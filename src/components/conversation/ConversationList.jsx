import ConversationItem from "./ConversationItem.jsx";

/**
 * Renders a list of <ConversationItem>, grouped under a section label.
 * Pure UI — `conversations` is an array of objects matching ConversationItem's props
 * plus a unique `id`.
 */
export default function ConversationList({ conversations = [], activeId, onSelect, label }) {
  if (conversations.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {label && (
        <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider
                      text-gray-500">
          {label}
        </p>
      )}
      {conversations.map((c) => (
        <ConversationItem
          key={c.id}
          {...c}
          active={c.id === activeId}
          onClick={() => onSelect?.(c.id)}
        />
      ))}
    </div>
  );
}
