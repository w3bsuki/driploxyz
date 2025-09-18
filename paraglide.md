# Paraglide v2 Integration Guide

This guide documents how Driplo uses [Paraglide v2](https://github.com/inlang/paraglide-js) for zero-runtime internationalisation. It is intended for both human operators and automation agents (Codex / Claude-code) so the workflow is reproducible and can scale to a multi-market launch.

---

## 1. Directory Layout
- packages/i18n/messages/*.json - source translations per locale (one file per language).
- packages/i18n/project.inlang - Paraglide project configuration (locale list, source language, plugin config).
- packages/i18n/src/ - generated TypeScript source (references for compilation only).
- packages/i18n/lib/ - build output consumed by the monorepo (index.js, index.d.ts, and zero-bundle message modules under paraglide/messages/).

All other packages import translations from @repo/i18n.

---

## 2. Supported Locales
Planned launch markets and language tags:

| Market | Locale tag | Notes |
| --- | --- | --- |
| Pan-EU fallback | en | Generic English copy when no regional match exists. |
| United Kingdom | en-GB | Default English copy; covers GB/IE traffic. |
| United States | en-US | US-optimised copy (currencies, spelling). |
| Bulgaria | bg | Existing production locale. |
| Ukraine | uk | Cyrillic; alias to uk-UA if required. |
| Russia | ru | Cyrillic. |
| Norway | nb | Norwegian Bokmal. |

**Configuration update** (project.inlang/settings.json):
```jsonc
{
  "sourceLanguageTag": "en",
  "languageTags": [
    "en",
    "en-GB",
    "en-US",
    "bg",
    "uk",
    "ru",
    "nb"
  ]
}
```

**Locale aliasing** (packages/i18n/src/index.ts):
```ts
export const LOCALE_ALIASES: Record<string, Locale> = {
  'uk': 'en-GB',
  'gb': 'en-GB',
  'ie': 'en-GB',
  'us': 'en-US',
  'ua': 'uk',
  'ru-RU': 'ru',
  'no': 'nb',
  'nb-NO': 'nb'
};
```
This ensures users arriving with regional Accept-Language headers (e.g. en-GB, nb-NO) map to supported translations.

---

## 3. Common Commands
Run all commands from the repository root in PowerShell.

```powershell
# Compile messages into ./src/paraglide and regenerate TypeScript declarations
pnpm --filter @repo/i18n run compile

# Clean + rebuild everything (recommended when locales change)
pnpm --filter @repo/i18n run build

# Watch for changes during translation editing
pnpm --filter @repo/i18n run dev
```

pnpm --filter @repo/i18n run build performs:
1. clean - removes lib/ and previous outputs.
2. compile - runs paraglide-js compile (creates src/paraglide).
3. copy-runtime - syncs runtime helpers into lib/paraglide/.
4. types - runs tsc to emit lib/index.d.ts with message declarations.

---

## 4. Adding or Updating Locales
1. **Create or update messages**
   - Edit JSON under packages/i18n/messages/ (e.g. en-GB.json, nb.json).
   - Keep keys snake_case for consistency (pdp_sold, filter_ui_applied).

2. **Register locale**
   - Append the locale code to project.inlang/settings.json.
   - Add alias mappings in LOCALE_ALIASES if the Accept-Language code differs.

3. **Regenerate outputs**
```powershell
pnpm --filter @repo/i18n run build
```
   This refreshes lib/paraglide/messages/*.js and updates index.d.ts.

4. **Validate**
   - Spot-check packages/i18n/lib/index.d.ts for new declare function <key>() lines.
   - Run integration checks (pnpm --filter web check-types, smoke test per locale).

### 4.1 Zero-bundle verification & lazy loading
- Confirm compiled message modules remain stub-sized ("0 KB") by importing only explicit keys; run pnpm --filter @repo/i18n run build and inspect lib/paraglide/messages/*.js for minimal wrappers.
- If a feature needs many labels, lazy-load the namespace via await import('@repo/i18n/paraglide/messages/<locale>.js') so non-visible markets do not inflate the bundle.
- Capture bundle stats with pnpm --filter web build -- --analyze whenever locales change; flag any translation chunk >1 KB for review.

---

## 5. Importing Messages in Applications
Use named imports so tree-shaking keeps the bundle zero-cost:

```ts
import { pdp_sold, filter_ui_applied } from '@repo/i18n';

const soldLabel = await pdp_sold();
const filterAnnouncement = await filter_ui_applied({ count: String(changes) });
```

Guidelines:
- Message functions return Promise<string>.
- Keys with placeholders accept input objects ({ count: '5' }).
- Avoid wildcard imports (import * as i18n) unless you need broad access.
- Surface locale-specific strings as props if a component should remain market-agnostic.

---

## 6. Locale Detection & Suggestion Flow
packages/i18n/src/index.ts exposes helpers:
- detectLanguage(acceptLanguage?: string): Locale
- detectLocale({ path, query, cookie, header, defaultLocale }): Locale
- applyLocale(locale: Locale): void

apps/web/src/lib/country/detection.ts turns geo signals into CountryCode + locale/currency metadata and sets cookies so the client and Supabase stay aligned.

### Locale assets & region detection alignment
1. Mirror every Locale in packages/i18n/src/index.ts inside apps/web/src/lib/country/detection.ts' COUNTRY_CONFIGS so region detection and translations stay in sync.
2. When adding a new locale (e.g. uk), create the JSON file, update LOCALE_ALIASES, add the country entry (currency, domain, shipping), and note whether we support automatic redirects or just banner suggestions.
3. Document markets that intentionally reuse en copy (e.g. NL) to avoid 404s for missing translations - track them in COUNTRY_CONFIGS with locale: 'en'.
4. Run pnpm --filter web check-types after regeneration to ensure UI props now typed as string, not Promise<string>, especially in components such as ProductActions, FilterPillGroup, and PaymentForm.

### Geo-aware suggestion banner
1. Use an Edge function or existing geo IP service to enrich event.locals.country (fallback to Accept-Language region).
2. If country maps to a locale that differs from the active session locale, render a non-blocking banner:
```ts
if (locals.country === 'GB' && locals.locale !== 'en-GB') {
  return {
    showLocaleSuggestion: true,
    suggestedLocale: 'en-GB'
  };
}
if (locals.country === 'NO' && locals.locale !== 'nb') {
  // Suggest Norwegian
}
```
3. The banner should set the locale cookie and reload the page when the user confirms.
4. Store a dismissal flag (localStorage/cookie) so the banner does not reappear repeatedly.

---

## 7. Translation Workflow Automation
- Edit only packages/i18n/messages/*.json.
- Ensure CI runs pnpm --filter @repo/i18n run build before type checks.
- Use rg "@repo/i18n" apps/web to find unused keys.
- When working with translators, share the English template and import returned JSON files.
- Review diffs in lib/index.d.ts to ensure new message keys exist and deprecated ones are removed.

---

## 8. Troubleshooting
| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| Type has no exported member | Build not run after editing messages | Re-run pnpm --filter @repo/i18n run build. |
| Runtime 404 for paraglide/messages | copy-runtime skipped | Re-run build; ensure lib/paraglide is committed. |
| Bundle size spike | Wildcard imports pulling entire namespace | Switch to named imports or wrap only messages used. |
| Locale toggles reset | Locale cookie not persisted | Set locale cookie and/or encode locale in the path. |

---

## 9. Supabase Integration - Locale & Market Flow
A single Supabase project can serve multiple markets as long as requests carry an explicit market code and row-level security (RLS) enforces separation.

### 9.1 Schema updates
- Add market_code (text) to market-sensitive tables: products, profiles, orders, etc.
- Default the column when inserting data:
`sql
ALTER TABLE products
  ADD COLUMN market_code text NOT NULL DEFAULT 'en-GB';
```
- Backfill existing rows with the correct market if necessary.

### 9.2 Authentication payload
- When issuing JWTs (Supabase GoTrue), include a market_code claim using the detected locale or stored user preference. Example hook:
```ts
const market = determineMarket(user, requestLocale);
const session = await supabase.auth.admin.updateUserById(user.id, {
  app_metadata: { market_code: market }
});
```
- On the client, persist the market alongside the locale cookie.

### 9.3 RLS policies
- Enable RLS and add policies that scope access to market_code:
`sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "market scoped read"
  ON products FOR SELECT
  USING (market_code = current_setting('request.jwt.claims.market_code', true));

CREATE POLICY "market scoped write"
  ON products FOR INSERT WITH CHECK
  (market_code = current_setting('request.jwt.claims.market_code', true));
```
- Repeat per table that needs isolation.

### 9.4 API usage
- Every Supabase query must filter by the active market:
```ts
const market = getMarketFromStore();
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('market_code', market);
```
- For REST calls, append ?market_code=eq.US.

### 9.5 Locale <-> market mapping
- Derive market_code from locale/geo data:
  | Locale | Market code |
  | --- | --- |
  | en-GB | GB |
  | en-US | US |
  | bg | BG |
  | uk | UA |
  | ru | RU |
  | nb | NO |
  | default | EU |
- Store overrides in user settings so travellers can browse other markets intentionally.

### 9.6 Suggestion banner + Supabase hook-up
1. Detect locale (Paraglide) and geo country (Edge function / IP provider).
2. Map to market_code; if it differs from the current session, render the suggestion banner.
3. On acceptance:
   - Call an API route that sets both the locale cookie and updates the Supabase session to the new market_code.
   - Refresh data queries so only the correct inventory is visible.
4. On dismissal, set a cookie (market_suggestion_dismissed=true) so the banner stays hidden.

---

## 10. Expanding to New Markets
- Add locale JSON files and rebuild: Paraglide stays zero-bundle because only imported messages ship.
- Alias granular Accept-Language codes to supported locales until bespoke translations exist.
- Combine locale detection with feature flags (shipping, taxes, payment providers) stored in Supabase by market_code.
- Provide a manual language switcher so users can override detection.

---

## 11. Release Checklist
- [ ] Messages updated for all supported locales.
- [ ] pnpm --filter @repo/i18n run build executed.
- [ ] lib/index.d.ts diff reviewed for additions/removals.
- [ ] Application type-check (pnpm --filter web check-types) passes.
- [ ] Locale suggestion banner tested (UK -> en-GB, NO -> nb, US -> en-US, etc.).
- [ ] Supabase JWT + RLS policies verified for market-specific data visibility.
- [ ] Smoke tests executed in each locale (product listing, checkout, navigation).

---

## 12. Production rollout checklist for new markets
1. Create or update translation JSON and run pnpm --filter @repo/i18n run build.
2. Extend Locale unions, LOCALE_ALIASES, and COUNTRY_CONFIGS with currency/domain metadata.
3. Verify zero-bundle output with pnpm --filter web build -- --analyze and smoke-test lazy-loaded routes.
4. Regenerate Paraglide types and re-run pnpm --filter web check-types + pnpm --filter @repo/ui check.
5. Validate geo detection end-to-end: update Edge/IP stubs, confirm banner/redirect logic, and ensure Supabase market_code mapping matches the new locale.
6. Capture the run in .logs/i18n-rollout-<locale>.txt (commands, warnings, follow-ups) before handing off to QA.
