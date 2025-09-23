# Core Package

**Purpose**: Shared authentication, cookies, and utility helpers for all applications.

**Owner**: Backend Team
**Backup Contact**: Development Team

## Overview

The core package provides essential shared functionality:
- Authentication utilities and helpers
- Cookie management and security
- Common utility functions
- Supabase client abstractions

## Exports

- `/` - Main entry point with all utilities
- `/auth` - Authentication helpers and types
- `/cookies` - Cookie management utilities
- `/utils` - General-purpose utility functions

## Development

```bash
pnpm dev --filter core     # Watch mode with tsup
pnpm build --filter core   # Build with tsup
pnpm test --filter core    # Run unit tests
```

## Architecture

- TypeScript-first with full type safety
- Built with tsup for optimal bundling
- Peer dependency on SvelteKit
- Supabase SSR integration
- Modular exports for tree shaking