import adapterAuto from '@sveltejs/adapter-auto';
import adapterVercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // Use lightweight adapter locally; switch to Vercel adapter only in Vercel or when explicitly requested
    adapter: (process.env.DEPLOY_TARGET === 'vercel' || process.env.VERCEL === '1')
      ? adapterVercel({
          // Enable ISR for static pages with revalidation
          isr: {
            // Default expiration for ISR pages (1 hour)
            expiration: 3600,
            // Allow bypassing cache with x-prerender-revalidate header
            bypassToken: process.env.ISR_BYPASS_TOKEN
          },
          // Enable image optimization
          images: {
            sizes: [320, 640, 800, 1024, 1280],
            formats: ['image/avif', 'image/webp'],
            minimumCacheTTL: 31536000
          },
          // Split for optimal cold start performance
          split: false
        })
      : adapterAuto(),
    // Performance preloading
    prerender: {
      // Crawl links to find pages
      crawl: true,
      // Handle missing entries gracefully
      handleMissingId: 'warn',
      // Handle HTTP errors during prerendering
      handleHttpError: 'warn'
    }
  },

  // Compiler options for better performance
  compilerOptions: {
    // Disable dev mode warnings in production
    dev: process.env.NODE_ENV !== 'production'
  }
};

export default config;
