# Admin App

**Purpose**: Staff console for managing the Driplo marketplace.

**Owner**: Admin Team
**Backup Contact**: Development Team

## Overview

The admin app provides staff and administrative functionality, including:
- User management and moderation
- Order processing and support
- Analytics and reporting
- Payment and payout management
- System monitoring

## Tech Stack

- SvelteKit 2 with Svelte 5 runes
- Tailwind CSS v4
- Supabase with admin-level access
- Shared UI primitives from `@repo/ui`

## Development

```bash
pnpm dev --filter admin
pnpm build --filter admin
pnpm check --filter admin
```

## Architecture

- Separate authentication flows from main web app
- Admin-specific routes and permissions
- Direct database access for management functions
- Shared components where appropriate