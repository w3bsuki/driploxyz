/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../packages/mobile-shared/src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Import design tokens from web app (Bungkusa Theme)
        primary: '#a3e635', // Lime 400
        secondary: '#18181b', // Zinc 900
        accent: '#a3e635', // Lime 400
        charcoal: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          500: '#71717a',
          900: '#18181b',
        },
        indigo: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
        },
        burgundy: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        gold: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};