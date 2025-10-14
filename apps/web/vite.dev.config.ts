import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot, type PluginOption } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		// SvelteKit first for correct plugin ordering
		sveltekit() as unknown as PluginOption,
		tailwindcss()
	],
	resolve: {
		dedupe: ['svelte']
	},
	server: {
		port: 5173,
		host: true,
		fs: {
			allow: [searchForWorkspaceRoot(process.cwd())]
		}
	},
	build: {
		target: 'es2022'
	},
	esbuild: {
		target: 'es2022'
	}
});