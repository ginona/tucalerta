/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['DM Sans', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        alert: {
          flood: '#0ea5e9',
          power: '#f59e0b',
        },
        severity: {
          low: '#22c55e',
          medium: '#f59e0b',
          high: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
