/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Fredoka', 'Baloo 2', 'sans-serif'],
        body: ['Manrope', 'Inter', 'sans-serif'],
      },
      colors: {
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        mint: {
          400: '#34d399',
          500: '#10b981',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
