import { MessageIcon, PlusIcon } from "../shared/icons.jsx";

export default function EmptyState({ onNewChat }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-bubble opacity-10 blur-2xl"/>
        <div className="relative flex size-20 items-center justify-center rounded-3xl
                        bg-brand-50 dark:bg-white/[0.03] border border-surface-border">
          <MessageIcon className="size-9 text-brand-500 dark:text-brand-400"/>
        </div>
      </div>
      <h2 className="text-lg font-semibold text-surface-primary">Your messages</h2>
      <p className="mt-1.5 max-w-xs text-sm text-surface-muted leading-relaxed">
        Select a conversation from the sidebar or start a new one.
      </p>
      <button
        onClick={onNewChat}
        className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-bubble
                   px-4 py-2.5 text-sm font-medium text-white shadow-glow
                   transition-transform active:scale-95">
        <PlusIcon className="size-4"/>
        Start a new chat
      </button>
    </div>
  );
}
