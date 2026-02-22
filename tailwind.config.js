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
        },
        /* shadcn-compatible tokens for Athena components */
        border: '#2a2a3a',
        background: '#0a0a0f',
        foreground: '#f1f5f9',
        primary: {
          DEFAULT: '#06b6d4',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#1e1e2e',
          foreground: '#94a3b8',
        },
        card: {
          DEFAULT: '#1a1a25',
          foreground: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
