import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { paraglide } from '@inlang/paraglide-js-adapter-sveltekit/vite';

export default defineConfig(
	defineVitestConfig({
	plugins: [
		tailwindcss(), 
		enhancedImages(),
		// Paraglide MUST come before sveltekit() for proper tree-shaking
		paraglide({
			project: '../../packages/i18n/project.inlang',
			outdir: '../../packages/i18n/lib/paraglide'
		}),
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
	
	build: {
		rollupOptions: {
			output: {
				// Split i18n messages into separate chunks per language
				manualChunks(id) {
					// Split each language into its own chunk
					if (id.includes('paraglide/messages/en.js')) return 'i18n-en';
					if (id.includes('paraglide/messages/bg.js')) return 'i18n-bg';
					
					// Split the main messages file
					if (id.includes('paraglide/messages.js')) return 'i18n-core';
				}
			}
		}
	},
	
	server: {
		fs: {
			allow: ['..']
		}
	},
	
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['src/test/setup.ts']
	}
}));