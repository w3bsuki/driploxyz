import { config } from '@repo/eslint-config/index.js';

export default [
	...config,
	{
		ignores: [
			'dist/*',
			'build/*',
			'coverage/*'
		]
	}
];