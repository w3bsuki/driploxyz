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
      runtime: 'nodejs20.x',
      maxDuration: 30,
      split: true
    }),
    prerender: {
      entries: []
    },
    alias: {
      '@repo/ui': '../../packages/ui/src/lib/index.ts',
      '@repo/ui/*': '../../packages/ui/src/*',
      '@repo/database': '../../packages/database/src/index.ts',
      '@repo/i18n': '../../packages/i18n/src/index.ts',
      '@repo/i18n/*': '../../packages/i18n/src/*',
      '@repo/core': '../../packages/core/src/index.ts',
      '@repo/core/*': '../../packages/core/src/*',
      '@repo/domain': '../../packages/domain/src/index.ts',
      '@repo/domain/*': '../../packages/domain/src/*'
    }
  },
  vite: {
    ssr: {
      // Don't externalize set-cookie-parser, let it be bundled
      noExternal: [],
      // Instead, add it to optimizeDeps to ensure it's properly handled
      optimizeDeps: {
        include: ['set-cookie-parser']
      }
    }
  }
};

export default config;
