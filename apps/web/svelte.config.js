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
			runtime: 'nodejs20.x',
			maxDuration: 30,
			isr: {
				expiration: 60
			}
		}),
		csrf: {
			checkOrigin: true,
			origins: [
				'https://driplo.xyz',
				'https://www.driplo.xyz',
				'http://localhost:5173',
				'http://localhost:5174'
			]
		}
	},
};

export default config;
