import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	
	compilerOptions: {
		// CRITICAL: Lock compiler to Svelte 5 runes mode
		runes: true
	},
	
	kit: {
		adapter: adapter({
			runtime: 'nodejs20.x',
			regions: ['iad1'],
			maxDuration: 30
		}),
		csrf: {
			checkOrigin: false // Temporarily disable for debugging
		},
		prerender: {
			handleHttpError: 'warn'
		}
	},
};

export default config;
