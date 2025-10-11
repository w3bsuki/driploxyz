# Driplo Project Architecture & Best Practices

## Project Overview

Driplo is a luxury fashion marketplace built with modern web technologies, following best practices for performance, accessibility, and developer experience. This document serves as the comprehensive guide for project structure, development patterns, and technical decisions.

## Technology Stack

### Core Framework
- **SvelteKit 2**: Full-stack framework with SSR, SSG, and CSR capabilities
- **Svelte 5**: Component framework with runes-based reactivity system
- **TypeScript**: Strict type safety across the entire codebase

### Backend & Database
- **Supabase**: Authentication, database, and real-time features
- **PostgreSQL**: Primary database with RLS (Row Level Security)
- **Prisma**: Type-safe database access (optional for complex queries)

### UI & Styling
- **Tailwind CSS v4**: Utility-first CSS framework with design tokens
- **Component-driven architecture**: Reusable UI components
- **Responsive design**: Mobile-first approach

### Internationalization
- **Paraglide.js**: Type-safe i18n with compile-time optimizations
- **Locale-based routing**: SEO-friendly localized URLs

### Build & Deployment
- **Turborepo**: Monorepo build system with intelligent caching
- **pnpm**: Fast, disk space efficient package manager
- **Vercel**: Primary deployment platform

## Monorepo Structure

### Root Directory Organization

```
driplo-turbo-1/
├── docs/                           # Project documentation
│   ├── 00_ROADMAP.md              # Project roadmap and phases
│   ├── 01_TASKS.md                # Task tracking and execution checklist
│   ├── 02_LOG.md                  # Change log and decision records
│   ├── 03_RULES.md                # Technical rules and best practices
│   └── PROJECT.md                 # This file - project architecture
├── apps/                           # Application workspaces
│   ├── web/                       # Main SvelteKit web application
│   └── admin/                     # Admin dashboard application
├── packages/                       # Shared packages
│   ├── ui/                        # Reusable UI components
│   ├── core/                      # Core business logic and services
│   ├── database/                  # Database schemas and migrations
│   ├── i18n/                      # Internationalization setup
│   ├── eslint-config/             # Shared ESLint configuration
│   ├── typescript-config/         # Shared TypeScript configuration
│   └── vitest-config/             # Shared Vitest configuration
├── pnpm-workspace.yaml            # pnpm workspace configuration
├── package.json                   # Root package configuration
├── turbo.json                     # Turborepo configuration
├── svelte.config.js               # Svelte/SvelteKit configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # Root TypeScript configuration
└── README.md                      # Project overview and setup
```

### Workspace Configuration

#### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

#### Root package.json
```json
{
  "name": "@repo/root",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "check-types": "turbo run check-types",
    "test": "turbo run test",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@repo/vitest-config": "workspace:*",
    "turbo": "latest",
    "typescript": "latest"
  }
}
```

#### turbo.json (Root Configuration)
```json
{
  "$schema": "https://turborepo.com/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".svelte-kit/**", "!.svelte-kit/output/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "check-types": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

## Application Structure (apps/web)

### SvelteKit App Organization

```
apps/web/
├── src/
│   ├── lib/
│   │   ├── components/            # Reusable components
│   │   │   ├── ui/               # UI primitives (Button, Input, Modal)
│   │   │   ├── forms/            # Form components
│   │   │   └── layout/           # Layout components
│   │   ├── server/               # Server-side code
│   │   │   ├── auth/             # Authentication logic
│   │   │   ├── database/         # Database operations
│   │   │   └── services/         # Business services
│   │   ├── utils/                # Utility functions
│   │   └── types/                # Type definitions
│   ├── routes/                   # File-system based routing
│   │   ├── (app)/               # App layout group
│   │   ├── (auth)/              # Auth layout group
│   │   ├── api/                 # API routes
│   │   ├── products/            # Product routes
│   │   └── +layout.svelte        # Root layout
│   ├── app.html                  # HTML template
│   └── hooks.server.js           # Server hooks
├── static/                       # Static assets
├── package.json                  # App dependencies
├── svelte.config.js              # SvelteKit config
├── tsconfig.json                 # TypeScript config
└── vite.config.ts                # Vite configuration
```

## Shared Packages Architecture

### @repo/ui Package Structure

```
packages/ui/
├── src/
│   ├── components/               # UI components
│   │   ├── Button/
│   │   │   ├── Button.svelte
│   │   │   ├── Button.test.ts
│   │   │   └── index.ts          # Public exports
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── index.ts              # Barrel exports
│   ├── styles/                   # Shared styles
│   │   ├── components.css        # Component styles
│   │   └── tokens.css            # Design tokens
│   └── index.ts                  # Main entry point
├── package.json
└── tsconfig.json
```

#### UI Component Example (Button.svelte)
```svelte
<script lang="ts">
  import { createSnippet, type Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    onclick,
    children
  }: Props = $props();
