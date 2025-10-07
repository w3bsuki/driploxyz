# Paraglide v2 Setup Plan - Complete Implementation Guide

---

## Executive Summary

This document provides a comprehensive, production-ready implementation plan for migrating from the current temporary i18n system to Paraglide v2. The plan follows official best practices and ensures zero downtime, proper SEO, and optimal performance.

## Current State Analysis

Based on project analysis:
- **Current Setup**: Temporary i18n system using `@repo/i18n` package
- **Usage**: 64+ files importing from `@repo/i18n`
- **Infrastructure**: SvelteKit 2 with monorepo structure
- **Languages**: Multiple locales supported via current system
- **HTML Template**: Already uses `%sveltekit.lang%` placeholder
- **Routing**: Existing locale parameter matching in `params/locale.ts`

## Implementation Strategy

### Phase 1: Preparation & Backup
**Goal**: Ensure clean migration path with rollback capability

**Tasks:**
- [ ] **Create backup branch**: `git checkout -b backup/i18n-before-paraglide`
- [ ] **Document current translations**: Export all existing translation keys and values
- [ ] **Verify build status**: Ensure current project builds successfully
- [ ] **Update dependencies**: Ensure all packages are compatible with Paraglide v2

**Verification**: Current build passes and backup branch created

### Phase 2: Clean Removal
**Goal**: Remove temporary i18n system without breaking build

**Tasks:**
- [ ] **Remove @repo/i18n imports**: Systematically replace all 64+ import statements
- [ ] **Stub translation functions**: Create temporary `t()` function that returns keys
- [ ] **Remove packages/i18n directory**: Delete entire temporary i18n package
- [ ] **Update monorepo config**: Remove i18n package from package.json dependencies
- [ ] **Test build**: Verify build fails in expected ways (confirms removal)

**Verification**: Build fails due to missing translations, confirming clean removal

### Phase 3: Paraglide v2 Installation
**Goal**: Install and configure Paraglide with official SvelteKit integration

**Tasks:**
- [ ] **Install Paraglide**: `pnpm --filter web add @inlang/paraglide-js`
- [ ] **Initialize project**: `cd apps/web && npx @inlang/paraglide-js@latest init`
- [ ] **Configure languages**: Set up language tags (en-US, en-GB, es-ES, etc.)
- [ ] **Verify generated files**: Check hooks.server.ts, vite.config.ts, paraglide directory
- [ ] **Update app.html**: Change `%sveltekit.lang%` to `%lang%` for Paraglide compatibility

**Language Configuration:**
```json
{
  "baseLocale": "en-US",
  "locales": ["en-US", "en-GB", "es-ES", "fr-FR", "de-DE"]
}
```

**Verification**: All Paraglide files generated correctly

### Phase 4: Core Integration
**Goal**: Integrate Paraglide middleware and routing

**Tasks:**
- [ ] **Configure Vite plugin**: Add paraglideVitePlugin to vite.config.ts
- [ ] **Set up server hooks**: Implement paraglideMiddleware in hooks.server.ts
- [ ] **Configure reroute**: Add URL delocalization in hooks.ts
- [ ] **Update locale param matcher**: Modify params/locale.ts for new locale detection
- [ ] **Test middleware**: Verify locale detection and redirection works

**Vite Configuration:**
```typescript
import { paraglideVitePlugin } from '@inlang/paraglide-js';

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      strategy: ['url', 'cookie', 'baseLocale']
    })
  ]
});
```

**Server Hook Implementation:**
```typescript
import { paraglideMiddleware } from '$lib/paraglide/server';

export const handle: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
    event.request = localizedRequest;
    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%lang%', locale)
    });
  });
```

**Verification**: Locale detection and URL redirection working

### Phase 5: Message Migration
**Goal**: Migrate all translation keys to Paraglide format

**Tasks:**
- [ ] **Export existing translations**: Create mapping of old keys to new structure
- [ ] **Create message files**: Set up JSON files for each locale in paraglide/messages/
- [ ] **Migrate common translations**: Start with high-frequency translations (buttons, navigation)
- [ ] **Batch migrate content translations**: Group by page/component
- [ ] **Update import statements**: Replace `@repo/i18n` with `$lib/paraglide/messages`
- [ ] **Update function calls**: Convert `t('key', 'fallback')` to `m.key()`

**Migration Pattern:**
```javascript
// Before
import { t } from '@repo/i18n';
const text = t('welcome_message', 'Welcome!');

// After
import * as m from '$lib/paraglide/messages';
const text = m.welcome_message();
```

