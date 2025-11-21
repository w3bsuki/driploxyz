import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  css: {
    // Ensure we don't pick up any parent/workspace PostCSS config
    postcss: {
      plugins: []
    }
  },
  resolve: {
    dedupe: ['svelte']
  }
});
