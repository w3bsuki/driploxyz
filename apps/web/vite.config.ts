import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), enhancedImages(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/test/',
				'**/*.d.ts',
				'**/*.config.*'
			]
		},
		// Mock handling
		deps: {
			inline: ['@repo/ui', '@repo/database', '@repo/i18n']
		},
		// Timeout for integration tests
		testTimeout: 10000
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id: string) => {
					// Skip external modules in SvelteKit
					if (id.includes('node_modules')) {
						// Group vendor libraries
						if (id.includes('@repo/ui')) return 'vendor-ui';
						if (id.includes('zod') || id.includes('sveltekit-superforms')) return 'vendor-utils';
						// Let SvelteKit handle Supabase and Stripe externally
						return 'vendor';
					}
				}
			}
		},
		// Optimize build performance
		sourcemap: process.env.NODE_ENV === 'development',
		minify: 'esbuild', // Use esbuild minifier (default)
		// Asset optimization
		assetsInlineLimit: 4096, // 4KB threshold for inlining assets
		cssCodeSplit: true
	},
	// Image optimization settings
	server: {
		fs: {
			allow: ['..']
		}
	}
});
