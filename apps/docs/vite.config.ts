import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	
	// Resolve workspace packages from source in development
	resolve: {
		alias: process.env.NODE_ENV === 'development' ? {
			'@repo/ui': resolve(__dirname, '../../packages/ui/src/lib')
		} : {}
	},
	
	// Prevent watching dist folders
	server: {
		watch: {
			ignored: ['**/packages/ui/dist/**', '**/node_modules/**']
		}
	},
	
	// Optimize deps configuration
	optimizeDeps: {
		exclude: process.env.NODE_ENV === 'development' ? ['@repo/ui'] : []
	}
});
