// Ambient module declarations for generated Paraglide JS runtime files without .d.ts
// Keeps TypeScript strict mode satisfied until generation produces types.

declare module '../paraglide/messages.js' {
  export const messages: Record<string, string>;
  export default messages;
}

declare module '../paraglide/runtime.js' {
  export function setLanguage(lang: string): void;
  export function t(key: string, vars?: Record<string, any>): string;
}

declare module './paraglide/server.js' {
  export function getPreferredLanguage(acceptLanguageHeader?: string): string;
}

declare module './paraglide/runtime.js' {
  export function setLanguage(lang: string): void;
  export function t(key: string, vars?: Record<string, any>): string;
}
