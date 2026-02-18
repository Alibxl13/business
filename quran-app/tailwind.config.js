/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#022c22'
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#c9a04c',
          600: '#b7832a',
          700: '#92650a',
          800: '#78530d',
          900: '#633d10',
        },
        islamic: {
          green:  '#1a5f3f',
          darkGreen: '#0d3320',
          gold:   '#c9a04c',
          cream:  '#faf7f0',
          parchment: '#f5f0e8',
        }
      },
      fontFamily: {
        arabic: ['"Amiri Quran"', 'Amiri', 'serif'],
        amiri:  ['Amiri', 'serif'],
        sans:   ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },              '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideIn: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
      }
    }
  },
  plugins: []
}
