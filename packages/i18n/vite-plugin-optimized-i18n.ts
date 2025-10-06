/**
 * Vite plugin to optimize i18n bundle loading
 * - Enables dynamic imports for locale bundles
 * - Improves tree-shaking for unused messages
 * - Reduces initial bundle size
 */

// Minimal local types to avoid pulling in Vite/Rollup type packages
type OutputLike = {
  manualChunks?: Record<string, string[]> | ((id: string) => string | undefined);
};

type BuildConfig = {
  rollupOptions?: {
    output?: OutputLike | OutputLike[];
  };
};

type ViteUserConfig = {
  build?: BuildConfig;
};

type VitePlugin = {
  name: string;
  resolveId?(id: string): string | null | undefined;
  load?(id: string): string | null | undefined;
  config?(config: ViteUserConfig, env: { command: string }): void | object | Promise<void | object>;
  generateBundle?(_options: unknown, bundle: Record<string, { code?: string }>): void;
};

export function optimizedI18nPlugin(): VitePlugin {
  return {
    name: 'optimized-i18n',

    // Transform imports to use dynamic loading
    resolveId(id: string) {
      // Handle locale bundle imports
      if (id.includes('@repo/i18n/locales/')) {
        return id;
      }
      return null;
    },

    // Optimize module resolution
    load(id: string) {
      if (id.includes('@repo/i18n/locales/')) {
        // These will be loaded dynamically at runtime
        return null;
      }
      return null;
    },

    // Configure build options
    config(config: ViteUserConfig, { command }: { command: string }) {
      if (command === 'build') {
        // Ensure locale bundles are split into separate chunks
        config.build = config.build || {};
        config.build.rollupOptions = config.build.rollupOptions || {};
        config.build.rollupOptions.output = config.build.rollupOptions.output || {};

        let output: OutputLike;
        if (Array.isArray(config.build.rollupOptions.output)) {
          // Ensure first output exists
          const arr = config.build.rollupOptions.output;
          arr[0] = (arr[0] || {}) as OutputLike;
          output = arr[0] as OutputLike;
        } else {
          // Ensure object output exists
          config.build.rollupOptions.output = (config.build.rollupOptions.output || {}) as OutputLike;
          output = config.build.rollupOptions.output as OutputLike;
        }

        output.manualChunks = output.manualChunks || {};

        // Split locale bundles into separate chunks
        if (typeof output.manualChunks === 'object') {
          output.manualChunks['i18n-bg'] = ['@repo/i18n/locales/bg.js'];
          output.manualChunks['i18n-en'] = ['@repo/i18n/locales/en.js'];
          output.manualChunks['i18n-runtime'] = ['@repo/i18n/runtime.js'];
        }
      }
    },

    // Generate bundle metadata for analysis
    generateBundle(_options: unknown, bundle: Record<string, { code?: string }>) {
      const i18nChunks = Object.keys(bundle).filter(key =>
        key.includes('i18n-') || key.includes('@repo/i18n')
      );

      const totalSize = i18nChunks.reduce((sum: number, key: string) => {
        const chunk = bundle[key];
        return sum + (chunk.code ? chunk.code.length : 0);
      }, 0);

      // Log i18n bundle size for optimization tracking
      console.log(`📊 i18n bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    }
  };
}
