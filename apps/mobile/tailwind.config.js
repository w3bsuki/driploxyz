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
        // Import design tokens from web app
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#10b981',
        charcoal: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
          900: '#0f172a',
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