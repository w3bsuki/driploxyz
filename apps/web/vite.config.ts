import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		// Per Svelte docs, enhancedImages must come BEFORE the SvelteKit plugin
		enhancedImages(),
		sveltekit(),
		// Tailwind Vite plugin can be placed after SvelteKit
		tailwindcss()
		// process.env.NODE_ENV === 'production' && visualizer({
		//   filename: 'dist/stats.html',
		//   open: false,
		//   gzipSize: true
		// })
	],
	// Keep Vite/SvelteKit defaults; avoid custom build tweaking unless needed
	resolve: {
		// Avoid duplicate Svelte instances across workspace packages
		dedupe: ['svelte']
	},
	server: {
		// Allow files from the monorepo during dev (fixes @fs 403 for workspace packages)
		fs: {
			allow: [searchForWorkspaceRoot(process.cwd())]
		}
	}
});
 
