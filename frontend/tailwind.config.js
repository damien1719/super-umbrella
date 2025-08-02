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
        },
      },
    },
  },
  plugins: [],
}
