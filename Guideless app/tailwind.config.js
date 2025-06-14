/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
      },
      fontFamily: {
        'playfair': ['PlayfairDisplay-Regular'],
        'playfair-bold': ['PlayfairDisplay-Bold'],
        'playfair-black': ['PlayfairDisplay-Black'],
        'dm-sans': ['DMSans-Regular'],
        'dm-sans-medium': ['DMSans-Medium'],
        'dm-sans-bold': ['DMSans-Bold'],
      },
    },
  },
  plugins: [],
}