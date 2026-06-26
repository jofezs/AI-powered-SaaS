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
        bark: {
          darkest: '#2a1a0a',
          dark:    '#3b2412',
          mid:     '#5a3e28',
          light:   '#8b5e2a',
          pale:    '#c9a470',
          cream:   '#f5d9a8',
        },
        parchment: {
          DEFAULT: '#fdf8e1',
          dark:    '#f5efcc',
          line:    '#d4c9a0',
          border:  '#d4b896',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}