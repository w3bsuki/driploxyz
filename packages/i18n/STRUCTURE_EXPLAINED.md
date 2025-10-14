# I18N Structure Explanation

## Overview

The `packages/i18n` folder follows the **Paraglide v2** best practices for Svelte 5/SvelteKit 2 projects. The structure may seem duplicative at first, but each directory serves a specific purpose in the i18n workflow.

## Directory Structure

```
packages/i18n/
├── messages/           # SOURCE: Your editable translation files
│   ├── bg.json
│   └── en.json
├── paraglide/          # GENERATED: Compiled runtime code from messages
│   ├── messages/       # Type-safe message accessors (auto-generated)
│   ├── messages.js     # Compiled message bundle
│   ├── runtime.js      # Paraglide runtime functions
│   ├── registry.js     # Message registry
│   └── server.js       # Server-side utilities
├── project.inlang/     # Paraglide v2 project configuration
│   ├── cache/          # Build cache for faster compilation
│   ├── settings.json   # Language tags, patterns, plugins
│   └── project_id      # Unique project identifier
├── lib/                # BUILT: TypeScript-compiled output for workspace
│   └── src/            # Compiled .d.ts and .js from src/
├── src/                # Custom runtime utilities (your code)
│   ├── index.ts        # Main export re-exporting paraglide + custom utils
│   └── runtime.ts      # Custom locale detection, fallback logic
└── scripts/            # Build tooling
    └── generate-message-exports.mjs
```

## Why This Structure?

### 1. `messages/` - Source of Truth
- **Purpose**: Human-editable translation files
- **Why Here**: Paraglide needs a stable location to read from
- **Managed By**: You and your translators
- **Example**: `messages/en.json` contains `{"welcome": "Welcome to Driplo"}`

### 2. `paraglide/` - Generated Code
- **Purpose**: Compiled, tree-shakable message functions
- **Why Separate**: Git-ignored, regenerated on every build
- **Managed By**: `@inlang/paraglide-js` compiler
- **Example**: Generates `import { welcome } from './paraglide/messages'`
- **DO NOT EDIT** these files manually—they're regenerated from `messages/`

### 3. `project.inlang/` - Configuration
- **Purpose**: Paraglide v2 project settings
- **Why Here**: Standard location for `.inlang` tooling ecosystem
- **Contains**:
  - `settings.json`: Language tags (`["en", "bg"]`), message path patterns
  - `cache/`: Speeds up incremental builds
  - `project_id`: Unique ID for inlang cloud sync (optional)

### 4. Duplicate `messages/` in `paraglide/messages/`?
**NO DUPLICATION**—these serve different roles:
- `messages/` → **Source** (JSON files you edit)
- `paraglide/messages/` → **Compiled accessors** (TypeScript/JS functions)
- The compiler reads from `messages/`, outputs to `paraglide/messages/`

## Paraglide v2 + Svelte 5/Kit 2 Best Practices

### ✅ DO:
1. **Edit only `messages/*.json`** for translations
2. **Import from `@repo/i18n`** (not directly from `paraglide/`)
3. **Run `pnpm --filter @repo/i18n build`** after changing messages
4. **Use tree-shakable imports**: `import { welcome } from '@repo/i18n'`
5. **Set `compilerOptions.runes: true`** in `svelte.config.js` for Svelte 5

### ❌ DON'T:
1. **Don't edit `paraglide/` files** (they're auto-generated)
2. **Don't commit `paraglide/` to Git** (add to `.gitignore`)
3. **Don't mix custom logic in `messages/`** (use `src/runtime.ts` instead)
4. **Don't skip the build step** after changing translations

## Integration with SvelteKit 2

### Server-Side
```ts
// In +page.server.ts or +layout.server.ts
import { detectLocale } from '@repo/i18n/runtime';

export const load = async ({ request, cookies }) => {
  const locale = detectLocale({
    path: request.url.pathname,
    cookie: cookies.get('PARAGLIDE_LOCALE'),
    header: request.headers.get('accept-language')
  });
  
  return { locale };
};
```

### Client-Side (Svelte 5)
```svelte
<script>
  import * as i18n from '@repo/i18n';
  
  let currentLocale = $state(i18n.getLocale());
  
  function switchLanguage(locale: 'en' | 'bg') {
    i18n.setLocale(locale, { reload: true });
  }
</script>

<h1>{i18n.welcome()}</h1>
<button onclick={() => switchLanguage('en')}>English</button>
<button onclick={() => switchLanguage('bg')}>Български</button>
```

## Build Process

1. **Developer edits** `messages/en.json`
2. **Runs** `pnpm --filter @repo/i18n build`
3. **Paraglide compiler**:
   - Reads `messages/*.json`
   - Validates against `project.inlang/settings.json`
   - Generates `paraglide/messages.js` with tree-shakable exports
   - Outputs TypeScript types in `paraglide/messages.d.ts`
4. **Custom build script**:
   - Compiles `src/runtime.ts` to `lib/src/runtime.js`
   - Re-exports Paraglide + custom utilities from `lib/src/index.js`
5. **Workspace apps** import from `@repo/i18n` (points to `lib/`)

## Common Issues Resolved

### Issue: "An impossible situation occurred"
**Cause**: Importing server-only code into client bundles  
**Fix**: Split modules:
- Client-safe: `$lib/country/constants.ts` (configs, types, pure functions)
- Server-only: `$lib/server/country/detection.server.ts` (API calls, cookies, request handling)

### Issue: Translations not updating
**Cause**: Forgot to rebuild after editing `messages/`  
**Fix**: Always run `pnpm --filter @repo/i18n build` after changing translations

### Issue: Bundle size too large
**Cause**: Importing entire runtime instead of specific messages  
**Fix**: Use named imports: `import { welcome, goodbye } from '@repo/i18n'`

## SvelteKit Server-Only Module Rules

### Server-Only Patterns (from SvelteKit docs):
1. Files in `$lib/server/` are **always server-only**
2. Files named `*.server.ts` are **always server-only**
3. Imports from `$env/static/private` or `$env/dynamic/private` are **server-only**
4. Imports from `$app/server` are **server-only**

### Client-Safe Patterns:
- Constants, types, pure functions (no I/O, no cookies, no request objects)
- Utilities that work in both environments (formatting, validation, calculations)

## References

- [Paraglide v2 Docs](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- [SvelteKit Server-Only Modules](https://svelte.dev/docs/kit/server-only-modules)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
