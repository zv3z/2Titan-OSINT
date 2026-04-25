import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eefbf3',
          100: '#d6f5e3',
          200: '#b0ebcb',
          300: '#7ddaab',
          400: '#48c185',
          500: '#25a569',
          600: '#178554',
          700: '#136a45',
          800: '#125438',
          900: '#10452f',
          950: '#07271a',
        },
        cyber: {
          50:  '#f0fdfb',
          100: '#ccfbf4',
          200: '#99f6ea',
          300: '#5deadb',
          400: '#2dd4c4',
          500: '#14b8aa',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        dark: {
          50:  '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0bac9',
          400: '#8595ab',
          500: '#647891',
          600: '#506079',
          700: '#424e63',
          800: '#394353',
          900: '#333a47',
          950: '#0d1117',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(37,165,105,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,165,105,0.05) 1px, transparent 1px)",
        'hero-gradient': 'linear-gradient(135deg, #0d1117 0%, #0f2027 40%, #0d1117 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(37,165,105,0.1) 0%, rgba(13,17,23,0.8) 100%)',
        'glow-gradient': 'radial-gradient(ellipse at center, rgba(37,165,105,0.15) 0%, transparent 70%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(37,165,105,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(37,165,105,0.6), 0 0 40px rgba(37,165,105,0.3)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
