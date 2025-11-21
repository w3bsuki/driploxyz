import shared from '@repo/eslint-config/index.js';
import type { ESLint } from 'eslint';

const eslintConfig: ESLint.ConfigData[] = [
	// Base shared config without typed-linting
	...shared,
	// Enable typed-linting only for source files
	{
		files: ['src/**/*.ts', 'src/**/*.tsx'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json'
			}
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
			]
		}
	},
	// Prevent typed parser from running on config files
	{
		files: ['eslint.config.ts', '*.config.ts', '*.config.js'],
		languageOptions: {
			parserOptions: {
				project: false
			}
		}
	},
	{
		ignores: ['dist/**', 'build/**', 'coverage/**']
	}
];

export default eslintConfig;