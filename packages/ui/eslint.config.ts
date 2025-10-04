import { config } from '../eslint-config/index.js';

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
    ignores: ['.svelte-kit/**', 'dist/**']
  }
];
