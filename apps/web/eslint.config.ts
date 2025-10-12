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
						},
						{
							group: ['../../packages/*/src/**'],
							message: 'Do not bypass package exports. Import from @repo/* package name instead (e.g., @repo/core, @repo/domain). This ensures proper Turborepo caching.'
						},
						{
							group: ['**/packages/*/src/**'],
							message: 'Do not bypass package exports. Import from @repo/* package name instead (e.g., @repo/core, @repo/domain). This ensures proper Turborepo caching.'
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
	},
	{
		files: ['src/lib/**/*.{ts,js,svelte}'],
		excludedFiles: ['src/lib/server/**'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['$lib/server', '$lib/server/*', '$lib/server/**'],
							message: 'Client code cannot import from $lib/server. Move server-only logic to +page.server.ts, +layout.server.ts, or +server.ts files.'
						},
						{
							group: ['$env/dynamic/private', '$env/static/private'],
							message: 'Client code cannot access private environment variables. Use PUBLIC_* variables or move logic to server files.'
						}
					]
				}
			]
		}
	}
];
