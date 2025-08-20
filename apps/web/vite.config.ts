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
						if (id.includes('@supabase')) return 'vendor-supabase';
						if (id.includes('stripe')) return 'vendor-stripe';
						// Let SvelteKit handle other vendor libraries
						return 'vendor';
					}
				},
				// Optimize chunk names for caching
				chunkFileNames: '_app/immutable/chunks/[name]-[hash].js',
				entryFileNames: '_app/immutable/entry/[name]-[hash].js',
				assetFileNames: '_app/immutable/assets/[name]-[hash][extname]'
			}
		},
		// Production optimizations
		sourcemap: process.env.NODE_ENV === 'development' ? true : 'hidden',
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: process.env.NODE_ENV === 'production',
				drop_debugger: true,
				pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : []
			}
		},
		// Asset optimization
		assetsInlineLimit: 4096, // 4KB threshold for inlining assets
		cssCodeSplit: true,
		// Report compressed size
		reportCompressedSize: false,
		// Chunk size warnings
		chunkSizeWarningLimit: 500
	},
	// Image optimization settings
	server: {
		fs: {
			allow: ['..']
		}
	}
});
