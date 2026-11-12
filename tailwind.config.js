/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080a10",
        surface: "#101424",
        "surface-light": "#192038",
        border: "#253052",
        neon: {
          cyan: "#00F0FF",
          pink: "#FF007F",
          purple: "#9D4EDD",
          yellow: "#FFE600",
          green: "#00FFA3",
          red: "#FF2A55",
          orange: "#FF7700",
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2s infinite ease-in-out",
        "shake": "shake 0.4s ease-in-out",
        "pop": "pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0, 240, 255, 0.15)" },
          "50%": { boxShadow: "0 0 30px rgba(0, 240, 255, 0.6), inset 0 0 18px rgba(0, 240, 255, 0.3)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-8px)" },
          "40%, 80%": { transform: "translateX(8px)" },
        },
        pop: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "80%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        neon: "0 0 20px -3px var(--tw-shadow-color)",
        "neon-lg": "0 0 35px -3px var(--tw-shadow-color)",
      },
    },
  },
  plugins: [],
};
