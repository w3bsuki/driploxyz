import { config } from '@repo/eslint-config';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...config.map(cfg => ({
    ...cfg,
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        ...cfg.languageOptions?.parserOptions,
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      }
    }
  })),
  {
    ignores: ['dist/*', 'src/generated/**/*']
  }
];
