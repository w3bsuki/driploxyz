// Global type declarations for UI package

// Module declarations
declare module '@repo/i18n' {
  export type LanguageTag = 'en' | 'bg' | 'ru' | 'ua';
  export const languageNames: Record<LanguageTag, string>;
  export function detectLanguage(acceptLanguage?: string): LanguageTag;
  // Re-export any paraglide functions
  export * from '../lib/paraglide/messages.js';
  export * from '../lib/paraglide/runtime.js';
}

// Global namespace extensions
declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
  }
  
  namespace NodeJS {
    interface Timeout {}
  }
}

export {};