# IDEAL SvelteKit 2 + Svelte 5 + Turborepo Monorepo Structure

> **Source**: Official SvelteKit & Turborepo documentation (2025-10-11)
> **Status**: This is the IDEAL structure we should refactor towards

## Root Structure

```
driplo-turbo-1/
├── apps/                           # Applications (deployable services)
│   ├── web/                        # Customer-facing SvelteKit app
│   ├── admin/                      # Admin dashboard SvelteKit app
│   └── docs/                       # Documentation site (prerendered)
├── packages/                       # Shared packages (libraries)
│   ├── ui/                         # Shared UI components
│   ├── i18n/                       # Internationalization (Paraglide)
│   ├── core/                       # Business logic (framework-agnostic)
│   ├── database/                   # Database types & utilities
│   ├── domain/                     # Domain models & types
│   ├── eslint-config/              # Shared ESLint configuration
│   ├── typescript-config/          # Shared TypeScript configuration
│   └── testing/                    # Shared test utilities
├── docs/                           # Project documentation
├── scripts/                        # Build & development scripts
├── supabase/                       # Supabase configuration & migrations
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml             # pnpm workspace definition
├── turbo.json                      # Turborepo configuration
├── tsconfig.json                   # Root TypeScript config
└── .gitignore
```

---

## 1. Apps Structure (SvelteKit Best Practices)

### Each App (web/admin/docs) Should Follow SvelteKit 2 Structure:

```
apps/web/
├── src/
│   ├── lib/                        # Internal library code ($lib alias)
│   │   ├── server/                 # Server-only code ($lib/server alias)
│   │   │   ├── auth/               # Auth services (server-only)
│   │   │   ├── db/                 # Database clients (server-only)
│   │   │   └── utils/              # Server utilities
│   │   ├── components/             # Shared components
│   │   │   ├── layout/             # Layout components
│   │   │   ├── forms/              # Form components
│   │   │   └── ui/                 # Generic UI (Button, Input, etc.)
│   │   ├── stores/                 # Svelte stores (if needed)
│   │   ├── utils/                  # Client utilities
│   │   └── types/                  # Shared TypeScript types
│   ├── params/                     # Route parameter matchers
│   ├── routes/                     # File-based routing (COLOCATED)
│   │   ├── (auth)/                 # Auth layout group
│   │   │   ├── login/
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── +page.server.ts
│   │   │   │   └── LoginForm.svelte   # Colocated component
│   │   │   └── +layout.svelte
│   │   ├── (app)/                  # Authenticated app group
│   │   │   ├── dashboard/
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── +page.ts
│   │   │   │   └── DashboardWidget.svelte  # Colocated
│   │   │   └── +layout.svelte
│   │   ├── api/                    # API routes
│   │   │   └── products/
│   │   │       └── +server.ts
│   │   ├── +layout.svelte          # Root layout
│   │   ├── +layout.ts              # Root layout loader
│   │   ├── +page.svelte            # Homepage
│   │   └── +error.svelte           # Root error page
│   ├── app.html                    # HTML template
│   ├── error.html                  # Fallback error page
│   ├── hooks.client.ts             # Client hooks
│   ├── hooks.server.ts             # Server hooks
│   └── service-worker.ts           # Service worker (optional)
├── static/                         # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   └── images/
├── tests/                          # Playwright e2e tests
│   └── example.spec.ts
├── package.json                    # App dependencies
├── svelte.config.js                # SvelteKit config
├── tsconfig.json                   # App TypeScript config
├── vite.config.ts                  # Vite config
├── playwright.config.ts            # Playwright config (if exists)
└── README.md
```

### Key SvelteKit Principles:

1. **Route Colocation**: Components used in one route live WITH that route
2. **$lib/server Separation**: Server-only code in `$lib/server/` to prevent client leaks
3. **Layout Groups**: Use `(groupName)` for shared layouts without affecting URLs
4. **File Naming**: `+page.svelte`, `+layout.svelte`, `+server.ts`, `+page.server.ts`
5. **No Barrel Files**: Import directly from specific files, not index files

---

## 2. Packages Structure (Turborepo Best Practices)

### Internal Package Pattern:

```
packages/ui/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                 # Generic UI components
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   └── Modal.svelte
│   │   │   ├── product/            # Domain-specific
│   │   │   │   ├── ProductCard.svelte
│   │   │   │   └── ProductGrid.svelte
│   │   │   └── layout/
│   │   │       ├── Header.svelte
│   │   │       └── Footer.svelte
│   │   ├── types/                  # TypeScript types
│   │   └── utils/                  # Utilities
│   └── index.ts                    # ONLY export from here
├── package.json                    # Package config
├── tsconfig.json                   # Package TypeScript config
├── svelte.config.js                # Svelte config (if needed)
└── README.md
```

### package.json Structure (Internal Package):

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "svelte": "./src/index.ts"
    },
    "./Button.svelte": {
      "types": "./src/lib/components/ui/Button.svelte",
      "svelte": "./src/lib/components/ui/Button.svelte"
    }
  },
  "svelte": "./src/index.ts",
  "scripts": {
    "check": "svelte-check --tsconfig ./tsconfig.json",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "typescript": "^5.8.0"
  }
}
```

---

## 3. Workspace Configuration

### Root package.json:

```json
{
  "name": "driplo-turbo-1",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@8.15.6",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "format": "turbo run format",
    "test": "turbo run test",
    "check": "turbo run check",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "prettier": "^3.2.0",
    "turbo": "^2.5.4",
    "typescript": "^5.8.0"
  },
  "engines": {
    "node": ">=22.12.0 <23",
    "pnpm": ">=8.15.6"
  }
}
```

### pnpm-workspace.yaml:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### turbo.json:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        ".svelte-kit/**",
        "!.svelte-kit/cache/**",
        ".next/**",
        "!.next/cache/**",
        "dist/**"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "format": {},
    "clean": {
      "cache": false
    }
  }
}
```

