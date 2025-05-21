import { createThemes } from "tw-colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontSize: {
      sm: "12px",
      base: "14px",
      xl: "16px",
      "2xl": "20px",
      "3xl": "28px",
      "4xl": "38px",
      "5xl": "50px",
    },

    extend: {
      fontFamily: {
        inter: ["'Inter'", "sans-serif"],
        gelasio: ["'Gelasio'", "serif"],
      },
    },
  },
  plugins: [
    createThemes({
      light: {
        white: "#FFFFFF",
        black: "#242424",
        grey: "#d9d9d9",
        "light-grey": "#F3F3F3",
        "dark-grey": "#6B6B6B",
        red: "#FF4E4E",
        transparent: "transparent",
        twitter: "#1DA1F2",
        blue: "#4e00ff",
        malibu: '#7bc4ff',
        purple: "#851aff",
        magenta: "#c833ff",
      },
      dark: {
        white: "#242424",
        black: "#F3F3F3",
        grey: "#404040",
        "light-grey": "#2A2A2A",
        "dark-grey": "#E7E7E7",
        // red: "#991F1F",
        red: "#FF4E4E",
        transparent: "transparent",
        twitter: "#0E71A8",
        blue: "#834dff",
        malibu: '#7bc4ff',
        purple: "#a04dff",
        magenta: "#c833ff",
      },
    }),
  ],
};
