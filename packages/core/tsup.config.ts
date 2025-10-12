import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
  'src/auth/index.ts',
  'src/cookies/index.ts',
  'src/email/index.ts',
  'src/email/resend.ts',
  'src/utils/index.ts',
  'src/services/index.ts',
  'src/validation/index.ts',
  'src/types/index.ts',
  'src/stripe/index.ts',
  'src/stripe/server.ts'
  ],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@sveltejs/kit', 'stripe', '@stripe/stripe-js', 'resend', '$env/*', '$app/*', '$lib/*', '@supabase/postgrest-js'],
  noExternal: ['slugify']
});