import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

export default defineConfig(
	defineVitestConfig(async () => {
		const plugins = [
			tailwindcss(),
			enhancedImages(),
			// Disable experimental locale splitting to avoid runtime dependency
			// on globalThis.__paraglide_ssr (was causing client crash)
			paraglideVitePlugin({
				project: '../../packages/i18n/project.inlang',
				outdir: '../../packages/i18n/lib/paraglide'
			}),
			sveltekit()
		];

		// Only load Sentry plugin during production builds to avoid
		// pulling in transitive deps (glob/minimatch) in dev.
		if (process.env.NODE_ENV === 'production') {
			const { sentryVitePlugin } = await import('@sentry/vite-plugin');
			plugins.push(
				sentryVitePlugin({
					org: process.env.SENTRY_ORG,
					project: process.env.SENTRY_PROJECT,
					authToken: process.env.SENTRY_AUTH_TOKEN,
					sourcemaps: {
						assets: '.svelte-kit/output/client/**'
					}
				})
			);
		}

		return {
			plugins,
			resolve: {
				alias: {
					// Use source files from workspace during dev to avoid packaging/watch issues
					'@repo/ui': fileURLToPath(new URL('../../packages/ui/src/lib/index.ts', import.meta.url)),
					'@repo/ui/types': fileURLToPath(new URL('../../packages/ui/src/types', import.meta.url))
				}
			},
			build: {
				rollupOptions: {
					output: {
						// Split i18n messages into separate chunks per language
						manualChunks(id) {
							// Split individual message files by language
							if (id.includes('paraglide/messages/') && id.endsWith('/en.js')) return 'i18n-en';
							if (id.includes('paraglide/messages/') && id.endsWith('/bg.js')) return 'i18n-bg';

							// Split the core i18n runtime
							if (id.includes('paraglide/runtime.js')) return 'i18n-runtime';
							if (id.includes('paraglide/messages.js')) return 'i18n-core';

							// Split individual message modules
							if (id.includes('paraglide/messages/') && id.endsWith('.js')) {
								// This allows tree-shaking of individual message functions
								return 'i18n-messages';
							}
						}
					}
				}
			},
			server: {
				fs: {
					allow: ['..', fileURLToPath(new URL('../../packages', import.meta.url))]
				}
			},
			test: {
				include: ['src/**/*.{test,spec}.{js,ts}'],
				globals: true,
				environment: 'jsdom',
				setupFiles: ['src/test/setup.ts']
			}
		};
	})
);
