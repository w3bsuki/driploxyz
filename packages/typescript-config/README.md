# TypeScript Config Package

**Purpose**: Shared TypeScript configuration for all workspaces in the monorepo.

**Owner**: DevOps Team
**Backup Contact**: Development Team

## Overview

The typescript-config package provides:
- Base TypeScript configuration for strict type checking
- SvelteKit-compatible settings
- Shared compiler options across workspaces
- Consistent path mapping and module resolution

## Usage

In your `tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    // Project-specific overrides
  }
}
```

## Architecture

- Strict TypeScript settings for type safety
- SvelteKit integration
- Workspace-aware path resolution
- Consistent across all packages and apps
- Minimal configuration with sensible defaults