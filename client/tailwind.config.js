/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      colors: {
        darkBg: "#FFFFFF",
        darkCard: "#F8FAFC",
        darkBorder: "#E2E8F0",
        lightBg: "#FFFFFF",
        lightCard: "#F8FAFC",
        lightBorder: "#E2E8F0",
        darkText: "#0A0A0A",
        offWhite: "#F8FAFC",
        oceanBlue: "#00A3FF",
        deepBlue: "#0066FF",
        sunsetAmber: "#00A3FF",
        sunsetOrange: "#0066FF",
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        sans: ['Montserrat', 'sans-serif'],
        mono: ['Montserrat', 'monospace'],
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(135deg, #00A3FF 0%, #0066FF 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #FF7A30 0%, #FFB347 100%)',
        'orange-gradient': 'linear-gradient(135deg, #FF7A30 0%, #FFB347 100%)',
        'beach-gradient': 'linear-gradient(135deg, #FF7A30 0%, #FFB347 100%)',
        'blue-glow': 'radial-gradient(circle, rgba(0,163,255,0.15) 0%, rgba(255,255,255,0) 70%)',
        'orange-glow': 'radial-gradient(circle, rgba(255,122,48,0.2) 0%, rgba(255,255,255,0) 70%)',
      }
    },
  },
  plugins: [],
}
