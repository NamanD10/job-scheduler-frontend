import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        cobalt: "rgb(var(--color-cobalt) / <alpha-value>)",
        done: "rgb(var(--color-done) / <alpha-value>)",
        pending: "rgb(var(--color-pending) / <alpha-value>)",
        failed: "rgb(var(--color-failed) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "stat": ["2.75rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
    },
  },
  plugins: [],
};
export default config;
