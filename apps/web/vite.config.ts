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
			// Core UI components needed immediately
			'@repo/ui/Button',
			'@repo/ui/Card', 
			'@repo/ui/LoadingSpinner',
			'@repo/ui/SearchBar',
			'@repo/ui/BottomNav',
			// Essential utilities
			'@repo/i18n', 
			'@supabase/supabase-js',
			'@supabase/ssr'
		],
		exclude: [
			// Heavy dependencies that should be loaded on demand
			'@stripe/stripe-js',
			// Heavy UI components
			'@repo/ui/ProductGallery',
			'@repo/ui/VirtualProductGrid',
			'@repo/ui/PaymentForm',
			'@repo/ui/CheckoutSummary',
			'@repo/ui/OrderTimeline'
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
				// Manual chunking for optimal performance
				manualChunks: (id) => {
					// Vendor chunk for all node_modules
					if (id.includes('node_modules')) {
						// Separate Supabase into its own chunk (large library)
						if (id.includes('@supabase')) return 'supabase';
						// Stripe in separate chunk (loaded on demand)
						if (id.includes('@stripe')) return 'stripe';
						// Sentry in separate chunk
						if (id.includes('@sentry')) return 'sentry';
						// Core UI dependencies
						if (id.includes('svelte') || id.includes('@sveltejs')) return 'svelte';
						// Remaining vendor code
						return 'vendor';
					}
					
					// UI package components - split by usage pattern
					if (id.includes('@repo/ui')) {
						// Heavy components that are lazy-loaded
						if (id.includes('ProductGallery') || id.includes('ProductQuickView') || 
						    id.includes('VirtualProductGrid') || id.includes('PaymentForm') ||
						    id.includes('CheckoutSummary') || id.includes('OrderTimeline')) {
							return 'ui-heavy';
						}
						// Core UI components used everywhere
						if (id.includes('Button') || id.includes('Input') || id.includes('Card') ||
						    id.includes('Badge') || id.includes('Modal') || id.includes('LoadingSpinner')) {
							return 'ui-core';
						}
						// Layout and navigation components
						if (id.includes('Header') || id.includes('BottomNav') || id.includes('SearchBar') ||
						    id.includes('MegaMenu') || id.includes('CategoryDropdown')) {
							return 'ui-layout';
						}
						return 'ui';
					}
					
					// App-specific chunks
					if (id.includes('src/routes')) {
						// Admin pages
						if (id.includes('(admin)')) return 'admin';
						// Auth pages
						if (id.includes('(auth)')) return 'auth';
						// Protected pages
						if (id.includes('(protected)')) return 'protected';
					}
					
					return null;
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
					if (extType && /png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
						return `_app/immutable/assets/images/[name]-[hash][extname]`;
					}
					if (extType && /woff2?|eot|ttf|otf/i.test(extType)) {
						return `_app/immutable/assets/fonts/[name]-[hash][extname]`;
					}
					if (extType && /css/i.test(extType)) {
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
				drop_console: process.env.NODE_ENV === 'production' ? ['log', 'warn'] : false, // Keep errors
				drop_debugger: true,
				dead_code: true
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
		chunkSizeWarningLimit: 150, // Target 150KB chunks for optimal loading
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
