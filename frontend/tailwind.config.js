/** @type {import('tailwindcss').Config} */
export default {
  // Tells Tailwind where to look for class names
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      // Adds the custom animation for the "Meet" input
      animation: {
        'fade-in-down': 'fade-in-down 0.3s ease-out forwards',
      },
      keyframes: {
        'fade-in-down': {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}

