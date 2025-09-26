/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'background-primary': '#0D0D0D',
        'background-secondary': '#1A1A1A',
        'accent': '#F97316',
        'text-primary': '#FFFFFF',
        'text-secondary': '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
