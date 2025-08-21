import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
	plugins: [
		tailwindcss(), 
		enhancedImages(), 
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
	
	
	// Performance optimizations
	optimizeDeps: {
		include: [
			'@repo/ui',
			'@repo/i18n', 
			'@supabase/supabase-js',
			'@supabase/auth-helpers-sveltekit'
		],
		exclude: [
			// Large dependencies that should be loaded on demand
			'@stripe/stripe-js'
		]
	},
	
	// CSS optimization
	css: {
		devSourcemap: process.env.NODE_ENV === 'development',
		preprocessorOptions: {
			// Enable CSS purging in production
			postcss: {
				plugins: process.env.NODE_ENV === 'production' ? [
					// CSS optimization will be handled by TailwindCSS
				] : []
			}
		}
	},
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
					if (id.includes('node_modules')) {
						if (id.includes('@supabase')) return 'vendor-supabase';
						if (id.includes('@repo/ui')) return 'vendor-ui';
						if (id.includes('stripe')) return 'vendor-stripe';
						return 'vendor';
					}
				},
				// Optimize chunk names for caching
				chunkFileNames: (chunkInfo) => {
					const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
					return `_app/immutable/chunks/[name]-[hash].js`;
				},
				entryFileNames: '_app/immutable/entry/[name]-[hash].js',
				assetFileNames: (assetInfo) => {
					const info = assetInfo.name ? assetInfo.name.split('.') : ['asset'];
					const extType = info[info.length - 1];
					
					// Organize assets by type
					if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
						return `_app/immutable/assets/images/[name]-[hash][extname]`;
					}
					if (/woff2?|eot|ttf|otf/i.test(extType)) {
						return `_app/immutable/assets/fonts/[name]-[hash][extname]`;
					}
					if (/css/i.test(extType)) {
						return `_app/immutable/assets/styles/[name]-[hash][extname]`;
					}
					
					return `_app/immutable/assets/[name]-[hash][extname]`;
				}
			}
		},
		// Production optimizations
		sourcemap: process.env.NODE_ENV === 'development' ? true : 'hidden',
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: process.env.NODE_ENV === 'production',
				drop_debugger: true,
				dead_code: true,
				unused: true,
				passes: 2
			},
			mangle: {
				safari10: true
			}
		},
		// Asset optimization
		assetsInlineLimit: 2048, // 2KB threshold for inlining assets (smaller for better performance)
		cssCodeSplit: true,
		// Report compressed size only in CI
		reportCompressedSize: !!process.env.CI,
		// Chunk size warnings - stricter for better performance
		chunkSizeWarningLimit: 200, // Reduced from 500KB to 200KB
		// Target modern browsers for smaller bundles
		target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
	},
	// Image optimization settings
	server: {
		fs: {
			allow: ['..']
		},
		watch: {
			// Ignore node_modules to prevent unnecessary watches
			ignored: ['**/node_modules/**']
		}
	}
});
