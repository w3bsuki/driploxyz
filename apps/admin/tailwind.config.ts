import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,js,svelte,ts}', '../../../packages/ui/src/**/*.{html,js,svelte,ts}'],
  // Tailwind v4 will use CSS-first configuration
};

export default config;
