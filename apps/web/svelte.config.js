import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	
	// Configure compiler to be less strict for accessibility warnings during build
	compilerOptions: {
		// CRITICAL: Lock compiler to Svelte 5 runes mode
		runes: true,
		// Allow build to continue with warnings
		warningFilter: (warning) => {
			// Allow accessibility warnings without failing build
			if (warning.code === 'a11y_label_has_associated_control') return false;
			if (warning.code === 'a11y_no_noninteractive_tabindex') return false;
			if (warning.code === 'css_unused_selector') return false;
			if (warning.code === 'element_invalid_self_closing_tag') return false;
			if (warning.code === 'non_reactive_update') return false;
			if (warning.code === 'node_invalid_placement_ssr') return false;
			if (warning.code === 'js_parse_error') return false;
			return true;
		}
	},
	
	kit: {
		adapter: adapter(),
		csrf: {
			checkOrigin: true
		}
	},
};

export default config;
