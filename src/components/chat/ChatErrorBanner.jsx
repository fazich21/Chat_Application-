import { AlertCircleIcon, XIcon } from "../shared/icons.jsx";

/**
 * Slim dismissible error bar shown above the message input
 * (e.g. "Failed to send message", "Connection lost").
 */
export default function ChatErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2.5 border-t border-red-500/20 bg-red-500/10
                    px-4 py-2.5 text-sm text-red-300 animate-slide-up">
      <AlertCircleIcon className="size-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="rounded p-0.5 text-red-400 hover:text-red-200 transition-colors"
          aria-label="Dismiss"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}
