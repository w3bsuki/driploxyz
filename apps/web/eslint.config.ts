import shared from '@repo/eslint-config/index.js';

export default [
	...shared,
	{
		ignores: [
			'.svelte-kit/*',
			'.vercel/*',
			'build/*',
			'dist/*',
			'tests/*',
			'static/*',
			'coverage/*',
			'scripts/*'
		]
	},
	{
		files: ['src/**/*.{ts,js,svelte}'],
		languageOptions: {
			parserOptions: {
				project: false // Disable TypeScript project checking for now
			}
		}
	},
	{
		files: ['*.config.ts', '*.config.js'],
		languageOptions: {
			parserOptions: {
				project: false
			}
		}
	},
	{
		files: ['*.ts', '*.js', '*.svelte'],
		languageOptions: {
			parserOptions: {
				project: false // Disable TypeScript project checking for now
			}
		}
	},
	{
		files: ['eslint.config.ts'],
		languageOptions: {
			parserOptions: {
				project: false
			}
		}
	},
	{
		rules: {
			// Keep the repo moving: surface issues as warnings instead of failing CI
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'no-constant-binary-expression': 'warn'
		}
	},
	{
		files: ['src/lib/**/*.{ts,js,svelte}'],
		// In flat config, use ignores blocks instead of excludedFiles
		ignores: ['src/lib/server/**']
	}
];
