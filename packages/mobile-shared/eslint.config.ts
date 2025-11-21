import shared from '@repo/eslint-config/index.js';

export default [
  ...shared,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true
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