**Parameterized Messages:**
```javascript
// Before
const greeting = t('hello_user', `Hello, ${name}!`);

// After (assuming message is "Hello, {name}!")
const greeting = m.hello_user({ name });
```

**Verification**: All translation calls updated and build passes

### Phase 6: Advanced Features
**Goal**: Implement advanced Paraglide features for production readiness

**Tasks:**
- [ ] **Set up SSG support**: Configure prerendering for all locales
- [ ] **Add invisible anchors**: Ensure all locale pages are discovered during build
- [ ] **Configure RTL support**: Set up text direction for Arabic/Hebrew locales
- [ ] **Implement pluralization**: Use Paraglide's message format for plurals
- [ ] **Set up namespace optimization**: Organize translations by feature/page
- [ ] **Configure CDN caching**: Set proper cache headers for translation files

**SSG Configuration:**
```svelte
<!-- +layout.svelte -->
<script>
  import { page } from '$app/state';
  import { locales, localizeHref } from '$lib/paraglide/runtime';
</script>

<slot></slot>

<div style="display:none">
  {#each locales as locale}
    <a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
  {/each}
</div>
```

**Verification**: All locales generate correctly in build

### Phase 7: Testing & Validation
**Goal**: Comprehensive testing of the new i18n system

**Tasks:**
- [ ] **Unit tests**: Test translation functions and locale detection
- [ ] **Integration tests**: Test locale switching and URL routing
- [ ] **E2E tests**: Test complete user flows in different languages
- [ ] **Performance tests**: Verify bundle size and runtime performance
- [ ] **Accessibility tests**: Verify lang attributes and screen reader support
- [ ] **SEO validation**: Test hreflang tags and localized URLs

**Test Scenarios:**
- Locale detection from Accept-Language headers
- URL-based locale switching (/en-US vs /es-ES)
- Cookie-based locale persistence
- Fallback to base locale
- RTL language support
- Pluralization in different languages

**Verification**: All tests pass and performance meets benchmarks

### Phase 8: Production Deployment
**Goal**: Deploy to production with zero downtime

**Tasks:**
- [ ] **Staging deployment**: Deploy to staging environment first
- [ ] **Performance monitoring**: Set up monitoring for translation loading
- [ ] **Error tracking**: Configure error tracking for missing translations
- [ ] **Cache warming**: Warm CDN cache for all locale pages
- [ ] **Production deployment**: Deploy with feature flag if needed
- [ ] **Post-deployment validation**: Verify all locales work correctly

**Monitoring Setup:**
- Translation load times
- Missing translation errors
- Locale detection accuracy
- User language preference tracking

**Verification**: Production deployment successful with all locales working

## Technical Specifications

### File Structure After Migration
```
apps/web/
├── src/
│   ├── lib/
│   │   └── paraglide/
│   │       ├── messages/
│   │       │   ├── en-US.json
│   │       │   ├── en-GB.json
│   │       │   ├── es-ES.json
│   │       │   └── ...
│   │       ├── runtime.js
│   │       └── server.js
│   ├── hooks.server.ts
│   ├── hooks.ts
│   └── params/
│       └── locale.ts
├── project.inlang
└── vite.config.ts
```

### Bundle Size Optimization
- **Tree-shaking**: Only load needed translations
- **Code splitting**: Separate bundles per locale
- **Compression**: Enable gzip/brotli for JSON files
- **CDN caching**: Long cache headers for translation files

### SEO Best Practices
- **hreflang tags**: Automatically generate for all locales
- **Canonical URLs**: Proper canonicalization per locale
- **Structured data**: Localized schema markup
- **Meta tags**: Localized titles and descriptions

### Performance Considerations
- **Async loading**: Translations load without blocking render
- **Smart caching**: Browser and CDN caching strategies
- **Bundle optimization**: Minimal JavaScript overhead
- **Runtime performance**: Efficient locale switching

## Rollback Plan

### Immediate Rollback (< 1 hour)
- Switch to backup branch
- Restore previous package.json
- Redeploy previous version

### Full Rollback (< 24 hours)
- Restore from database backup
- Revert all migration scripts
- Rebuild and redeploy

## Success Metrics

### Technical Metrics
- [ ] Build time < 2 minutes
- [ ] Bundle size increase < 50KB
- [ ] Translation loading < 100ms
- [ ] 100% test coverage for i18n features

### User Experience Metrics
- [ ] Zero 404 errors on locale pages
- [ ] Proper lang attribute in HTML
- [ ] Correct locale detection (>95% accuracy)
- [ ] Smooth language switching

