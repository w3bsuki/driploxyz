// Temporary ambient declarations to reduce svelte-check noise.
// These should be replaced by generated SvelteKit route types and real module defs.

// Removed loose route $types stubs. Real generated types from .svelte-kit/types will now apply.

// Minimal Supabase types used in handlers (supabase from locals). We just type it as any for now.
interface LocalsWithSupabase {
  supabase: unknown;
}

// Deno global for edge function source under supabase/functions.
// We only add the pieces referenced so TypeScript stops flagging unknown identifier 'Deno'.
declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

// Paraglide re-exported JS modules without d.ts
declare module '@repo/i18n/paraglide/messages.js' {
  export const languages: string[];
  export const defaultLanguage: string;
  export const availableLanguageTags: string[];
  export function t(key: string, vars?: Record<string, unknown>): string;
  export * from '@repo/i18n';
}

// Generic analytics hook placeholder
declare module '@repo/ui/src/lib/hooks/analytics.js' {
  export function useAnalytics(): { track: (event: string, data?: Record<string, unknown>) => void };
}

// Removed obsolete ambient shims (panels, toast store, runtime, generic *.js) now that
// concrete modules exist. If new unresolved modules appear, add precise (narrow) shims
// or fix the actual import paths rather than reinstating broad declarations.

// Timeout alias simplification (used across toasts & performance)
type Timeout = ReturnType<typeof setTimeout>;
declare global { type Timeout = ReturnType<typeof setTimeout>; }
