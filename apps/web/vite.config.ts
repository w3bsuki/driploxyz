import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
	plugins: [
		tailwindcss(), 
		enhancedImages(), 
		sveltekit(),
		// Only upload source maps in production builds
		process.env.NODE_ENV === 'production' && sentryVitePlugin({
			org: process.env.SENTRY_ORG,
			project: process.env.SENTRY_PROJECT,
			authToken: process.env.SENTRY_AUTH_TOKEN,
			sourcemaps: {
				assets: '.svelte-kit/output/client/**'
			}
		})
	].filter(Boolean),
	
	server: {
		fs: {
			allow: ['..']
		}
	}
});