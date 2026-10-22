/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          sidebar: '#E5EEE3',
          sidebarHover: '#DCE8DA',
          sidebarActive: '#D0E3D1',
          bg: '#F7F8F3',
          card: '#FFFFFF',
          panel: '#F0F5EC',
          border: '#DCE5DA',
          primary: '#26734D',
          button: '#278653',
          buttonHover: '#227549',
          mint: '#B8E2C1',
        },
        sidebar: {
          DEFAULT: '#E5EEE3',
          hover: '#DCE8DA',
          active: '#D0E3D1',
        },
        dark: {
          950: '#E5EEE3', // compatibility fallback to sage
          900: '#F7F8F3', // main page off-white
          850: '#FFFFFF', // cards
          800: '#F0F5EC', // elevated cards/inputs
          750: '#E5EEE3',
          700: '#DCE8DA',
          border: '#DCE5DA',
        },
        mint: {
          50: '#F5FAF6',
          100: '#E5EEE3',
          200: '#D0E3D1',
          300: '#B8E2C1',
          400: '#52A779',
          500: '#278653',
          600: '#26734D',
          700: '#1D5A3C',
        },
        content: {
          primary: '#202C25',   // deep charcoal-green text
          secondary: '#56645A', // medium grey-green text
          muted: '#778279',     // subtle grey text
        },
        status: {
          warning: '#8A5A00',
          warningBg: '#FFF5DD',
          warningBorder: '#E8D8A7',
          info: '#245D9C',
          infoBg: '#EAF3FF',
          infoBorder: '#BFD9F8',
          error: '#A42D2D',
          errorBg: '#FDECEC',
          errorBorder: '#F5C2C2',
        }
      },
      fontSize: {
        'page-title': ['30px', { lineHeight: '36px', fontWeight: '700' }],
        'metric-val': ['32px', { lineHeight: '36px', fontWeight: '700' }],
      }
    },
  },
  plugins: [],
}
