/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: ['"Dancing Script"', '"Be Vietnam Pro"', 'cursive'],
        serif: ['Lora', '"Noto Serif"', 'Georgia', 'serif'],
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      keyframes: {
        lanternSway: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        cloudDrift: {
          '0%, 100%': { transform: 'translate(0)' },
          '50%': { transform: 'translate(18px)' },
        },
        flagWave: {
          '0%, 100%': { transform: 'rotate(0) skewY(0)' },
          '50%': { transform: 'rotate(2.5deg) skewY(1.5deg)' },
        },
        drumVibrate: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.03) rotate(-1deg)' },
          '75%': { transform: 'scale(0.98) rotate(1deg)' },
        },
        sparkleTwinkle: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(0.8) rotate(0)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(45deg)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      animation: {
        'flag-wave': 'flagWave 3.5s ease-in-out infinite',
        'sparkle-1': 'sparkleTwinkle 2.5s ease-in-out infinite',
        'sparkle-2': 'sparkleTwinkle 3s ease-in-out 0.8s infinite',
        'sparkle-3': 'sparkleTwinkle 2.2s ease-in-out 1.4s infinite',
        'float-gentle': 'floatGentle 4s ease-in-out infinite',
        'drum-hover': 'drumVibrate 0.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
