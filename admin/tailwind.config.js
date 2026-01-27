/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { 'primary': "#2563EB" },
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