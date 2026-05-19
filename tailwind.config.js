/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#FFD93D",
        secondary: "#1E3A8A",
        darkbg: "#050816",
        electric: "#00F5FF",
      },

      boxShadow: {
        glow: "0 0 20px rgba(0,245,255,0.5)",
      },
    },
  },

  plugins: [],
}