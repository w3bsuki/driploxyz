import { config } from '@repo/eslint-config/index.js';

export default [
  ...config,
  {
    ignores: [
      '.svelte-kit/**',
      'build/**',
      'dist/**',
      '.vercel/**',
      'coverage/**',
      '**/*.d.ts'
    ]
  },
  // Avoid type-aware parsing for config files themselves
  {
    files: ['eslint.config.ts', '*.config.ts', '*.config.js'],
    languageOptions: {
      parserOptions: { project: false }
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: { project: false }
    },
    rules: {
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
