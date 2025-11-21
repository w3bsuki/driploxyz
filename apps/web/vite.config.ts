import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		// Per Tailwind v4 guide, include Tailwind's Vite plugin before SvelteKit
		tailwindcss(),
		// Per Svelte docs, enhancedImages must come BEFORE the SvelteKit plugin
		enhancedImages(),
		sveltekit(),
		// Compile Paraglide i18n at build-time for tree-shaking and 0kb default
		paraglideVitePlugin({
			project: '../../packages/i18n/project.inlang',
			// Generate into the shared i18n package so all apps consume the same outputs
			outdir: '../../packages/i18n/paraglide'
		})
		// process.env.NODE_ENV === 'production' && visualizer({
		//   filename: 'dist/stats.html',
		//   open: false,
		//   gzipSize: true
		// })
	],
	// CSS transformer optimization for Tailwind v4
	css: {
		transformer: 'lightningcss'
	},
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
 
