import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/slug.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false
});