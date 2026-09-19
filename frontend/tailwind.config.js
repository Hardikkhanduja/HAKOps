/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist Variable", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        brand:           "var(--brand)",
        "brand-dark":    "var(--brand-dark)",
        "brand-tint":    "var(--brand-tint)",
        surface:         "var(--surface)",
        background:      "var(--surface)",
        foreground:      "var(--text-primary)",
        card: {
          DEFAULT:       "var(--card)",
          foreground:    "var(--text-primary)",
        },
        primary: {
          DEFAULT:       "var(--brand)",
          foreground:    "#ffffff",
        },
        secondary: {
          DEFAULT:       "var(--brand-tint)",
          foreground:    "var(--brand)",
        },
        muted: {
          DEFAULT:       "var(--muted-fill)",
          foreground:    "var(--text-secondary)",
        },
        accent: {
          DEFAULT:       "var(--brand-tint)",
          foreground:    "var(--brand)",
        },
        destructive: {
          DEFAULT:       "var(--status-danger)",
          foreground:    "#ffffff",
        },
        border:  "var(--border)",
        input:   "var(--border)",
        ring:    "var(--brand)",
      },
      minHeight: {
        row:  "56px",
        btn:  "52px",
      },
    },
  },
  plugins: [],
};