import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
// import { visualizer } from 'rollup-plugin-visualizer'; // Temporarily disabled

export default defineConfig({
	plugins: [
		tailwindcss(),
		enhancedImages(),
		sveltekit(),
		// Bundle analyzer for performance optimization (temporarily disabled)
		// process.env.NODE_ENV === 'production' && visualizer({
		// 	filename: 'dist/stats.html',
		// 	open: false,
		// 	gzipSize: true
		// })
	],
	// Speed up dev server
	esbuild: {
		logOverride: { 'this-is-undefined-in-esm': 'silent' }
	},
	build: {
		// Performance optimizations
		minify: 'terser',
		manifest: true,
		rollupOptions: {
			// Externalize large dependencies to reduce bundle size
			external: [
				'stripe',
				'@stripe/stripe-js',
				'resend',
				'sharp',
				'sveltekit-rate-limiter',
				'@sentry/sveltekit'
			],
			output: {
				// Optimize chunk splitting for better caching
				manualChunks: {
					// UI components chunk
					ui: ['@repo/ui']
				}
			}
		},
		// Optimize chunks
		chunkSizeWarningLimit: 1000,
		// Enable source maps in production for debugging
		sourcemap: process.env.NODE_ENV === 'development'
	},
	// Optimize dependencies
	optimizeDeps: {},
	server: {
		port: 5173
	}
});
