/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        accent: {
          magenta: "#D946EF",
          mint:    "#34D399",
          amber:   "#FBBF24",
        },
        surface: {
          base:     "#0B0E14",
          raised:   "#11151F",
          overlay:  "#161B26",
          border:   "#232938",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "gradient-bubble":  "linear-gradient(135deg, #6366F1 0%, #D946EF 100%)",
        "gradient-glow":    "linear-gradient(180deg, rgba(99,102,241,0.25) 0%, rgba(217,70,239,0.08) 100%)",
        "gradient-active":  "linear-gradient(90deg, rgba(99,102,241,0.16) 0%, rgba(99,102,241,0) 70%)",
      },
      boxShadow: {
        subtle:    "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        message:   "0 2px 8px 0 rgb(0 0 0 / 0.08)",
        glow:      "0 0 0 1px rgba(99,102,241,0.15), 0 8px 24px -8px rgba(99,102,241,0.35)",
        "glass":   "0 8px 32px -8px rgb(0 0 0 / 0.45)",
      },
      animation: {
        "fade-in":      "fadeIn 0.15s ease-out",
        "slide-up":     "slideUp 0.2s ease-out",
        "slide-in-right": "slideInRight 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
        "slide-in-left":  "slideInLeft 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
        "bounce-dot":   "bounceDot 1.4s infinite ease-in-out both",
        "pop-in":       "popIn 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "pulse-ring":   "pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":    "spin 1.5s linear infinite",
      },
      keyframes: {
        fadeIn:       { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:      { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { "0%": { opacity: "0", transform: "translateX(24px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        slideInLeft:  { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(0)" } },
        bounceDot:    { "0%, 80%, 100%": { transform: "scale(0)" }, "40%": { transform: "scale(1)" } },
        popIn:        { "0%": { opacity: "0", transform: "scale(0.92)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        pulseRing:    { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
      },
    },
  },
  plugins: [],
};
