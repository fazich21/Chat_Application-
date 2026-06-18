/**
 * Shared two-column layout for all auth pages.
 * Left: decorative brand panel   Right: form card
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

      {/* ── Left brand panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between
                      bg-gray-950 dark:bg-black p-12 relative overflow-hidden shrink-0">

        {/* Grid texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orb */}
        <div className="pointer-events-none absolute -top-32 -left-32 size-[480px] rounded-full
                        bg-brand-600 opacity-[0.12] blur-[96px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 size-[320px] rounded-full
                        bg-indigo-500 opacity-[0.08] blur-[80px]" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="size-4">
                <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Pulse</span>
          </div>
        </div>

        {/* Testimonial / tagline */}
        <div className="relative z-10 space-y-8">
          <blockquote className="space-y-4">
            <p className="text-2xl font-light text-white leading-relaxed">
              "Real-time conversations,<br />
              <span className="text-brand-400 font-medium">wherever you are.</span>"
            </p>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500
                              flex items-center justify-center text-white text-sm font-semibold">
                P
              </div>
              <div>
                <p className="text-sm font-medium text-white">Pulse Chat</p>
                <p className="text-xs text-gray-400">Modern messaging platform</p>
              </div>
            </div>
          </blockquote>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["End-to-end encrypted", "Group chats", "Image sharing", "Always online"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-gray-700 px-3 py-1
                           text-xs text-gray-400"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p className="relative z-10 text-xs text-gray-600">
          © {new Date().getFullYear()} Pulse. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">

        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="size-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="size-3.5">
              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-base tracking-tight">
            Pulse
          </span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>

          {/* Form card content */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm
                          dark:border-gray-800 dark:bg-gray-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
