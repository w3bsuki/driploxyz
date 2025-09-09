import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		enhancedImages(),
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
		host: '0.0.0.0',
		port: 5173,
		fs: {
			allow: ['..', fileURLToPath(new URL('../../packages', import.meta.url))]
		}
	}
});
