/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Toggle dark theme support
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0f172a',
          light: '#f8fafc',
        },
        panel: {
          dark: 'rgba(30, 41, 59, 0.45)',
          light: 'rgba(255, 255, 255, 0.65)',
        },
        accent: {
          primary: '#7c3aed', // Purple glow
          secondary: '#10b981', // Emerald success
          warning: '#f59e0b', // Amber alert
          danger: '#ef4444', // Red critical
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(148, 163, 184, 0.15)',
        'glow-primary': '0 0 20px rgba(124, 58, 237, 0.3)',
      },
      borderRadius: {
        glass: '16px',
      }
    },
  },
  plugins: [],
}
