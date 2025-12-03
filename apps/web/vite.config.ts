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
	],
	// CSS transformer optimization for Tailwind v4
	css: {
		transformer: 'lightningcss'
	},
	// Build optimizations for Phase 4: Performance
	build: {
		// Target modern browsers for smaller bundles
		target: 'es2022',
		// CSS code splitting
		cssCodeSplit: true,
		// Increase chunk size warning threshold (after optimization)
		chunkSizeWarningLimit: 600,
		rollupOptions: {
			output: {
				// Manual chunks for better code splitting - simplified to avoid circular deps
				manualChunks: (id: string) => {
					// Vendor chunk: node_modules (excluding specific packages)
					if (id.includes('node_modules')) {
						// Supabase client - isolated
						if (id.includes('@supabase')) {
							return 'vendor-supabase';
						}
						// Stripe - isolated
						if (id.includes('stripe')) {
							return 'vendor-stripe';
						}
						// Sentry (error tracking) - isolated
						if (id.includes('@sentry')) {
							return 'vendor-sentry';
						}
						// Lucide icons - can be lazy loaded
						if (id.includes('lucide')) {
							return 'vendor-icons';
						}
						// Web Vitals
						if (id.includes('web-vitals')) {
							return 'vendor-vitals';
						}
						// Other node_modules stay in default vendor
						return undefined;
					}
					// i18n translations - split by locale
					if (id.includes('packages/i18n/paraglide')) {
						if (id.includes('/messages/bg')) {
							return 'i18n-bg';
						}
						if (id.includes('/messages/en')) {
							return 'i18n-en';
						}
					}
					// Let Rollup handle everything else automatically
					return undefined;
				}
			}
		}
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
 
