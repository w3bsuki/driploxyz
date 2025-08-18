/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    '../../packages/ui/src/**/*.{html,js,svelte,ts}',
    '../../packages/ui/dist/**/*.{html,js,svelte}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};