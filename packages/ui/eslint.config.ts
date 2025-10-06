import { config } from '../eslint-config/index.js';

export default [
  // Inherit shared config (includes svelte flat recommended)
  ...config,
  // Ignore build output and types
  {
    ignores: [
      '.svelte-kit/**',
      'dist/**',
      '**/*.d.ts',
      // TEMP: ignore file with parsing issue until refactor
      'src/lib/components/product/ProductBreadcrumb.svelte'
    ]
  },
  // Disable project-based parsing for config files to avoid parser errors
  {
    files: ['eslint.config.ts', 'svelte.config.js', '*.config.ts', '*.config.js'],
    languageOptions: {
      parserOptions: {
        project: false
      }
    }
  },
  // For Svelte files, ensure we don't force project mode via overrides
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        project: false
      }
    },
    rules: {
      // soften to warnings during cleanup
      'no-undef': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-case-declarations': 'warn',
      'prefer-spread': 'warn',
      'svelte/no-at-html-tags': 'warn',
      'svelte/valid-compile': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }
      ]
    }
  },
  // For TS files in this package, relax strict rules during cleanup
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-case-declarations': 'warn',
      'prefer-spread': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }
      ]
    }
  }
];
