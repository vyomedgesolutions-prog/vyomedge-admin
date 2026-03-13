/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7600C4',
        secondary: '#D300E5',
        accent: '#4CFFE7',
        dark: '#0D0D14',
        darker: '#080810',
      }
    },
  },
  plugins: [],
}
