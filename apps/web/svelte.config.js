import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  compilerOptions: {
    runes: true
  },

  kit: {
    adapter: adapter(),
    prerender: {
      entries: [], // Disable prerendering - this app requires server context
      handleUnseenRoutes: 'ignore' // Don't error about unseen routes
    }
  }
};

export default config;
