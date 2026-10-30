/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lex: {
          950: '#06090e',
          900: '#0b111a',
          850: '#101826',
          800: '#162032',
          700: '#23324c',
          600: '#344b70',
          500: '#4d6999',
          400: '#7594c7',
          300: '#a3beeb',
          200: '#cddbf7',
          100: '#e8f0fe',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        crimson: {
          500: '#ef4444',
          600: '#dc2626',
          900: '#450a0a',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
          900: '#064e3b',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          900: '#164e63',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
};
