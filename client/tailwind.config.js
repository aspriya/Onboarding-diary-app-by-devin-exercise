/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          hover: '#5A52D5',
          dark: '#7C73FF',
          'dark-hover': '#9B94FF',
        },
        secondary: {
          DEFAULT: '#A8D8EA',
          dark: '#3A7CA5',
        },
        accent: {
          DEFAULT: '#FF6B6B',
          dark: '#FF8787',
        },
        success: {
          DEFAULT: '#51CF66',
          dark: '#69DB7C',
        },
        warning: {
          DEFAULT: '#FFD43B',
          dark: '#FFE066',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#16213E',
          'dark-elevated': '#1E2A47',
        },
        background: {
          DEFAULT: '#F8F9FA',
          dark: '#1A1A2E',
        },
        sidebar: {
          DEFAULT: '#2D3436',
          dark: '#0F1525',
          text: '#DFE6E9',
          'text-dark': '#A0AEC0',
        },
        border: {
          DEFAULT: '#E9ECEF',
          dark: '#2D3748',
        },
        'text-primary': {
          DEFAULT: '#2D3436',
          dark: '#E9ECEF',
        },
        'text-secondary': {
          DEFAULT: '#636E72',
          dark: '#A0AEC0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.08)',
        'card-dark': '0 1px 3px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
