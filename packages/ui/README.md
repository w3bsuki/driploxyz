# UI Package

**Purpose**: Shared component library and design system for all Driplo applications.

**Owner**: Design System Team
**Backup Contact**: Development Team

## Overview

The UI package provides reusable components, tokens, and utilities:
- Svelte 5 components with TypeScript support
- Design tokens and CSS variables
- Tailwind CSS utilities and semantic layers
- Icon components and assets

## Exports

- `/` - Main component library
- `/types` - TypeScript definitions
- `/primitives` - Low-level UI primitives
- `/styles/tokens.css` - Design tokens
- `/styles/semantic.css` - Semantic layer

## Development

```bash
pnpm dev --filter ui      # Watch mode
pnpm build --filter ui    # Build package
pnpm test --filter ui     # Run tests
```

## Architecture

- Svelte 5 rune conventions (`$state`, `$props`, `$derived`)
- TypeScript-first development
- Melt UI and Bits UI foundations
- Tailwind Variants for styling
- Comprehensive test coverage