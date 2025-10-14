import config from '@repo/eslint-config/index.js';

export default ([
  ...config.map(cfg => ({
    ...cfg,
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        ...cfg.languageOptions?.parserOptions,
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    }
  })),
  {
    ignores: ['lib/*', 'dist/*', 'src/generated/**/*', 'scripts/**/*.js']
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
