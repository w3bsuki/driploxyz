import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    // Per Svelte docs, enhancedImages must come BEFORE the SvelteKit plugin
    enhancedImages(),
    sveltekit(),
    // Tailwind Vite plugin can be placed after SvelteKit
    tailwindcss()
  ],
  resolve: {
    dedupe: ['svelte']
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())]
    }
  },
  build: {
    target: 'es2022'
  },
  esbuild: {
    target: 'es2022'
  }
});
