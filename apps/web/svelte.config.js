import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { preprocessMeltUI } from '@melt-ui/pp';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), preprocessMeltUI()],
	
	compilerOptions: {
		runes: true
	},
	
	kit: {
		adapter: adapter({
			runtime: 'nodejs22.x'
		}),
		alias: {
			'@repo/ui': '../../packages/ui/src/lib/index.ts',
			'@repo/ui/*': '../../packages/ui/src/*',
			'@repo/database': '../../packages/database/src/index.ts',
			'@repo/i18n': '../../packages/i18n/src/index.ts'
		}
	},
};

export default config;