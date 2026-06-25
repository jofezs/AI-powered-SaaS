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
        // Dark sidebar palette
        sidebar: {
          bg: '#0f1117',
          border: '#1e2130',
        },
        // Main content area
        dark: {
          bg: '#13151f',
          card: '#1a1d2e',
          hover: '#1f2237',
          border: '#252840',
        },
        // Brand accent
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          light: '#818cf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}