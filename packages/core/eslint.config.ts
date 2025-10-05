import { config } from '@repo/eslint-config/index.js';
import type { ESLint } from 'eslint';

const eslintConfig: ESLint.ConfigData[] = [
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
		ignores: [
			'dist/*',
			'build/*',
			'coverage/*'
		]
	}
];

export default eslintConfig;