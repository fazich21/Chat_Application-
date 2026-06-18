/**
 * Button — variant: primary | ghost | danger | outline
 */
const variants = {
  primary: `bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800
             disabled:bg-brand-300 dark:disabled:bg-brand-900`,
  ghost:   `text-gray-600 hover:bg-gray-100 active:bg-gray-200
             dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700`,
  danger:  `bg-red-500 text-white hover:bg-red-600 active:bg-red-700
             disabled:bg-red-300`,
  outline: `border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100
             dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800`,
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl",
        "px-4 py-2.5 text-sm font-medium transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50",
        "disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]",
        variants[variant],
        className,
      ].join(" ")}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : Icon ? (
        <Icon className="size-4" />
      ) : null}
      {children}
    </button>
  );
}