</script>

<button
  class="btn btn-{variant} btn-{size}"
  {disabled}
  {onclick}
>
  {#if children}
    {@render children()}
  {:else}
    <slot />
  {/if}
</button>
```

### @repo/core Package Structure

```
packages/core/
├── src/
│   ├── auth/                      # Authentication services
│   │   ├── auth.service.ts
│   │   └── session.service.ts
│   ├── database/                  # Database utilities
│   │   ├── connection.ts
│   │   └── migrations/
│   ├── products/                  # Product services
│   │   ├── product.service.ts
│   │   └── search.service.ts
│   ├── types/                     # Shared types
│   │   ├── product.types.ts
│   │   └── user.types.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Development Best Practices

### Svelte 5 Patterns

#### State Management
```typescript
// ✅ Correct: Use $state for reactive state
let count = $state(0);
let user = $state<User | null>(null);

// ✅ Correct: Use $derived for computed values
let doubled = $derived(count * 2);
let isLoggedIn = $derived(!!user);

// ✅ Correct: Use $effect for side effects
$effect(() => {
  console.log('Count changed:', count);
});

// ❌ Wrong: Don't use top-level let for reactivity
let wrongCount = 0; // Not reactive
```

#### Component Props
```typescript
// ✅ Correct: Destructure props with types
interface Props {
  title: string;
  subtitle?: string;
  onSave?: (title: string) => void;
}

let { title, subtitle = '', onSave } = $props<Props>();

// ❌ Wrong: Don't use export let
export let title: string; // Legacy pattern
```

#### Event Handling
```typescript
// ✅ Correct: Use event attributes
<button onclick={() => handleClick()}>Click me</button>

// ✅ Correct: Use callback props for component events
let { onsubmit } = $props<{ onsubmit?: (data: FormData) => void }>();

// ❌ Wrong: Don't use on: directive for new components
<button on:click={handleClick}>Click me</button> // Legacy
```

#### Snippets over Slots
```svelte
<!-- Parent Component -->
<List items={products}>
  {#snippet item(product)}
    <ProductCard {product} />
  {/snippet}
</List>

<!-- List Component -->
<script>
  let { items, item } = $props();
</script>

{#each items as product}
  {@render item(product)}
{/each}
```

### SvelteKit 2 Patterns

#### Core Version 2 upgrades

- Use the built-in `error()` and `redirect()` helpers without throwing manually; wrap them in guards when inside `try` blocks and use `isHttpError` / `isRedirect` for differentiation.
- Always pass an explicit `path` when calling `cookies.set`, `cookies.delete`, or `cookies.serialize` to avoid browser-scoped surprises.
- Await top-level promises inside `load` functions (e.g. with `Promise.all`) to avoid waterfalls and align with the 2.0 streaming model.

#### Data Loading
```typescript
// ✅ Server loads for private data
// +page.server.ts
export async function load({ cookies, locals }) {
  const user = await getUserFromSession(cookies.get('session'));
  const products = await getProductsForUser(user.id);

  return { user, products };
}

// ✅ Universal loads for public data
// +page.ts
export async function load({ fetch, params }) {
  const product = await fetch(`/api/products/${params.id}`).then(r => r.json());
  return { product };
}

// ✅ Parallel data loading
export async function load({ fetch, params }) {
  const [product, reviews] = await Promise.all([
    fetch(`/api/products/${params.id}`).then(r => r.json()),
    fetch(`/api/products/${params.id}/reviews`).then(r => r.json())
  ]);

  return { product, reviews };
}
```

#### Form Actions
```typescript
// +page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    try {
      const user = await authenticateUser(email, password);
      cookies.set('session', user.sessionId, { path: '/' });

      return { success: true };
    } catch (error) {
      return fail(400, { email, error: 'Invalid credentials' });
    }
  }
} satisfies Actions;
```

#### Remote Functions

```typescript
// svelte.config.js
export default {
  kit: {
    experimental: {
      remoteFunctions: true
    }
  },
  compilerOptions: {
    experimental: {
      async: true
    }
  }
};
```

- Organize remote function files under `src/**/*.remote.ts` and import helpers from `$app/server`.
- Validate every argument with a Standard Schema library (Valibot/Zod) to harden the auto-generated HTTP endpoints.
- `query` functions return cacheable promises that expose `.refresh()` and `.withOverride(...)` for single-flight updates and optimistic UI. Cache queries per invocation and refresh them after `form`/`command` calls that mutate relevant data.
- `form` functions wrap SvelteKit form actions with progressive enhancement and field helpers. Use `form(...).enhance(...)` to opt into custom submission flows and `invalid.field` helpers for programmatic validation errors.
- `command` functions execute imperative mutations (no redirects) and should typically call `.updates(query())` to keep downstream queries in sync.
- `prerender` functions fetch static data at build time and can opt into runtime execution with `{ dynamic: true }`.
- Use `getRequestEvent()` inside remote functions for request-scoped context, but never depend on route parameters for authorization—enforce security in the function itself.

```typescript
// src/routes/products/data.remote.ts
import * as v from 'valibot';
import { query, form } from '$app/server';
import { listProducts, createProduct } from '$lib/server/products';

export const getProducts = query(async () => listProducts());

export const createProductForm = form(
  v.object({
    name: v.pipe(v.string(), v.nonEmpty()),
    price: v.pipe(v.number(), v.minValue(1))
  }),
  async (data, invalid) => {
    try {
      await createProduct(data);
      await getProducts().refresh();
    } catch (error) {
      invalid.global('Failed to create product');
    }
  }
);
```

### TypeScript Configuration

#### Shared TypeScript Configs

**packages/typescript-config/base.json**
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "module": "NodeNext",
    "moduleResolution": "bundler"
  }
}
```

**packages/typescript-config/sveltekit.json**
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*.ts", "src/**/*.js", "src/**/*.svelte"]
}
```

