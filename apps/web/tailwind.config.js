/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff4f1', 100: '#ffe4db', 200: '#ffc7b8', 300: '#ffa088', 400: '#ff8266',
          500: '#ff6b4a', 600: '#ff5a36', 700: '#e8481f', 800: '#c23916', 900: '#9c2d10', 950: '#5c1a09',
        },
        ink: {
          50: '#faf7f2', 100: '#f4ede4', 200: '#dcdfe6', 300: '#bcc1cd', 400: '#8b92a3',
          500: '#666e82', 600: '#4d5468', 700: '#3a4054', 800: '#262b3d', 900: '#171a26', 950: '#0d0f17',
        },
        coral: {
          50: '#fff4f1', 100: '#ffe4db', 400: '#ff8266', 500: '#ff6b4a', 600: '#ff5a36', 700: '#e8481f', 800: '#c23916',
        },
        ocean: {
          400: '#6386ff', 500: '#3f5eff', 600: '#2a3bf5', 700: '#222dd6', 900: '#1f2887',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(23 26 38 / 0.04), 0 1px 3px 0 rgb(23 26 38 / 0.06)',
        card: '0 2px 8px -2px rgb(23 26 38 / 0.06), 0 4px 16px -4px rgb(23 26 38 / 0.08)',
        lift: '0 8px 24px -6px rgb(23 26 38 / 0.12), 0 4px 10px -4px rgb(23 26 38 / 0.08)',
        glow: '0 0 0 4px rgb(255 90 54 / 0.15)',
        'coral-lift': '0 10px 24px -8px rgb(255 90 54 / 0.45)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'slide-down': { from: { opacity: 0, transform: 'translateY(-6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'pulse-ring': { '0%': { transform: 'scale(0.9)', opacity: 1 }, '100%': { transform: 'scale(1.8)', opacity: 0 } },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slide-down 0.2s ease-out',
        'scale-in': 'scale-in 0.18s ease-out',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite',
      },
    },
  },
  plugins: [],
};
