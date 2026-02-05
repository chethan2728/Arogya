/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // 👈 very important!
  ],
  theme: {
    extend: {
      colors:{
        'primary': '#54E2F6',
        'deep': '#081A24',
        'surface': '#0F2A36',
        'mist': '#A9E8F5',
      },
        gridTemplateColumns: {
          'auto': 'repeat(auto-fit, minmax(150px, 1fr))'
      }
    },
  },
  plugins: [],
}
