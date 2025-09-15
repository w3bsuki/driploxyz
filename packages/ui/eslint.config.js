import { config } from '../eslint-config/index.js';

export default [
  ...config,
  {
    ignores: ['.svelte-kit/**', 'dist/**']
  }
];
