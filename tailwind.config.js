/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07070A',
        panel: '#101016',
        neon: '#00E5FF',
        purple: '#A855F7',
        violet: '#7C3AED',
        muted: '#9696A5',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        pulseRing: {
          '0%': { transform: 'scale(.8)', opacity: '.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        scrollDot: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(14px)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        floaty: 'floaty 7s ease-in-out infinite',
        pulseRing: 'pulseRing 2.2s ease-out infinite',
        scrollDot: 'scrollDot 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
