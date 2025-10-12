# Docs App

**Purpose**: Marketing site and documentation for Driplo.

**Owner**: Marketing Team
**Backup Contact**: Development Team

## Overview

The docs app provides public-facing marketing and documentation content:
- Landing pages and marketing content
- API documentation
- Developer guides
- Company information and policies

## Tech Stack

- SvelteKit 2 with Svelte 5 runes
- Tailwind CSS v4
- Content-driven routes
- Shared design system from `@repo/ui`

## Development

```bash
pnpm dev --filter docs
pnpm build --filter docs
pnpm check --filter docs
```

## Architecture

- Content-focused route structure
- Static generation where possible
- Shared components and design tokens
- SEO-optimized pages