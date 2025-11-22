import adapterAuto from '@sveltejs/adapter-auto';
import adapterVercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // Use lightweight adapter locally; switch to Vercel adapter only in Vercel or when explicitly requested
    adapter: (process.env.DEPLOY_TARGET === 'vercel' || process.env.VERCEL === '1')
      ? adapterVercel()
      : adapterAuto(),
    // Use SvelteKit defaults; tune only when a concrete requirement appears
  }
};

export default config;
