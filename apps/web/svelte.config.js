import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	
	compilerOptions: {
		runes: true
	},
	
	kit: {
		adapter: adapter({
			runtime: 'nodejs22.x', // Use latest Node.js runtime
			regions: ['iad1'], // Optional: specify regions for better performance
			maxDuration: 30,
			isr: {
				// Incremental Static Regeneration for better performance
				expiration: 60
			},
			images: {
				sizes: [640, 828, 1200, 1920, 3840],
				formats: ['image/avif', 'image/webp'],
				minimumCacheTTL: 300
			}
		})
	},
};

export default config;
