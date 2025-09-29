/**
 * App Vitest Configuration
 *
 * Configuration for testing SvelteKit applications.
 * Extends UI configuration with SvelteKit-specific settings.
 *
 * Note: This configuration requires @sveltejs/kit to be installed as a peer dependency.
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import uiConfig from './vitest.config.ui.js';

export default mergeConfig(
  uiConfig,
  defineConfig({
    // Plugins should be configured by the consuming app
    // since @sveltejs/kit is a peer dependency
    plugins: [],

    test: {
      // Include SvelteKit app-specific test patterns
      include: [
        'src/**/*.{test,spec}.{js,ts}',
        'src/**/__tests__/**/*.{js,ts}',
        'src/**/*.{test,spec}.svelte',
        'src/**/__tests__/**/*.svelte',
        'src/routes/**/*.{test,spec}.{js,ts}',
        'src/lib/**/*.{test,spec}.{js,ts}'
      ],

      // Additional SvelteKit-specific setup
      setupFiles: ['./src/app.d.ts', './src/test-setup.ts'],

      // Mock SvelteKit modules
      alias: {
        '$app/environment': 'vitest-environment-jsdom',
        '$app/navigation': 'vitest-mock-sveltekit',
        '$app/stores': 'vitest-mock-sveltekit'
      }
    },

    // SvelteKit-specific resolve configuration
    resolve: {
      alias: {
        '$lib': './src/lib',
        '$app': './node_modules/@sveltejs/kit/src/runtime/app'
      }
    }
  })
);