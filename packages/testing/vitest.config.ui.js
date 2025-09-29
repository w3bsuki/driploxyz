/**
 * UI Package Vitest Configuration
 *
 * Configuration for testing Svelte components and UI utilities.
 * Extends base configuration with Svelte-specific settings.
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import baseConfig from './vitest.config.base.js';

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [
      svelte({
        hot: false,
        extensions: ['.svelte'],
        compilerOptions: {
          // Enable runes for Svelte 5
          runes: true
        }
      })
    ],

    test: {
      // Use happy-dom for DOM simulation
      environment: 'happy-dom',

      // Include Svelte test files
      include: [
        'src/**/*.{test,spec}.{js,ts}',
        'src/**/__tests__/**/*.{js,ts}',
        'src/**/*.{test,spec}.svelte',
        'src/**/__tests__/**/*.svelte'
      ],

      // Setup files for component testing
      setupFiles: ['./src/test-setup.ts'],

      // Transform configuration for Svelte components
      // transformMode has been deprecated, handled by plugins
    },

    // Resolve aliases for testing
    resolve: {
      alias: {
        '@repo/ui': '../ui/src/lib/index.ts',
        '@repo/core': '../core/src/index.ts',
        '@repo/database': '../database/dist/index.ts'
      }
    }
  })
);