import { config } from '@repo/eslint-config/index.js';

export default [
	...config,
	{
		ignores: ['.svelte-kit/*']
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
			]
		}
	}
];
