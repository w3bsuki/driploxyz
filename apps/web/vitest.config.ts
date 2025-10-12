import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '.svelte-kit'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        global: {
          branches: 40,
          functions: 40,
          lines: 40,
          statements: 40
        },
        // Higher thresholds for critical packages
        'src/lib/services/': {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        },
        'src/lib/utils/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      exclude: [
        'coverage/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        'tests/**',
        'test/**',
        '**/*{.,-}{test,spec}.{js,ts,jsx,tsx}'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    isolate: true,
    globals: true
  },
  resolve: {
    alias: {
      $lib: resolve('./src/lib'),
      $components: resolve('./src/lib/components'),
      $utils: resolve('./src/lib/utils'),
      $stores: resolve('./src/lib/stores'),
      $types: resolve('./src/lib/types')
    }
  }
});
