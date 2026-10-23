/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF9F6',
        ivory: {
          50: '#FCFCFA',
          100: '#F7F5F0',
          200: '#EFECE4',
          300: '#E4DFD5',
        },
        charcoal: {
          50: '#F5F5F4',
          100: '#E8E6E1',
          200: '#D1CEC7',
          300: '#A3A29E',
          400: '#7B7974',
          500: '#5A5854',
          600: '#3E3D3A',
          700: '#2C2B29',
          800: '#1F1E1D',
          900: '#141413',
        },
        sage: {
          50: '#F4F7F5',
          100: '#E5EDE7',
          200: '#C8D9CD',
          300: '#A3BFAC',
          400: '#7DA48B',
          500: '#5E8B6E',
          600: '#486E56',
          700: '#375442',
          800: '#293F32',
          900: '#1C2B22',
        },
        forest: {
          700: '#233F2E',
          800: '#1A3023',
          900: '#112118',
        },
        terracotta: {
          50: '#FAF3F0',
          100: '#F4E3DD',
          200: '#E8C5B8',
          300: '#DBA391',
          400: '#CE8069',
          500: '#C25E43',
          600: '#A64B33',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(20, 20, 19, 0.04), 0 1px 2px rgba(20, 20, 19, 0.02)',
        'soft': '0 4px 20px -2px rgba(20, 20, 19, 0.05), 0 2px 6px -1px rgba(20, 20, 19, 0.02)',
        'soft-lg': '0 12px 32px -4px rgba(20, 20, 19, 0.08), 0 4px 12px -2px rgba(20, 20, 19, 0.03)',
        'float': '0 20px 48px -8px rgba(20, 20, 19, 0.12), 0 8px 20px -4px rgba(20, 20, 19, 0.05)',
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}

