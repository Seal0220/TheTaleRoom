/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        tale: {
          ink: "#080B14",
          night: "#12172A",
          plum: "#4A235F",
          rose: "#D982A4",
          gold: "#E8C47D",
          mist: "#C9D5E8",
          moss: "#7DA083",
        },
      },
      boxShadow: {
        lantern: "0 0 36px rgba(232, 196, 125, 0.24)",
      },
    },
  },
  plugins: [],
};

export default config;
