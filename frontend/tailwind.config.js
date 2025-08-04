/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    './src/components/ui/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    variants: {
      extend: {
        opacity: ['group-hover'],
      },
    },
    extend: {
      colors: {
        wood: {
          50: '#FAF9F7',
          100: '#F5F2EE',
          200: '#E8E3DC',
          300: '#D9D3CB',
          400: '#B9B2A9',
          500: '#8B847B',
          700: '#4F4A45',
          900: '#2B2825',
        },
        primary: {
          50: '#EEF5F2',
          100: '#DDEBE6',
          200: '#C1D9CE',
          300: '#9EC5B4',
          400: '#7DAA99',
          500: '#5E927F',
          600: '#3E7C6A',
          700: '#2F6656',
          800: '#245146',
          900: '#19362F',
        },
        accent: {
          50: '#FFF1ED',
          500: '#E8836B',
          600: '#D96A50',
        },
        info: {
          600: '#7B79D1',
        },
        success: {
          600: '#22C55D',
        },
        danger: {
          600: '#EF4444',
        },
        warning: {
          600: '#D97706',
        },
        paper: {
          50: '#FFFEFC',
        },
        surface: {
          50: '#FFFFFF',
        },
        tools_bg: {
          50: '#EFEAE3',
        },
      },
    },
  },
  plugins: [],
}
