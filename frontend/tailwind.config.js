/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans Variable'", "sans-serif"],
        heading: ["'Outfit Variable'", "sans-serif"],
      },
      colors: {
        lime: {
          DEFAULT: "#A3E635",
          soft: "#ECFCCB",
        },
        forest: {
          DEFAULT: "#0F3D26",
          deep: "#0C2317",
        },
        page: "#F4F7F4",
        border: "#E2EBE5",
        input: "#D5E1D9",
        ring: "#65A30D",
        background: "#F4F7F4",
        foreground: "#0D1F16",
        primary: {
          DEFAULT: "#0F3D26",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#ECFCCB",
          foreground: "#1A2E05",
        },
        muted: {
          DEFAULT: "#EDF2EE",
          foreground: "#52685C",
        },
        accent: {
          DEFAULT: "#E6F4EA",
          foreground: "#0F3D26",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0D1F16",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0D1F16",
        },
        sidebar: {
          DEFAULT: "#0C2317",
          foreground: "#F0FDF4",
          primary: "#A3E635",
          "primary-foreground": "#0C2317",
          accent: "#163B29",
          "accent-foreground": "#F0FDF4",
          border: "#1E4230",
          ring: "#A3E635",
        },
      },
      borderRadius: {
        sm: "calc(0.85rem * 0.6)",
        md: "calc(0.85rem * 0.8)",
        lg: "0.85rem",
        xl: "calc(0.85rem * 1.4)",
        "2xl": "calc(0.85rem * 1.8)",
        "3xl": "calc(0.85rem * 2.2)",
      },
      keyframes: {
        "rise-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "float-slow": "float-slow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};