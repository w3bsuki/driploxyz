# ESLint Config Package

**Purpose**: Shared ESLint configuration for all workspaces in the monorepo.

**Owner**: DevOps Team
**Backup Contact**: Development Team

## Overview

The eslint-config package provides:
- Flat ESLint configuration for modern JavaScript/TypeScript
- Svelte-specific linting rules
- Prettier integration
- Turbo-optimized rules for monorepos

## Exports

- `/` - Main ESLint flat config
- `/index.js` - Direct access to configuration

## Usage

In your `eslint.config.js`:

```javascript
import config from '@repo/eslint-config';

export default config;
```

## Architecture

- ESLint flat config format (modern approach)
- TypeScript and Svelte support
- Prettier compatibility
- Minimal, focused rule set
- Shared across all workspace packages