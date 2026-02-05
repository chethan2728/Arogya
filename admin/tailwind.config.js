/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary': '#54E2F6',
        'deep': '#081A24',
        'surface': '#0F2A36',
        'mist': '#A9E8F5',
      },
      animation: {
        'spin-slow': 'spin 5s linear infinite',
        'sparkle': 'sparkle 1s ease-in-out infinite',
      },
      keyframes: {
        sparkle: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1) contrast(1)' },
          '50%': { opacity: '0.4', filter: 'brightness(2.5) contrast(1.2)' },
        },
      },
    },
  },
}
