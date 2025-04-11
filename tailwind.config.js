/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00B2FF',
        primaryHover: '#0096dd',
        dark: '#121824',
        lightBlue: '#A0D4FF',
        overlay: 'rgba(18, 24, 36, 0.8)',
        // 🔽 Nous colors per eliminar els hardcoded
        softWhite: '#eaf6ff',
        softBlue: '#90cdf4',
        deepBlue: '#001f3f',
        deeperBlue: '#002d5b',
        paragraphLight: '#e0f2ff',
        paragraphLighter: '#cceeff',
      },
    },
  },
  plugins: [],
};
