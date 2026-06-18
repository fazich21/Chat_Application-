/**
 * Reusable labelled input with inline error display.
 * Forwards all standard <input> props.
 */
export default function InputField({
  id,
  label,
  error,
  icon: Icon,
  rightElement,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Icon className="size-4 text-gray-400 dark:text-gray-500" />
          </span>
        )}
        <input
          id={id}
          className={[
            "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900",
            "placeholder:text-gray-400 transition duration-150 outline-none",
            "focus:ring-2 focus:border-brand-400",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500",
            Icon ? "pl-10" : "",
            rightElement ? "pr-10" : "",
            error
              ? "border-red-400 focus:ring-red-300/40 dark:border-red-500"
              : "border-gray-200 focus:ring-brand-500/40 dark:border-gray-700",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {rightElement && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
          <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 4.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5zm-.75 6a.875.875 0 1 0 0-1.75.875.875 0 0 0 0 1.75z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
