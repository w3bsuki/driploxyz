import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig, type PluginOption } from 'vite';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

const paraglidePlugin = paraglideVitePlugin({
        project: '../../packages/i18n/project.inlang',
        outdir: '../../packages/i18n/lib/paraglide',
        strategy: ['cookie', 'url', 'baseLocale']
}) as unknown as PluginOption;

export default defineConfig({
        plugins: [tailwindcss(), enhancedImages(), paraglidePlugin, sveltekit()],
	// Speed up dev server
	esbuild: {
		logOverride: { 'this-is-undefined-in-esm': 'silent' }
	},
	ssr: {
		noExternal: ['@repo/ui', '@repo/core', '@repo/database']
	},
        resolve: {
                alias: [
                        {
                                find: '@repo/ui/types',
                                replacement: fileURLToPath(new URL('../../packages/ui/src/types', import.meta.url))
                        },
                        {
                                find: '@repo/ui',
                                replacement: fileURLToPath(new URL('../../packages/ui/src/lib/index.ts', import.meta.url))
                        },
                        {
                                find: '@repo/core',
                                replacement: fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url))
                        },
                        {
                                find: '@repo/core/',
                                replacement: fileURLToPath(new URL('../../packages/core/src/', import.meta.url))
                        }
                ]
        },
	server: {
		port: 5173
	}
});
