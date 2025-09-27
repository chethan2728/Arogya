/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // 👈 very important!
  ],
  theme: {
    extend: {
      colors:{
        'primary': '#B9A5E2',
      },
        gridTemplateColumns: {
          'auto': 'repeat(auto-fit, minmax(150px, 1fr))'
      }
    },
  },
  plugins: [],
}
