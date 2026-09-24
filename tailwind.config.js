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
        background: {
          light: '#f8fafc',
          dark: '#09090b',
        },
        surface: {
          light: '#ffffff',
          dark: '#121215',
          'dark-elevated': '#18181b',
        },
        border: {
          light: '#e2e8f0',
          dark: '#27272a',
        },
        brand: {
          dark: '#080E10',
          base: '#0D1619',
          card: '#132226',
          cardHover: '#172B30',
          border: '#1E353B',
          borderLight: '#264A52',
          emerald: '#00E599',
          emeraldLight: '#10B981',
          emeraldDark: '#00B377',
          muted: '#6C868E',
          subtext: '#9CB3B9',
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -4px rgba(0, 229, 153, 0.28)',
        'glow-emerald-lg': '0 0 45px -8px rgba(0, 229, 153, 0.35)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
