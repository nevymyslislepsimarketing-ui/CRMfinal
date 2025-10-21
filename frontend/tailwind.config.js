/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nevymyslíš brand colors
        'pastel-purple': '#C8B6FF',
        'pastel-purple-dark': '#A794E8',
        'pastel-orange': '#FFD6BA',
        'pastel-orange-dark': '#FFBD98',
        primary: {
          50: '#f3f0ff',
          100: '#ebe5ff',
          200: '#d9ceff',
          300: '#C8B6FF', // pastel-purple
          400: '#b899ff',
          500: '#A794E8', // pastel-purple-dark
          600: '#8c6dd1',
          700: '#7454b3',
          800: '#5d4592',
          900: '#4d3a76',
        },
        accent: {
          50: '#fff8f0',
          100: '#fff0e0',
          200: '#ffe4c7',
          300: '#FFD6BA', // pastel-orange
          400: '#ffc89f',
          500: '#FFBD98', // pastel-orange-dark
          600: '#ffa87a',
          700: '#ff8f52',
          800: '#f57435',
          900: '#d65a1f',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
