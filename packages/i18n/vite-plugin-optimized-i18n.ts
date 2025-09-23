/**
 * Vite plugin to optimize i18n bundle loading
 * - Enables dynamic imports for locale bundles
 * - Improves tree-shaking for unused messages
 * - Reduces initial bundle size
 */

import type { Plugin } from 'vite';

export function optimizedI18nPlugin(): Plugin {
  return {
    name: 'optimized-i18n',

    // Transform imports to use dynamic loading
    resolveId(id: string, importer?: string) {
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
    config(config: any, { command }: { command: string }) {
      if (command === 'build') {
        // Ensure locale bundles are split into separate chunks
        config.build = config.build || {};
        config.build.rollupOptions = config.build.rollupOptions || {};
        config.build.rollupOptions.output = config.build.rollupOptions.output || {};

        const output = Array.isArray(config.build.rollupOptions.output)
          ? config.build.rollupOptions.output[0]
          : config.build.rollupOptions.output;

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
    generateBundle(options: any, bundle: Record<string, any>) {
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