---

## 4. Critical Principles

### Framework-Agnostic Packages:

**@repo/core MUST NOT import:**
- ❌ `$app/*` (SvelteKit)
- ❌ `$env/*` (SvelteKit)
- ❌ `$lib/*` (SvelteKit)
- ❌ Any framework-specific code

**@repo/core CAN import:**
- ✅ Pure TypeScript types
- ✅ Framework-agnostic utilities
- ✅ Node.js built-ins
- ✅ External npm packages (non-framework)

### Server-Only Separation:

**Must be in `$lib/server/`:**
- Database clients (Supabase, Prisma, etc.)
- API keys & secrets
- Server-side authentication logic
- Backend services

**Can be in `$lib/`:**
- Shared components
- Client utilities
- Shared types
- Stores

### Route Colocation:

**Single-use components → Colocate with route:**
```
routes/
  products/
    [id]/
      +page.svelte           # Route page
      +page.ts               # Route loader
      ProductDetails.svelte  # ✅ Colocated component
      RelatedProducts.svelte # ✅ Colocated component
```

**Multi-use components → Move to $lib:**
```
lib/
  components/
    product/
      ProductCard.svelte     # ✅ Used by multiple routes
```

---

## 5. Dependency Graph (Correct)

```
apps/web → packages/ui → packages/core
        → packages/i18n
        → packages/domain
        → packages/database

apps/admin → packages/ui → packages/core
          → packages/i18n
          → packages/domain
          → packages/database

packages/ui → packages/domain (types only)
           → packages/core (utils only)

packages/core → ✅ NO framework dependencies
             → ✅ Pure TypeScript/Node.js

packages/domain → ✅ NO framework dependencies
               → ✅ Pure types & models

packages/database → packages/domain (types)
                 → ✅ NO SvelteKit imports
```

---

## 6. TypeScript Configuration

### Root tsconfig.json:

```json
{
  "files": [],
  "references": [
    { "path": "./apps/web" },
    { "path": "./apps/admin" },
    { "path": "./apps/docs" },
    { "path": "./packages/ui" },
    { "path": "./packages/core" },
    { "path": "./packages/domain" },
    { "path": "./packages/database" },
    { "path": "./packages/i18n" }
  ]
}
```

### packages/typescript-config/base.json:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

### packages/typescript-config/svelte.json:

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "moduleResolution": "Bundler",
    "module": "ESNext",
    "target": "ESNext"
  }
}
```

---

## 7. ESLint & Prettier Configuration

### packages/eslint-config/index.js:

```js
export default {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:svelte/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'svelte/no-at-html-tags': 'warn'
  }
}
```

---

## 8. Testing Structure

### packages/testing/vitest.config.base.js:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});
```

---

## 9. What Makes This Structure IDEAL?

### ✅ Follows Official SvelteKit 2 Best Practices:
1. **Route colocation** - Components live with routes
2. **$lib/server separation** - No server code leaks to client
3. **Proper file naming** - `+page.svelte`, `+layout.svelte`, etc.
4. **Layout groups** - Clean URL structure with shared layouts

### ✅ Follows Turborepo Best Practices:
1. **Clear workspace boundaries** - `apps/*` vs `packages/*`
2. **Internal packages** - `@repo/*` naming convention
3. **Dependency graph** - Apps depend on packages, never reverse
4. **Task pipeline** - `dependsOn` ensures correct build order

### ✅ Framework-Agnostic Core:
1. **@repo/core** - No SvelteKit imports, pure business logic
2. **@repo/domain** - Pure types and models
3. **@repo/database** - Database utilities without framework coupling

### ✅ Scalable & Maintainable:
1. **Shared configs** - TypeScript, ESLint, Testing centralized
2. **Consistent structure** - Every app/package follows same pattern
3. **Clear boundaries** - Each package has single responsibility
4. **Type-safe** - Full TypeScript coverage with proper configs

---

## 10. Migration Priority

### Phase 1: Fix Critical Issues (Week 1)
1. ✅ Extract SvelteKit code from @repo/core → apps/web/src/lib/
2. ✅ Remove $app, $env, $lib imports from @repo/core
3. ✅ Implement dependency injection for services
4. ✅ Move server-only code to $lib/server/

### Phase 2: Route Colocation (Week 2)
5. ✅ Move single-use components from $lib/components/ → routes/
6. ✅ Keep multi-use components in $lib/components/
7. ✅ Organize routes with layout groups

### Phase 3: Package Structure (Week 3)
8. ✅ Standardize all package.json exports
9. ✅ Add proper TypeScript project references
10. ✅ Centralize ESLint/Prettier/Testing configs

### Phase 4: Validation (Week 4)
11. ✅ Run `turbo run build` - should pass
12. ✅ Run `turbo run lint` - should pass
13. ✅ Run `turbo run test` - should pass
14. ✅ TypeScript errors: 0

---

## Summary: Current vs Ideal

| Aspect | Current (PROJECT_SITEMAP.md) | Ideal (This Document) |
|--------|------------------------------|----------------------|
| **Structure** | Messy, unclear boundaries | Clean apps/ + packages/ |
| **Route Colocation** | ~30% complete | 100% needed |
| **@repo/core** | 13 SvelteKit imports ❌ | Framework-agnostic ✅ |
| **$lib/server** | Correct ✅ | Correct ✅ |
| **TypeScript** | 115+ errors | 0 errors (goal) |
| **Turborepo** | Basic setup | Full task pipeline ✅ |

**Next Step**: Use this document to refactor the current structure → ideal structure.
