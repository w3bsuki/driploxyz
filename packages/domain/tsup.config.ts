import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/services/index.ts',
    'src/services/products/index.ts',
    'src/services/orders/index.ts',
    'src/services/profiles/index.ts',
    'src/services/messaging/index.ts',
    'src/services/payments/index.ts',
    'src/validation/index.ts',
    'src/types/index.ts'
  ],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@sveltejs/kit']
});