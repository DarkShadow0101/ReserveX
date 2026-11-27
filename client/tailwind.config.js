/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#060709',
          dark: '#050507',
          sidebar: '#090A0E',
          surface: '#101219',
          card: '#141720',
          purple: '#FF4D2D',
          indigo: '#E63E20',
          accent: '#FF6B4A',
          coral: '#FF4D2D',
          emerald: '#10B981',
        },
        warm: {
          50: '#F4F1EA',
          100: '#EAE5DB',
          200: '#D8D1C4',
          300: '#B5ADA0',
          800: '#1D1E24',
          900: '#0D0E12',
        }
      },
      fontFamily: {
        display: ['"Antonio"', 'Impact', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Schibsted Grotesk"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.35), 0 2px 6px -1px rgba(0, 0, 0, 0.25)',
        'card': '0 14px 36px -6px rgba(0, 0, 0, 0.55), 0 4px 12px -2px rgba(0, 0, 0, 0.35)',
        'glow': '0 10px 28px -6px rgba(255, 77, 45, 0.42)',
      }
    },
  },
  plugins: [],
}
