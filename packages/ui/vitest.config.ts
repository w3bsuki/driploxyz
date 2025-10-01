/**
 * @repo/ui Vitest Configuration
 *
 * Test configuration for the UI component library.
 * Extends shared UI testing configuration with package-specific settings.
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import uiConfig from '../testing/vitest.config.ui.js';

export default mergeConfig(
  uiConfig,
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
      // Force happy-dom environment for component testing
      environment: 'happy-dom',

      // UI-specific test patterns
      include: [
        'src/**/*.{test,spec}.{js,ts}',
        'src/**/__tests__/**/*.{js,ts}',
        'src/lib/**/*.{test,spec}.{js,ts}',
        'src/lib/**/__tests__/**/*.{js,ts}'
      ],

      // UI-specific globals for component testing
      globals: true,

      // Setup files for component testing
      setupFiles: ['./src/test-setup.ts'],

      // Coverage settings for UI components
      coverage: {
        include: ['src/lib/**/*.{js,ts,svelte}'],
        exclude: [
          'src/lib/**/*.d.ts',
          'src/lib/**/*.stories.*',
          'src/lib/**/*.test.*',
          'src/lib/**/*.spec.*',
          'src/lib/**/index.ts'
        ],
        thresholds: {
          global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
          }
        }
      }
    },

    // Resolve workspace packages
    resolve: {
      alias: {
        '@repo/core': '../core/src/index.ts',
        '@repo/database': '../database/dist/index.ts'
      }
    }
  })
);