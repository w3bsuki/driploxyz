import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import type { Plugin } from 'vite';
// import { visualizer } from 'rollup-plugin-visualizer'; // Temporarily disabled

export default defineConfig({
	plugins: [
		tailwindcss(),
		enhancedImages(),
		paraglideVitePlugin({
			project: '../../packages/i18n/project.inlang',
			outdir: '../../packages/i18n/lib/paraglide',
			strategy: ['cookie', 'url', 'baseLocale']
		}),
		sveltekit(),
		// Bundle analyzer for performance optimization (temporarily disabled)
		// process.env.NODE_ENV === 'production' && visualizer({
		// 	filename: 'dist/stats.html',
		// 	open: false,
		// 	gzipSize: true
		// })
	].filter(Boolean) as Plugin[],
	// Speed up dev server
	esbuild: {
		logOverride: { 'this-is-undefined-in-esm': 'silent' }
	},
	ssr: {
		noExternal: ['@repo/ui', '@repo/core', '@repo/database', '@repo/i18n']
	},
	resolve: {
		alias: {
			// Use source files from workspace during dev to avoid packaging/watch issues
			'@repo/ui': fileURLToPath(new URL('../../packages/ui/src/lib/index.ts', import.meta.url)),
			'@repo/ui/types': fileURLToPath(new URL('../../packages/ui/src/types', import.meta.url)),
			'@repo/i18n': fileURLToPath(new URL('../../packages/i18n/src/index.ts', import.meta.url)),
			'@repo/i18n/*': fileURLToPath(new URL('../../packages/i18n/src/*', import.meta.url))
		}
	},
	build: {
		// Performance optimizations
		minify: 'terser',
		manifest: true,
		rollupOptions: {
			output: {}
		},
		// Optimize chunks
		chunkSizeWarningLimit: 1000,
		// Enable source maps in production for debugging
		sourcemap: process.env.NODE_ENV === 'development'
	},
	// Optimize dependencies
	optimizeDeps: {},
	server: {
		port: 5173,
		fs: {
			allow: ['../../']
		}
	}
});
