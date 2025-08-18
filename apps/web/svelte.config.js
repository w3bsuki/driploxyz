import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			runtime: 'nodejs20.x', // Force Node.js runtime to avoid edge runtime issues
			regions: ['iad1'], // Optional: specify region for lower latency  
			split: false, // Keep everything in one function to avoid edge/node mixing
			isr: {
				expiration: 60 // ISR cache for 60 seconds
			}
		}),
		csrf: {
			checkOrigin: false // Required for form actions in production
		},
		// Ensure form actions work correctly
		serviceWorker: {
			register: false
		}
	},
};

export default config;
