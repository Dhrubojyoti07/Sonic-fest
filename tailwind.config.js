/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08070e",
        surface: {
          DEFAULT: "#0f0d1b",
          subtle: "#141124",
          elevated: "#1a1630",
          border: "rgba(255, 255, 255, 0.08)",
          "border-bright": "rgba(255, 255, 255, 0.16)",
        },
        primary: {
          DEFAULT: "#ff007a",
          hover: "#e6006e",
          glow: "rgba(255, 0, 122, 0.4)",
        },
        accent: {
          purple: "#8b5cf6",
          violet: "#a855f7",
          glow: "rgba(139, 92, 246, 0.4)",
          cyan: "#00f0ff",
        },
        foreground: {
          DEFAULT: "#f8fafc",
          muted: "#94a3b8",
          dark: "#64748b",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 30px rgba(255, 0, 122, 0.35)",
        "glow-purple": "0 0 35px rgba(139, 92, 246, 0.35)",
        "glow-lg": "0 0 60px rgba(255, 0, 122, 0.25)",
        card: "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "radial-festival":
          "radial-gradient(circle at 50% 0%, rgba(255, 0, 122, 0.18) 0%, rgba(139, 92, 246, 0.12) 35%, transparent 70%)",
        "radial-spotlight":
          "radial-gradient(circle at 50% 50%, rgba(255, 0, 122, 0.15) 0%, transparent 60%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-slow": "pulseSlow 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};
