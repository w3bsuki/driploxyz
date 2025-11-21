import shared from '@repo/eslint-config/index.js';

export default [
  // Base shared config
  ...shared,
  // Project-aware parsing only for sources; avoid applying to config/test files
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  },
  // Disable typed parsing for test files since tsconfig excludes them
  {
    files: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/__tests__/**'],
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