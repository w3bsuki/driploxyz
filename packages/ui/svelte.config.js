import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  // Configure compiler for Svelte 5 runes mode
  compilerOptions: {
    // CRITICAL: Lock compiler to Svelte 5 runes mode
    runes: true
  }
};

export default config;