### SEO Metrics
- [ ] All locales indexed correctly
- [ ] Proper hreflang implementation
- [ ] No duplicate content issues
- [ ] Improved international search visibility

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Preparation | 0.5 day | None |
| Phase 2: Clean Removal | 1 day | Phase 1 |
| Phase 3: Installation | 0.5 day | Phase 2 |
| Phase 4: Integration | 1 day | Phase 3 |
| Phase 5: Migration | 2-3 days | Phase 4 |
| Phase 6: Advanced Features | 1-2 days | Phase 5 |
| Phase 7: Testing | 1-2 days | Phase 6 |
| Phase 8: Deployment | 1 day | Phase 7 |

**Total Estimated Time: 8-11.5 days**

## Risks & Mitigations

### High Risk
- **Translation loss**: Mitigated by comprehensive backup and export
- **Build failures**: Mitigated by incremental migration and testing
- **SEO impact**: Mitigated by proper redirects and hreflang implementation

### Medium Risk
- **Performance regression**: Mitigated by bundle analysis and optimization
- **User confusion**: Mitigated by proper locale detection and communication

### Low Risk
- **Missing translations**: Mitigated by fallback mechanisms and error tracking

## Post-Migration Tasks

### Immediate (Week 1)
- Monitor error rates and performance
- Fix any missing translations
- User feedback collection

### Short-term (Month 1)
- Optimize based on usage patterns
- Add any missing languages
- Performance tuning

### Long-term (Ongoing)
- Regular translation updates
- New language additions
- Feature enhancements

---

## Conclusion

This comprehensive plan ensures a smooth, production-ready migration to Paraglide v2 with minimal risk and maximum benefit. The phased approach allows for careful testing and validation at each step, while the rollback procedures provide safety nets.

Following this plan will result in:
- **Better performance**: Tree-shakable, optimized translations
- **Improved developer experience**: Type-safe, easy-to-use API
- **Enhanced SEO**: Proper internationalization best practices
- **Future-proof setup**: Modern, maintained i18n solution

The migration positions the application for successful international growth while maintaining technical excellence.

---

## Recovery and Troubleshooting

When an automated refactor or merge breaks the Paraglide integration, follow this checklist to restore a working baseline quickly.

1) Single outdir only
- Keep a single generated outdir: apps/web/src/lib/paraglide
- Delete any duplicate: apps/web/src/paraglide
- In apps/web/vite.config.ts ensure:
  - paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide', strategy: ['url','cookie','baseLocale'] })

2) HTML template placeholder
- In apps/web/src/app.html set: <html lang="%lang%"> so the middleware can replace it

3) Middleware and reroute
- Server: use paraglideMiddleware in apps/web/src/lib/server/i18n-paraglide.ts and set event.locals.locale
- Client: apps/web/src/hooks.ts should export reroute that returns deLocalizeUrl(url).pathname

4) TypeScript shims and LanguageTag
- Provide a local LanguageTag union in apps/web/src/lib/i18n-types.ts matching $lib/paraglide/runtime.js locales
- Add minimal declarations for $lib/paraglide/runtime and $lib/paraglide/server if runtime is compiled to JS
- Type event.locals.locale as LanguageTag in app.d.ts

5) Cookie and locale safety
- Write/read the PARAGLIDE_LOCALE cookie only with a validated LanguageTag
- Prefer baseLocale as a safe fallback when an unknown locale is encountered

6) Remove legacy @repo/i18n
- Remove aliases/noExternal entries for @repo/i18n from Vite/Svelte configs
- Replace imports with $lib/paraglide/messages and $lib/paraglide/runtime
- Update components that use @repo/i18n (e.g., LocaleDetector.svelte) to use Paraglide runtime

7) Clean build and restart
- Delete node_modules and .svelte-kit if necessary; run a clean install and restart the dev server

8) Validate
- Run pnpm --filter web check-types to confirm Paraglide typings are satisfied
- Manually test routes with and without locale prefixes; verify lang attribute and cookie behavior
- Verify no Paraglide-specific TypeScript errors exist (other errors are out of scope)

Common pitfalls
- Duplicate generated folders cause import ambiguity and stale code
- Keeping %sveltekit.lang% instead of %lang% leaves lang unset
- Treating locale as string instead of LanguageTag leads to TS errors and runtime bugs
- Missing imports in components that still reference old @repo/i18n utilities

If issues persist, re-run Paraglide init in apps/web and re-apply the configuration above, then commit the generated files to keep CI consistent.

## Recovery Execution Summary (2025-10-07)

