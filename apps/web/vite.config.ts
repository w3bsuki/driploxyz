import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

export default defineConfig({
	plugins: [
		tailwindcss(),
		enhancedImages(),
		paraglideVitePlugin({
			project: '../../packages/i18n/project.inlang',
			outdir: '../../packages/i18n/lib/paraglide',
			strategy: ['cookie', 'url', 'baseLocale']
		}),
		sveltekit()
	],
	resolve: {
		alias: {
			// Use source files from workspace during dev to avoid packaging/watch issues
			'@repo/ui': fileURLToPath(new URL('../../packages/ui/src/lib/index.ts', import.meta.url)),
			'@repo/ui/types': fileURLToPath(new URL('../../packages/ui/src/types', import.meta.url))
		}
	},
	server: {
		port: 5173
	}
});
