import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/auth/index.ts',
    'src/cookies/index.ts',
    'src/utils/index.ts'
  ],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@sveltejs/kit']
});