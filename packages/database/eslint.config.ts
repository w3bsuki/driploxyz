import { config } from '@repo/eslint-config/index.js';

export default [
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
    ignores: ['dist/*', 'src/generated/**/*']
  }
];
