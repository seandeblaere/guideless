/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "galaxies-start": "#F0E8FA",
        "galaxies-middle": "#FFE9EF", 
        "galaxies-end": "#F0E8FA",
      },
    },
  },
  plugins: [],
}