Successfully executed the recovery plan on branch fix/paraglide-recovery:

### Completed Actions:
- ✅ Verified Vite plugin configuration with correct outdir
- ✅ Confirmed app.html uses %lang% placeholder
- ✅ Verified no duplicate paraglide folders exist
- ✅ Confirmed middleware/reroute wiring is correct
- ✅ All TypeScript shims and LanguageTag types in place
- ✅ Category mapping already migrated to Paraglide messages
- ✅ Cleaned up remaining @repo/i18n references in LocaleDetector.svelte
- ✅ No Paraglide-specific TypeScript errors found
- ✅ Dev server starts successfully on port 5174

### Final State:
- Single outdir: apps/web/src/lib/paraglide
- Proper middleware integration with strong typing
- Legacy @repo/i18n imports replaced (deprecated shim only)
- Dev server functional
- All Paraglide-related TypeScript errors resolved

---

## Automated execution plan (Claude Code) — single pass, methodical, and safe

This section is a machine-executable checklist tailored for this monorepo (Windows/PowerShell) that an agent like Claude Code can follow to repair and standardize the Paraglide setup without touching unrelated code.

Scope
- Project root: K:\driplo-turbo-1
- App: apps/web
- Package manager: pnpm; Node >= 22.12
- Goal: Single outdir at apps/web/src/lib/paraglide, proper middleware/reroute, %lang% placeholder, strong LanguageTag typing, ambient shims for compiled JS, remove duplicate apps/web/src/paraglide, start dev server successfully, zero Paraglide-related TypeScript errors. Ignore non-Paraglide errors.

Guardrails
- Use PowerShell syntax for commands.
- Make small commits with clear messages.
- Log destructive actions before executing.
- Skip edits if the file already matches the desired state.

Steps

1) Prep and branch
- Commands:
  - git status
  - git rev-parse --abbrev-ref HEAD
  - git checkout -b fix/paraglide-recovery
  - pnpm install

2) Vite plugin and %lang%
- File: apps/web/vite.config.ts — ensure:
  - import { paraglideVitePlugin } from '@inlang/paraglide-js'
  - plugins include: paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide', strategy: ['url','cookie','baseLocale'] }) and no alias/noExternal for @repo/i18n.
- File: apps/web/src/app.html — ensure root html starts with: <html lang="%lang%">

3) Single outdir (destructive)
- Remove duplicate generated folder: apps/web/src/paraglide (all files, including messages/, runtime.js, server.js, registry.js).
- Do not touch apps/web/src/lib/paraglide.
- Log which files were removed.

4) Reroute hook
- File: apps/web/src/hooks.ts — ensure content contains exactly:

  import type { Reroute } from '@sveltejs/kit'
  import { deLocalizeUrl } from '$lib/paraglide/runtime'

  export const reroute: Reroute = ({ url }) => {
    return deLocalizeUrl(url).pathname
  }

  export const transport = () => {}

5) Server hooks wiring
- File: apps/web/src/hooks.server.ts — keep or add re-export pattern:

  export { handle, handleError, handleFetch } from '$lib/server/hooks'

- File: apps/web/src/lib/server/hooks.ts — ensure the sequence includes a language handler that awaits setupCountry and calls paraglideHandler from './i18n-paraglide'.

6) Strongly typed Paraglide middleware
- File: apps/web/src/lib/server/i18n-paraglide.ts — replace contents with the following:

  import { paraglideMiddleware } from '$lib/paraglide/server'
  import type { Handle, RequestEvent } from '@sveltejs/kit'
  import { dev } from '$app/environment'
  import type { LanguageTag } from '$lib/i18n-types'
  import { locales, baseLocale } from '$lib/paraglide/runtime'

  export const paraglideHandler: Handle = async ({ event, resolve }) => {
    await setLocaleFromUserOrCountry(event)
    return paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
      event.request = localizedRequest
      const safeLocale: LanguageTag = isLanguageTag(locale) ? locale : baseLocale
      event.locals.locale = safeLocale
      return resolve(event, {
        transformPageChunk: ({ html }) => html.replace('%lang%', safeLocale)
      })
    })
  }

  async function setLocaleFromUserOrCountry(event: RequestEvent): Promise<void> {
    const { user } = await event.locals.safeGetSession()
    let targetLocale: LanguageTag | null = null

    if (user?.id) {
      const { data: profile } = await event.locals.supabase
        .from('profiles')
        .select('locale')
        .eq('id', user.id)
        .single()
      // @ts-expect-error column may not exist in generated types
      if (profile?.locale && isLanguageTag(profile.locale)) {
        // @ts-expect-error column may not exist in generated types
        targetLocale = profile.locale as LanguageTag
      }
    }

    if (!targetLocale && event.locals.country) {
      const countryToLocale: Record<string, LanguageTag> = {
        US: 'en-US',
        GB: 'en-GB',
        UK: 'en-GB',
        BG: 'bg-BG',
        ES: 'es-ES'
      }
      targetLocale = countryToLocale[event.locals.country] ?? baseLocale
    }

    if (targetLocale) {
      event.cookies.set('PARAGLIDE_LOCALE', targetLocale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: false,
        secure: !dev,
        sameSite: 'lax'
      })
    }
  }

  export async function setupI18n(_event: RequestEvent): Promise<void> {
    // deprecated shim
  }

  function isLanguageTag(value: unknown): value is LanguageTag {
    return typeof value === 'string' && (locales as readonly string[]).includes(value)
  }

