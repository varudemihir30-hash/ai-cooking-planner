/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          lightBlue: '#D6EAF8',
          blue: '#B8D8E8',
          offWhite: '#F8F6F2',
          white: '#FAFAFA',
          grayLight: '#9CA3AF',
          gray: '#6B7280',
          grayDark: '#374151',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
