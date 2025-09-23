# I18n Package

**Purpose**: Paraglide localization outputs and internationalization utilities.

**Owner**: Localization Team
**Backup Contact**: Development Team

## Overview

The i18n package provides:
- Compiled Paraglide message bundles
- TypeScript types for translations
- Localization utilities and helpers
- Runtime-optimized translation functions

## Exports

- `/` - Main entry with all translation functions and utilities

## Development

```bash
pnpm dev --filter i18n      # Compile translations in watch mode
pnpm build --filter i18n    # Build complete i18n package
```

## Architecture

- Paraglide-JS for compile-time translation optimization
- No runtime JavaScript duplication
- TypeScript support for all message keys
- Efficient bundle splitting per language
- Generated code from Inlang project files