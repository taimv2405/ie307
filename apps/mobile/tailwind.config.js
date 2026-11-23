const { current, transparent, black, white } = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    colors: {
      current,
      transparent,
      black,
      white,
      background: "rgb(var(--background) / <alpha-value>)",
      foreground: "rgb(var(--foreground) / <alpha-value>)",
      card: {
        DEFAULT: "rgb(var(--card) / <alpha-value>)",
        foreground: "rgb(var(--card-foreground) / <alpha-value>)",
      },
      popover: {
        DEFAULT: "rgb(var(--popover) / <alpha-value>)",
        foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
      },
      primary: {
        DEFAULT: "rgb(var(--primary) / <alpha-value>)",
        foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
      },
      secondary: {
        DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
        foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
      },
      muted: {
        DEFAULT: "rgb(var(--muted) / <alpha-value>)",
        foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
      },
      accent: {
        DEFAULT: "rgb(var(--accent) / <alpha-value>)",
        foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
      },
      destructive: {
        DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
        foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
      },
      border: "rgb(var(--border) / <alpha-value>)",
      input: "rgb(var(--input) / <alpha-value>)",
      ring: "rgb(var(--ring) / <alpha-value>)",
    },
  },
  plugins: [],
};
