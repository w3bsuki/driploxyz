# Database Package

**Purpose**: Generated Supabase types and shared database schemas.

**Owner**: Backend Team
**Backup Contact**: Database Team

## Overview

The database package provides:
- Auto-generated TypeScript types from Supabase schema
- Shared Zod schemas for validation
- Database utility types and helpers
- Type-safe database access patterns

## Exports

- `/` - Main entry with all database types and utilities

## Development

```bash
# Types are auto-generated from Supabase CLI
supabase gen types typescript --local > src/generated.ts
```

## Architecture

- Source-only package (no build step required)
- Generated types from Supabase schema
- Shared across all applications
- Version controlled for consistency
- TypeScript strict mode enabled