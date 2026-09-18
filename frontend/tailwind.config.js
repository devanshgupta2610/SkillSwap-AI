/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0B0F',
          50: '#16161D',
          100: '#1C1C24',
          200: '#24242E',
          300: '#2E2E3A',
        },
        accent: {
          DEFAULT: '#4F7FFF',
          soft: '#7AA0FF',
          muted: 'rgba(79, 127, 255, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.35)',
        soft: '0 10px 40px rgba(79, 127, 255, 0.12)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(ellipse at top, rgba(79,127,255,0.18), transparent 55%), radial-gradient(ellipse at bottom, rgba(11,11,15,1), #0B0B0F)',
      },
    },
  },
  plugins: [],
}