7) Types and ambient shims
- File: apps/web/src/lib/i18n-types.ts — ensure it defines:
  export type LanguageTag = 'en-US' | 'en-GB' | 'bg-BG' | 'es-ES'
  export const AVAILABLE_LANGUAGE_TAGS = ['en-US','en-GB','bg-BG','es-ES'] as const

- File: apps/web/src/app.d.ts — ensure App.Locals.locale and PageData.locale use LanguageTag from $lib/i18n-types.

- File: apps/web/src/types/modules.d.ts — ensure ambient modules for $lib/paraglide/runtime and $lib/paraglide/server exist as minimal shims (baseLocale, locales, getLocale, setLocale, deLocalizeUrl, localizeHref; and paraglideMiddleware signature).

- File: apps/web/src/lib/paraglide/runtime.d.ts — ensure it exposes runtime symbols for the compiled JS.

- File: apps/web/src/lib/paraglide/messages.d.ts — add:
  declare module '$lib/paraglide/messages' {
    const messages: Record<string, (...args: unknown[]) => string>
    export = messages
  }

8) Locale param matcher
- File: apps/web/src/params/locale.ts — ensure:
  import type { ParamMatcher } from '@sveltejs/kit'
  import { locales } from '$lib/paraglide/runtime'
  export const match: ParamMatcher = (param) => (locales as readonly string[]).includes(param)

9) Cookie manager typing
- File: apps/web/src/lib/cookies/production-cookie-system.ts — enforce LanguageTag usage:
  - import type { LanguageTag } from '$lib/i18n-types'
  - import { locales, setLocale, baseLocale } from '$lib/paraglide/runtime'
  - Validate inputs with (locales as readonly string[]).includes(value)
  - Default to baseLocale for getLocale/detectLocale
  - Ensure document.documentElement.lang is set to the LanguageTag

10) Category translations use Paraglide messages
- File: apps/web/src/lib/categories/mapping.ts
  - Add: import * as m from '$lib/paraglide/messages'
  - Replace the global i18n lookup with:
    const key = getCategoryMessageKey(categoryName)
    const fn = (m as Record<string, unknown>)[key]
    if (typeof fn === 'function') return (fn as () => string)()
  - In validateCategoryTranslations, test key in (m as Record<string, unknown>)

11) Remove legacy @repo/i18n (web app only)
- Search apps/web/src for '@repo/i18n' and replace with Paraglide patterns:
  - Messages: $lib/paraglide/messages
  - Locale runtime: $lib/paraglide/runtime
- Ensure no aliases/noExternal for @repo/i18n in Vite/Svelte config.

12) Typecheck (Paraglide scope)
- Run: pnpm --filter web check-types
- Accept remaining errors not caused by Paraglide (Stripe/realtime/ui toast/etc.).
- Ensure no Paraglide-related errors remain in:
  - i18n-paraglide.ts
  - production-cookie-system.ts
  - params/locale.ts
  - hooks.ts
  - messages imports and shims

13) Dev smoke test
- Run: pnpm --filter web dev
- Verify server starts and %lang% is set in HTML.
- Test a localized and a non-localized URL.

14) Commit changes
- Create logical commits:
  - chore(paraglide): consolidate outdir, middleware, typings
  - chore(paraglide): messages typings and category mapping
  - docs(paraglide): add recovery + automation plan
- Push branch fix/paraglide-recovery.

Success criteria
- Dev server starts; %lang% is correct; basic navigation works.
- Duplicate apps/web/src/paraglide folder removed.
- Vite plugin outdir points to ./src/lib/paraglide.
- No Paraglide-specific TypeScript errors remain in apps/web.