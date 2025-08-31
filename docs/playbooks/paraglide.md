# Paraglide (i18n) Playbook

Best practices
- Default locale bg without path prefix; English exposed at `/uk` (maps to internal `en`).
- All user‑facing strings come from `@repo/i18n` messages (no hardcoded text).
- Compile Paraglide messages in `packages/i18n` via Vite plugin; import from `@repo/i18n` only.
- Single reroute implementation exported on server and client (strip `/bg|uk` and set locale).
- Persist locale only with functional consent; don’t write cookies without consent.
- SEO: canonical and hreflang per page (product/search/home) reflect locale.

Anti‑patterns seen
- Duplicate reroute logic and mixed default sentinel (treating `en` as default in places).
- Missing client reroute export → client navigations don’t respect prefixed paths.
- Hardcoded text in components; inconsistent link building (missing locale prefix for EN).
- Missing canonical/hreflang wiring in some pages.

Refactor tasks
- [ ] Consolidate reroute
  - Use one function to strip `/bg` and `/uk` during internal routing and export it from both hooks.
  - Server: set `locals.locale` in i18n setup; default `bg`, map `/uk` → `en`.
- [ ] Fix default sentinel
  - In `apps/web/src/lib/server/i18n.ts`, treat `bg` as default everywhere; remove branches that assume `en` default.
- [ ] Canonical + hreflang
  - Ensure `apps/web/src/lib/components/SEOMetaTags.svelte` (or equivalent) renders canonical and hreflang for `bg-BG` and `en-GB`.
- [ ] Link helper
  - Add `linkLocale(path: string, locale: 'bg'|'en')` that returns `path` for bg and `/uk${path}` for en; migrate header/nav/builders to use it.
- [ ] Messages coverage
  - Run Paraglide message lint rules (configured in `packages/i18n/project.inlang/settings.json`) and resolve missing/invalid entries.
- [ ] Cookie persistence with consent
  - Only write the locale cookie when functional consent is true; otherwise keep session‑only state.
- [ ] Imports
  - Replace any direct JSON message imports with `@repo/i18n` exports (compiled output).

Snippets
```ts
// Link helper: $lib/locale/link.ts
export function linkLocale(path: string, locale: 'bg'|'en') {
  return locale === 'bg' ? path : `/uk${path}`
}
```

```ts
// hooks exports (Option A: custom reroute)
// apps/web/src/hooks.server.ts and hooks.client.ts
export { reroute } from './hooks.reroute'
```

```ts
// hooks exports (Option B: adapter reroute)
// If you choose to use the Paraglide SvelteKit adapter
export { reroute } from '@inlang/paraglide-sveltekit/reroute'
```

```svelte
<!-- Usage in components -->
<script lang="ts">
  import * as m from '@repo/i18n'
</script>
<h1>{m.welcome()}</h1>
```

```svelte
<!-- Canonical + hreflang (simplified) -->
<svelte:head>
  <link rel="canonical" href={canonicalHref}>
  <link rel="alternate" hrefLang="bg-BG" href={bgHref}>
  <link rel="alternate" hrefLang="en-GB" href={enHref}>
</svelte:head>
```

Short prompts
- “Export exactly one reroute on server and client; default bg, map `/uk` → `en`; unify i18n setup to treat bg as default. Add canonical/hreflang and a linkLocale helper, and replace hardcoded strings with `@repo/i18n` messages.”
