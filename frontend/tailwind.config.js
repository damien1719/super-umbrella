/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    './src/components/ui/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#FAF9F7',
          100: '#f0e9e0',
          200: '#e0d4c2',
          // Ajoutez d'autres nuances si nécessaire
        },
      },
    },
  },
  plugins: [],
}
