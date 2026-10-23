/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FFFFFF',
        primary: {
          DEFAULT: '#FF385C',
          hover: '#E00B41',
        },
        coral: {
          DEFAULT: '#FF385C',
          50: '#FFF0F2',
          100: '#FFE2E6',
          200: '#FFC5CC',
          300: '#FF94A2',
          400: '#FF667D',
          500: '#FF385C',
          600: '#E00B41',
          700: '#D70466',
          800: '#B00244',
          900: '#8A0033',
        },
        ivory: {
          50: '#FFFFFF', // Background White
          100: '#F7F7F7', // Soft background Light gray
          200: '#F2F2F2', // Hover background
          300: '#DDDDDD', // Borders
        },
        charcoal: {
          50: '#F7F7F7', // Soft background
          100: '#F2F2F2', // Hover background
          200: '#DDDDDD', // Borders
          300: '#B0B0B0',
          400: '#717171', // Secondary text Gray
          500: '#717171', // Secondary text Gray
          600: '#484848',
          700: '#333333',
          800: '#222222', // Dark text Near-black
          900: '#222222', // Dark text Near-black
        },
        sage: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#008A05', // Success Green
          600: '#008A05', // Success Green
          700: '#007004',
          800: '#005503',
          900: '#003B02',
        },
        forest: {
          50: '#FFF0F2',
          100: '#FFE2E6',
          200: '#FFC5CC',
          600: '#FF385C',
          700: '#E00B41',
          800: '#FF385C', // Primary accent Coral
          900: '#D70466',
        },
        terracotta: {
          50: '#FFF0F2',
          100: '#FFE2E6',
          200: '#FFC5CC',
          300: '#FF94A2',
          400: '#FF667D',
          500: '#FF385C',
          600: '#E00B41',
        },
        success: {
          DEFAULT: '#008A05',
          light: '#DCFCE7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(34, 34, 34, 0.04), 0 1px 2px rgba(34, 34, 34, 0.02)',
        'soft': '0 4px 20px -2px rgba(34, 34, 34, 0.06), 0 2px 6px -1px rgba(34, 34, 34, 0.03)',
        'soft-lg': '0 12px 32px -4px rgba(34, 34, 34, 0.09), 0 4px 12px -2px rgba(34, 34, 34, 0.04)',
        'float': '0 20px 48px -8px rgba(34, 34, 34, 0.12), 0 8px 20px -4px rgba(34, 34, 34, 0.06)',
        'coral': '0 4px 16px -2px rgba(255, 56, 92, 0.35)',
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
