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
			runtime: 'nodejs20.x'
		}),
		// Disable CSRF check temporarily to fix production issues
		csrf: {
			checkOrigin: false
		},
		// Add CSP configuration to allow necessary services
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': [
					'self',
					'unsafe-inline',
					'unsafe-eval', // Temporary for debugging
					'https://js.stripe.com',
					'https://checkout.stripe.com'
				],
				'connect-src': [
					'self',
					'https://*.supabase.co',
					'wss://*.supabase.co',
					'https://api.stripe.com'
				],
				'frame-src': [
					'self',
					'https://js.stripe.com',
					'https://checkout.stripe.com'
				],
				'img-src': ['self', 'data:', 'https:', 'blob:'],
				'style-src': ['self', 'unsafe-inline'],
				'font-src': ['self', 'data:', 'https:']
			}
		}
	},
};

export default config;
