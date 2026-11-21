/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B0F19',
          dark: '#080C15',
          sidebar: '#0E1322',
          surface: '#151C30',
          card: '#1B243B',
          purple: '#5B4CF2',
          indigo: '#4F46E5',
          accent: '#6366F1',
          coral: '#FF5A5F',
        },
        warm: {
          50: '#FDFCF9',
          100: '#FAF7F2',
          200: '#F4EFEB',
          300: '#EAE2DA',
          800: '#2A2421',
          900: '#1A1615',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 10px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 25px rgba(91, 76, 242, 0.35)',
      }
    },
  },
  plugins: [],
}
