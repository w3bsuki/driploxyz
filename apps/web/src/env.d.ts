// Ambient declarations for SvelteKit $env modules to keep TS happy in editors
// These are overridden by SvelteKit's generated .svelte-kit/tsconfig during builds
declare module '$env/static/public' {
  export const PUBLIC_SUPABASE_URL: string;
  export const PUBLIC_SUPABASE_ANON_KEY: string;
}

declare module '$env/dynamic/private' {
  export const env: Record<string, string | undefined>;
}