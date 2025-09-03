#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read all message keys from en.json
const enMessages = JSON.parse(fs.readFileSync(path.join(__dirname, 'messages/en.json'), 'utf8'));
const keys = Object.keys(enMessages).sort();

const tsContent = `// Optimized i18n TypeScript source - matches generated lib/index.js
// This file is used for TypeScript compilation only

// Re-export runtime functions
export {
  getLocale,
  setLocale,
  isLocale,
  locales,
  baseLocale,
  loadMessages
} from '../lib/runtime.js';

// Type definitions
export type Locale = 'en' | 'bg';
export type LanguageTag = Locale; // Compatibility alias

// Compatibility aliases for existing API
export const languageTag = getLocale;
export const setLanguageTag = setLocale;
export const availableLanguageTags = locales;
export const isAvailableLanguageTag = isLocale;

// Helper constants
export const languageNames: Record<Locale, string> = {
  en: 'English',
  bg: 'Български'
};

// Language detection utility
export function detectLanguage(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return 'en';
  const langs = acceptLanguage.toLowerCase();
  if (langs.includes('bg')) return 'bg';
  return 'en';
}

// Message function type
export interface MessageFunction {
  (inputs?: Record<string, string>, options?: { locale?: Locale }): Promise<string>;
}

// Dynamic message accessor for any key
export function getMessage(key: string, fallback?: string): MessageFunction;

// For components that need all messages (admin, complex forms)
export function getAllMessages(locale?: Locale): Promise<Record<string, string>>;

// Auto-generated message function exports (${keys.length} total)
${keys.map(key => `export declare const ${key}: MessageFunction;`).join('\n')}
`;

fs.writeFileSync(path.join(__dirname, 'src/index.ts'), tsContent);
console.log(`Generated ${keys.length} message exports in src/index.ts`);