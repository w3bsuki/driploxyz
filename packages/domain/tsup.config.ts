import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    // New domain structure entry points
    'src/products/index.ts',
    'src/orders/index.ts',
    'src/users/index.ts',
    'src/payments/index.ts',
    'src/cart/index.ts',
    'src/auth/index.ts',
    'src/shared/index.ts',
    'src/conversations/index.ts'
  ],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@sveltejs/kit']
});