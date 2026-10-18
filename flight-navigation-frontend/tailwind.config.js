/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Aeronautical-chart palette
        paper: "#EEF3F4",
        sheet: "#FFFFFF",
        ink: { DEFAULT: "#13293D", soft: "#4A5E70" },
        rule: "#C9D6DC",
        magenta: "#B0186A",
        chart: "#1F5F99",
        buff: "#C9A227",
        go: "#2E7D4F",
        hold: "#B4441C",
      },
      fontFamily: {
        display: ['"Barlow Semi Condensed"', "Barlow", "sans-serif"],
        sans: ["Barlow", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
