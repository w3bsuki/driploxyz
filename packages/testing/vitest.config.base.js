/**
 * Base Vitest Configuration
 *
 * Shared configuration for all packages in the monorepo.
 * Provides sensible defaults for testing TypeScript/JavaScript modules.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global setup
    globals: true,

    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'src/**/__tests__/**/*.{js,ts}'
    ],

    // Exclude patterns
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.svelte-kit/**'
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },

    // Test timeout
    testTimeout: 10000,

    // Retry flaky tests
    retry: 2,

    // Reporter configuration
    reporters: ['verbose', 'json'],

    // Watch mode settings
    watch: false,

    // Disable file parallelization for deterministic results
    fileParallelism: false
  },

  // TypeScript configuration
  esbuild: {
    target: 'node22'
  }
});