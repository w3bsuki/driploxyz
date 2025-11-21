import { config } from '@repo/eslint-config/index.js';

export default [
  // Base shared config
  ...config,
  // Opt into type-aware parsing only for source files
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
  {
    ignores: ['dist/**', 'build/**', 'coverage/**']
  }
];