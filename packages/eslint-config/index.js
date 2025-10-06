import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

// Shared flat config for the monorepo without type-aware (project) parsing by default.
// Consumers can opt into typed rules locally if needed.
export const config = ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      // Let Svelte use its parser but enable TS inside <script lang="ts"> via parserOptions.parser
      parserOptions: {
        parser: ts.parser
      }
    },
    rules: {
      // Svelte + TS ergonomics during refactor
      'no-undef': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'svelte/no-at-html-tags': 'warn',
      'svelte/valid-compile': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }
      ]
    }
  },
  {
    // Package boundary rules
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@repo/ui/*'],
              message: 'UI package should not import from other @repo packages. Use @repo/core for utilities and @repo/domain for business logic.',
              files: ['packages/ui/**/*']
            },
            {
              group: ['@repo/core/*'],
              message: 'Core package should not import from @repo/ui. Use @repo/domain for business logic.',
              files: ['packages/core/**/*']
            },
            {
              group: ['@repo/domain/*'],
              message: 'Domain package should not import from @repo/ui. Keep domain logic pure.',
              files: ['packages/domain/**/*']
            }
          ]
        }
      ]
    }
  }
);
