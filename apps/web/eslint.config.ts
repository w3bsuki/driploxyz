import { config } from '@repo/eslint-config/index.js';

export default [
	...config,
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
		ignores: [
			'coverage/**/*',
			'scripts/**/*',
			'src/**/*.d.ts',
			'src/service-worker.*'
		],
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
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['$lib/components/*'],
							message: 'Import from @repo/ui instead when equivalent component exists. Check packages/ui/src/lib/index.ts for available components.'
						}
					]
				}
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			]
		}
	}
];
