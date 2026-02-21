/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gaia: {
          dark: '#0a0a0f',
          surface: '#111118',
          card: '#1a1a25',
          border: '#2a2a3a',
          cyan: '#06b6d4',
          gold: '#f59e0b',
          text: '#f1f5f9',
          muted: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
