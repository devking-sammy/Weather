/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        skytech: "#38bdf8",
        darkblue: "#0f172a",
        neon: "#67e8f9",
      },
      boxShadow: {
        glow: "0 0 20px rgba(56, 189, 248, 0.6)",
      },
    },
  },
  plugins: [],
};