## Testing Strategy

### Vitest Configuration

**packages/vitest-config/vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});
```

### Component Testing Example
```typescript
// Button.test.ts
import { render, screen } from '@testing-library/svelte';
import { test, expect } from 'vitest';
import type { ComponentProps } from 'svelte';
import Button from './Button.svelte';

test('renders button with text', async () => {
  const props: ComponentProps<Button> = {
    children: 'Click me'
  };

  render(Button, props);

  expect(screen.getByRole('button')).toBeInTheDocument();
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const ChartComponent = lazy(() => import('./Chart.svelte'));

// Dynamic imports for conditional rendering
if (showChart) {
  const { default: Chart } = await import('./Chart.svelte');
  // Use Chart component
}
```

### Image Optimization
```svelte
<picture>
  <source srcset={product.imageWebp} type="image/webp" />
  <source srcset={product.imageAvif} type="image/avif" />
  <img
    src={product.image}
    alt={product.name}
    loading="lazy"
    width="400"
    height="300"
  />
</picture>
```

### Bundle Analysis
```json
// package.json scripts
{
  "scripts": {
    "analyze": "pnpm build && npx vite-bundle-analyzer .svelte-kit/output/client"
  }
}
```

## Internationalization

### Paraglide Setup
```typescript
// packages/i18n/src/paraglide.config.js
export default {
  project: './project.inlang',
  outdir: '../paraglide',
  mock: false,
  silent: false,
  tag: 'latest'
};
```

### Usage in Components
```svelte
<script>
  import * as m from '@repo/i18n';
</script>

<h1>{m.home.title()}</h1>
<p>{m.home.description()}</p>
```

## Security Best Practices

### Authentication Flow
```typescript
// packages/core/src/auth/auth.service.ts
export class AuthService {
  async login(email: string, password: string) {
    // Validate credentials
    const user = await this.validateCredentials(email, password);

    // Create secure session
    const session = await this.createSession(user.id);

    return { user, session };
  }

  async verifySession(sessionId: string) {
    // Verify session exists and is valid
    const session = await this.getSession(sessionId);

    if (!session || session.expiresAt < new Date()) {
      throw new Error('Invalid or expired session');
    }

    return session;
  }
}
```

### Supabase Data API Hardening

- Expose only intentional schemas through the Supabase Data API (prefer an `api` schema) and keep transactional tables in private schemas.
- Enable Row Level Security before granting access to any table surfaced via the Data API and scope privileges to specific roles (`anon`, `authenticated`, custom service roles).
- Disable the Data API entirely for services that interact exclusively through server-side clients or edge functions.

### Input Validation
```typescript
// Always validate on server side
export const actions = {
  createProduct: async ({ request }) => {
    const data = await request.formData();

    // Validate input
    const schema = z.object({
      name: z.string().min(1).max(100),
      price: z.number().positive(),
      description: z.string().max(1000)
    });

    const result = schema.safeParse(Object.fromEntries(data));

    if (!result.success) {
      return fail(400, { errors: result.error.flatten() });
    }

    // Process validated data
    const product = await createProduct(result.data);

    return { success: true, product };
  }
};
```

## Deployment Configuration

### Environment Variables
```typescript
// .env.example
# Database
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Authentication
SESSION_SECRET="..."
JWT_SECRET="..."

# External Services
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
RESEND_API_KEY="..."

# Deployment
ORIGIN="https://your-domain.com"
```

### Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "sveltekit",
  "functions": {
    "src/routes/api/**/*.server.ts": {
      "maxDuration": 30
    }
  }
}
```

## MCP Workflow

### Svelte MCP

- Always start agent sessions with `list-sections` to understand the available documentation, then call `get-documentation` with every relevant section before making architectural decisions.
- Before sharing Svelte components, run the `svelte-autofixer` tool repeatedly until no issues remain; capture notable autofixer guidance in review notes.
- Offer Svelte Playground links only when code isn’t being committed to the repo and after confirming with the requester.

### Supabase MCP

- Generate personal access tokens from the Supabase dashboard specifically for MCP usage, scope them to the project under construction, and keep them in read-only mode unless a write is explicitly required.
- Store PAT references securely (no plaintext in the repo) and rotate them whenever contributors change; prefer Supabase branches for agent-assisted experimentation.
- Log every Supabase MCP tool invocation that touches data or infrastructure in `docs/02_LOG.md`, including whether feature groups were restricted.
- Review Supabase prompt-injection and security guidelines quarterly, and keep MCP activity in non-production environments.

## Monitoring & Observability

### Error Handling
```typescript
// hooks.server.js
export const handleError = async ({ error, event }) => {
  // Log to monitoring service
  console.error('Application error:', error);

  // Return user-friendly error page
  return {
    message: 'Something went wrong',
    code: 'INTERNAL_ERROR'
  };
};
```

### Performance Monitoring
```typescript
// src/lib/analytics.ts
export function trackPageView(path: string) {
  // Send to analytics service
  gtag('config', 'GA_MEASUREMENT_ID', {
    page_path: path
  });
}

export function trackUserAction(action: string, properties?: Record<string, any>) {
  // Track user interactions
  gtag('event', action, properties);
}
```

## Development Workflow

### Quality Gates
```bash
# Run all quality checks
pnpm lint          # Code linting
pnpm check-types    # Type checking
pnpm test          # Unit and integration tests
pnpm build         # Build validation
```

### Pre-commit Hooks
```json
// package.json
{
  "devDependencies": {
    "husky": "latest",
    "lint-staged": "latest"
  },
  "scripts": {
    "prepare": "husky install",
    "lint-staged": "lint-staged"
  },
  "lint-staged": {
    "*.{js,ts,svelte}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## Contributing Guidelines

### Code Review Checklist
- [ ] Follows Svelte 5 patterns (runes, event attributes, snippets)
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling and loading states
- [ ] Accessibility compliance (ARIA labels, keyboard navigation)
- [ ] Performance considerations (lazy loading, code splitting)
- [ ] Security best practices (input validation, proper auth)
- [ ] Internationalization support where applicable
- [ ] Test coverage for new functionality
- [ ] Documentation updates for API changes

### Git Workflow
1. Create feature branch from main
2. Implement changes following best practices
3. Run quality gates locally
4. Create pull request with clear description
5. Address review feedback
6. Merge when all checks pass

## Conclusion

This architecture provides a solid foundation for building a scalable, maintainable luxury fashion marketplace. The combination of Svelte 5's modern reactivity system, SvelteKit's full-stack capabilities, and Turborepo's efficient build system creates an excellent developer experience while maintaining high performance standards.

The patterns and best practices outlined here should be consistently followed to ensure code quality, maintainability, and long-term project success.