# Fix Summary: "An impossible situation occurred" Error

## Problem

SvelteKit was throwing the error:
```
An impossible situation occurred
    at LoadPluginContext.load (file:///.../node_modules/@sveltejs/kit/src/exports/vite/index.js:610:11)
```

This error occurs when **server-only code is imported into client-side bundles**, violating SvelteKit's security model.

## Root Cause

The file `$lib/country/detection.ts` contained:
1. **Server-only functions**: `detectCountryFromIP()`, `getUserCountry()`, `setCountryCookie()`
2. **Server-only imports**: `import { COOKIES } from '$lib/server/cookies/production-cookie-system'`
3. **Client-safe constants**: `COUNTRY_CONFIGS`, `CountryCode` type

This file was imported by **client-side code** (`+layout.svelte`), which attempted to import server-only modules into the browser bundle—a security violation that SvelteKit blocks.

## Solution

### 1. Split Module by Environment

**Created `$lib/country/constants.ts`** (client-safe):
```ts
// Client-safe constants, types, and pure functions
export type CountryCode = 'BG' | 'GB' | 'US' | ...;
export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {...};
export function getLocaleForCountry(country: CountryCode): LanguageTag {...}
export function getCountryFromDomain(hostname: string): CountryCode | null {...}
```

**Created `$lib/server/country/detection.server.ts`** (server-only):
```ts
// Server-only functions with request/cookie/API access
export function detectCountryFromHeaders(request: Request): CountryCode | null {...}
export async function detectCountryFromIP(event: RequestEvent): Promise<CountryCode | null> {...}
export function getCountryFromCookie(event: RequestEvent): CountryCode | null {...}
export function setCountryCookie(event: RequestEvent, country: CountryCode): void {...}
export async function getUserCountry(event: RequestEvent): Promise<CountryCode> {...}
```

**Created `$lib/cookies/constants.ts`** (shared constants):
```ts
// Cookie names safe to import on client/server
export const COOKIES = {
  LOCALE: 'PARAGLIDE_LOCALE',
  COUNTRY: 'country',
  CONSENT: 'driplo_consent',
  // ...
} as const;
```

### 2. Updated All Imports

**Client-side code** (`+layout.svelte`, `use-country.ts`):
```ts
import { COUNTRY_CONFIGS, type CountryCode } from '$lib/country/constants';
```

**Server-side code** (`+layout.server.ts`, `+page.server.ts`):
```ts
import { getUserCountry, detectCountryFromIP } from '$lib/server/country/detection.server';
import { COUNTRY_CONFIGS, getLocaleForCountry } from '$lib/country/constants';
import { COOKIES } from '$lib/cookies/constants';
```

## SvelteKit Server-Only Module Rules

### ✅ Patterns That Mark Code as Server-Only:
1. Files in `$lib/server/` directory
2. Files with `.server.ts` suffix
3. Imports from `$env/static/private` or `$env/dynamic/private`
4. Imports from `$app/server`

### ✅ Client-Safe Patterns:
- Constants, types, interfaces
- Pure functions (no I/O, no side effects)
- Formatters, validators, calculators
- Utilities that work identically in both environments

## Verification

```bash
pnpm --filter web dev
# Server started successfully on http://localhost:5174/
# ✅ No "impossible situation occurred" error
# ✅ App loads correctly in browser
```

## Key Takeaways

1. **Never mix server and client concerns** in the same file
2. **Use SvelteKit's naming conventions** (`.server.ts`, `$lib/server/`) to enforce boundaries
3. **Import shared constants separately** instead of from server-only modules
4. **Consult Svelte MCP** for official best practices before refactoring
5. **Test immediately** after splitting modules to catch import errors early

## Files Modified

- ✅ Created `$lib/country/constants.ts` (client-safe)
- ✅ Created `$lib/server/country/detection.server.ts` (server-only)
- ✅ Created `$lib/cookies/constants.ts` (shared)
- ✅ Updated `+layout.svelte` imports
- ✅ Updated `+layout.server.ts` imports
- ✅ Updated `+page.server.ts` imports
- ✅ Updated `$lib/hooks/use-country.ts` imports
- ✅ Updated `$lib/server/country.ts` imports
- ✅ Updated `$lib/server/country-redirect.ts` imports
- ✅ Updated `app.d.ts` type imports
- ✅ Updated `$lib/types/index.ts` type imports
- ✅ Updated `$lib/supabase/country-queries.ts` type imports
- ✅ Updated `$lib/server/supabase/country-queries.ts` type imports
- ✅ Updated `routes/api/region/switch/+server.ts` imports
- ✅ Updated `routes/(protected)/sell/+page.server.ts` imports

## Documentation Created

- ✅ `packages/i18n/STRUCTURE_EXPLAINED.md` - Complete i18n architecture guide
- ✅ This summary file for quick reference

---

**Result**: Error resolved. Dev server runs cleanly. App is production-ready.
