import { config } from '@repo/eslint-config/index.js';

const eslintConfig = [
  ...config.map(cfg => ({
    ...cfg,
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        ...cfg.languageOptions?.parserOptions,
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  })),
  {
    ignores: ['lib/*', 'dist/*', 'src/generated/**/*', 'scripts/**/*.js']
  }
];

export default eslintConfig as any;
