// PURPOSE: Defines Tailwind scan paths and design tokens for the Vite React frontend.
// USAGE: Tailwind reads this file during development and production CSS builds.

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f3",
          100: "#d8f0e3",
          500: "#278560",
          600: "#1f6d50",
          700: "#1c5944",
        },
        ink: "#17211d",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(23, 33, 29, 0.08)",
      },
    },
  },
  plugins: [],
};
