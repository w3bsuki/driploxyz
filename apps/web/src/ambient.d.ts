/// <reference types="@sveltejs/kit" />
/// <reference types="vite/client" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// Ambient declarations for SvelteKit auto-generated modules
declare module '$env/dynamic/public' {
  export const env: Record<string, string>;
}

declare module '$env/dynamic/private' {
  export const env: Record<string, string>;
}

declare module '$env/static/public' {
  export const PUBLIC_SUPABASE_URL: string;
  export const PUBLIC_SUPABASE_ANON_KEY: string;
  export const PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  export const PUBLIC_RESEND_API_KEY: string | undefined;
}

declare module '$env/static/private' {
  export const SUPABASE_SERVICE_ROLE_KEY: string;
  export const STRIPE_SECRET_KEY: string;
  export const STRIPE_WEBHOOK_SECRET: string;
  export const RESEND_API_KEY: string;
  export const RATE_LIMIT_SECRET: string;
  export const CSRF_SECRET: string | undefined;
}

// Browser global augmentations
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: ((command: string, action: string, params?: Record<string, unknown>) => void);
    fbq?: ((command: string, action: string, params?: Record<string, unknown>) => void);
    lintrk?: ((method: string, params?: Record<string, unknown>) => void);
    _hsq?: Array<[string, ...unknown[]]>;
    plausible?: ((eventName: string, options?: Record<string, unknown>) => void);
  }
  
  // Ensure DOM types are available
  const document: Document;
  const window: Window & typeof globalThis;
  const HTMLScriptElement: typeof globalThis.HTMLScriptElement;
}

export {};
