import shared from '@repo/eslint-config/index.js';

export default ([
  ...shared.map(cfg => ({
    ...cfg,
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        ...cfg.languageOptions?.parserOptions,
        project: './tsconfig.json'
      }
    }
  })),
  {
    ignores: ['lib/*', 'dist/*', 'src/generated/**/*', 'scripts/**/*.js']
  },
  // JS files and plugin files should not use the TS project parser
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs', 'vite-plugin-optimized-i18n.ts', 'paraglide/**/*.js'],
    languageOptions: {
      parserOptions: {
        project: false
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
  }
]) as unknown[];
