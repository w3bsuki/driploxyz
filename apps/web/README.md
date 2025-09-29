# Web App

**Purpose**: Main storefront application for the Driplo marketplace.

**Owner**: Development Team
**Backup Contact**: Admin Team

## Overview

The web app provides the customer-facing storefront experience, including:
- Product browsing and search
- User authentication and profiles
- Shopping cart and checkout
- Order management
- Messaging system
- Seller dashboard

## Tech Stack

- SvelteKit 2 with Svelte 5 runes
- Tailwind CSS v4
- Supabase (auth, database, storage)
- Stripe payments
- Paraglide localization

## Development

```bash
pnpm dev --filter web
pnpm build --filter web
pnpm check --filter web
```

## Testing & QA

```bash
pnpm --filter web test
pnpm --filter web test:e2e
pnpm --filter web build:metrics
```

- `pnpm --filter web test` synchronises SvelteKit, runs Vitest, and executes the
  Playwright smoke suite using the shared `playwright.config.ts`.
- `pnpm --filter web test:e2e` runs Playwright on its own when you only want the
  browser checks.
- `pnpm --filter web build:metrics` runs the custom build report script so you
  can record the current bundle sizes in the Phase 4 validation log.

## Architecture

- Feature code organized in `src/lib`
- Routes grouped by locale when localization is active
- Server logic in load functions and API routes
- Shared components from `@repo/ui`
