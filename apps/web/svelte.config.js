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
		// Disable CSP entirely to fix production blocking issues
		csp: false
	},
};

export default config;
