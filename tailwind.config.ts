import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1760px"
    },
    extend: {
      minHeight: {
        touch: "var(--touch-target)",
        "screen-dynamic": "100dvh"
      },
      minWidth: {
        touch: "var(--touch-target)"
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        panel: "var(--panel)",
        panelMuted: "var(--panel-muted)",
        border: "var(--border)",
        accent: "var(--accent)",
        accentSoft: "var(--accent-soft)",
        primary: "#ffffff",
        "primary-foreground": "#000000",
        muted: {
          foreground: "rgba(255,255,255,0.6)"
        }
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "1.75rem"
      },
      boxShadow: {
        paper: "0 18px 40px color-mix(in oklab, var(--ink-shadow) 18%, transparent)",
        inset: "inset 0 1px 0 color-mix(in oklab, white 75%, transparent)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, color-mix(in oklab, var(--accent-soft) 58%, transparent) 0, transparent 38%), radial-gradient(circle at bottom right, color-mix(in oklab, var(--ink-shadow) 18%, transparent) 0, transparent 52%)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: "var(--font-body)",
        mono: ["ui-monospace", "monospace"],
        geist: ['"Geist Sans"', "system-ui", "sans-serif"]
      },
      keyframes: {
        "marquee-scroll": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        "marquee-scroll": "marquee-scroll 20s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
