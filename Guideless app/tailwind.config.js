/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
      },
      fontFamily: {
        'playfair': ['PlayfairDisplay_400Regular'],
        'playfair-bold': ['PlayfairDisplay_700Bold'],
        'playfair-black': ['PlayfairDisplay_900Black'],
        'dm-sans': ['DMSans_400Regular'],
        'dm-sans-medium': ['DMSans_500Medium'],
        'dm-sans-bold': ['DMSans_700Bold'],
      },
    },
  },
  plugins: [],
}