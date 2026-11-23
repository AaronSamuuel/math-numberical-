/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070D1E',
          900: '#0B132B',
          800: '#152238',
          700: '#1C2E4A',
          600: '#273E63',
        },
        satellite: {
          cyan: '#06B6D4',
          blue: '#0284C7',
          sky: '#38BDF8',
          teal: '#14B8A6',
          amber: '#F59E0B',
          rose: '#F43F5E',
          emerald: '#10B981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
