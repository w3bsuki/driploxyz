import { config } from '../eslint-config';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Base config without type-aware linting for Svelte files
  ...config.map(cfg => ({
    ...cfg,
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        ...cfg.languageOptions?.parserOptions,
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      }
    }
  })),
  // Separate config for Svelte files without type-aware linting
  ...config.map(cfg => ({
    ...cfg,
    files: ['**/*.svelte'],
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        // Don't use project-based parsing for Svelte files
        extraFileExtensions: ['.svelte']
      }
    },
    rules: {
      // Disable type-aware rules for Svelte files
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  })),
  {
    ignores: [
      '.svelte-kit/**',
      'dist/**',
      '**/*.d.ts'
    ]
  }
];
