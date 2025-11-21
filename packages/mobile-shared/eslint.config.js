import shared from '@repo/eslint-config/index.js';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...shared,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json']
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  // Disable project-based parsing for config files to prevent parser errors
  {
    files: ['eslint.config.ts', '*.config.ts', '*.config.js'],
    languageOptions: {
      parserOptions: {
        project: false
      }
    }
  },
  {
    ignores: ['dist/**', 'build/**', 'coverage/**']
  }
];

export default config;