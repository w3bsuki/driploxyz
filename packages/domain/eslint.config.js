import { config } from '@repo/eslint-config/index.js';

export default [
	...config.map(cfg => ({
		...cfg,
		rules: {
			...cfg.rules,
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'warn'
		},
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
		ignores: [
			'dist/*',
			'build/*',
			'coverage/*'
		]
	}
];