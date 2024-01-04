/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        "thpink": "rgb(252, 148, 187)"
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { left: '-20px' },
          '50%': { left: '20px' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        popIn: {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        wiggle0: 'wiggle 1s ease-in-out 0.05s infinite',
        wiggle1: 'wiggle 1s ease-in-out 0.1s infinite',
        wiggle2: 'wiggle 1s ease-in-out 0.15s infinite',
        wiggle3: 'wiggle 1s ease-in-out 0.2s infinite',
        wiggle4: 'wiggle 1s ease-in-out 0.25s infinite',
        wiggle5: 'wiggle 1s ease-in-out 0.3s infinite',
        wiggle6: 'wiggle 1s ease-in-out 0.35s infinite',
        wiggle7: 'wiggle 1s ease-in-out 0.4s infinite',
        wiggle8: 'wiggle 1s ease-in-out 0.45s infinite',
        wiggle9: 'wiggle 1s ease-in-out 0.5s infinite',
        fadeIn: 'fadeIn 0.1s',
        popIn: 'popIn 0.2s',
      }
    },
  },
  plugins: [],
}

