/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Đỏ son – màu chủ đạo (sidebar, header, nút chính)
        primary: {
          50: '#FDF3F2', 100: '#FBE3E1', 200: '#F6C4C0', 300: '#EE9890', 400: '#E1645A',
          500: '#C93A2F', 600: '#A82820', 700: '#8A1F19', 800: '#6E1914', 900: '#5B0E0E', 950: '#3A0807',
        },
        // Vàng kim – điểm nhấn, vinh danh
        gold: {
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D', 400: '#FBBF24',
          500: '#F59E0B', 600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F',
        },
        // Chữ nâu mực & nền giấy dó
        ink: { DEFAULT: '#2D241E', soft: '#5C4A3D', muted: '#8A7666' },
        paper: { DEFAULT: '#FFFCF5', warm: '#FBF4E6', line: '#EEDFC6' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(91,14,14,0.04), 0 4px 14px -4px rgba(120,53,15,0.10)',
        'card-hover': '0 2px 4px rgba(91,14,14,0.06), 0 12px 28px -8px rgba(120,53,15,0.22)',
        pop: '0 20px 60px -12px rgba(58,8,7,0.45)',
        'inner-gold': 'inset 0 0 0 1px rgba(245,158,11,0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
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
        pointFloat: {
          '0%': { opacity: '0', transform: 'translate(-50%, 0) scale(0.6)' },
          '15%': { opacity: '1', transform: 'translate(-50%, -8px) scale(1.15)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -64px) scale(1)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.94) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        cardBump: {
          '0%, 100%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.04)' },
        },
      },
      animation: {
        'point-float': 'pointFloat 1.1s ease-out forwards',
        'pop-in': 'popIn 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2) both',
        'fade-in': 'fadeIn 0.18s ease-out both',
        'card-bump': 'cardBump 0.35s ease-out',
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
