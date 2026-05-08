/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#f0f4ff', 100: '#e0eaff', 200: '#c0d5ff', 300: '#91b4ff', 400: '#608aff', 500: '#3d63ff', 600: '#2244f5', 700: '#1a30e0', 800: '#1c2bb5', 900: '#1c2a8e', 950: '#141a5c' },
      },
    },
  },
  plugins: [],
};
