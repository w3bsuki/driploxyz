# CLI - SvelteKit Commands

**Reference**: https://svelte.dev/docs/kit/cli

## CORE COMMANDS

### 1. Development
```bash
# Start dev server
vite dev
vite dev --port 3000
vite dev --host    # Expose to network
vite dev --open    # Open browser

# With Turbo
pnpm dev
pnpm dev --filter web
```

### 2. Building
```bash
# Build production
vite build
vite build --mode production

# Preview production build
vite preview
vite preview --port 4173
```

### 3. Sync
```bash
# Generate types and sync routes
svelte-kit sync
npx svelte-kit sync

# Run before type checking
pnpm sync && pnpm check
```

## PROJECT SETUP

### 1. Create New Project
```bash
# Interactive setup
npm create svelte@latest my-app
cd my-app
npm install
npm run dev

# With options
npm create svelte@latest my-app -- --template skeleton --types typescript --prettier --eslint --playwright --vitest
```

### 2. Add Integrations
```bash
# Add to existing project
npx sv add lucia        # Auth
npx sv add paraglide    # i18n
npx sv add tailwind     # Tailwind CSS
npx sv add drizzle      # Database ORM
npx sv add mdsvex       # Markdown
```

## VITE COMMANDS

### 1. Dev Server Options
```bash
# Custom config
vite dev -c custom.config.js

# Debug mode
vite dev --debug

# Force optimize deps
vite dev --force

# Clear cache
vite dev --clear-screen false
```

### 2. Build Options
```bash
# Source maps
vite build --sourcemap
vite build --sourcemap hidden

# Watch mode
vite build --watch

# Custom output
vite build --outDir dist

# SSR build
vite build --ssr
```

## PACKAGE SCRIPTS

### 1. Standard Scripts
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "test": "vitest",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

### 2. Turbo Scripts
```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "build:packages": "turbo build --filter=./packages/*",
    "dev:web": "turbo dev --filter=web",
    "check-types": "turbo check-types",
    "clean": "turbo clean && rm -rf node_modules"
  }
}
```

## ENVIRONMENT MODES

### 1. Development
```bash
# Default development
NODE_ENV=development vite dev

# Custom env file
vite dev --mode staging
# Loads .env.staging
```

### 2. Production
```bash
# Production build
NODE_ENV=production vite build

# Production preview
NODE_ENV=production vite preview
```

## TYPE GENERATION

### 1. Route Types
```bash
# Generate route types
svelte-kit sync

# Location: .svelte-kit/types
# Includes:
# - RouteParams
# - PageData
# - PageLoad
# - Actions
```

### 2. App Types
```typescript
// Auto-generated app.d.ts
declare global {
  namespace App {
    interface Error {}
    interface Locals {}
    interface PageData {}
    interface Platform {}
  }
}
```

## DEBUGGING

### 1. Debug Mode
```bash
# Verbose logging
DEBUG=vite:* vite dev

# SvelteKit debug
DEBUG=sk:* vite dev

# Specific module
DEBUG=vite:transform vite dev
```

### 2. Inspect Mode
```bash
# Node debugging
NODE_OPTIONS='--inspect' vite dev

# With break on start
NODE_OPTIONS='--inspect-brk' vite dev
```

## DEPLOYMENT COMMANDS

### 1. Vercel
```bash
# Deploy
vercel
vercel --prod

# Environment variables
vercel env add
vercel env pull
```

### 2. Build Adapters
```bash
# Install adapter
pnpm add -D @sveltejs/adapter-vercel

# Build with adapter
vite build
# Output: .vercel/output
```

## OPTIMIZATION

### 1. Bundle Analysis
```bash
# Install analyzer
pnpm add -D rollup-plugin-visualizer

# Build with stats
vite build --mode analyze
# Output: stats.html
```

### 2. Dependency Pre-bundling
```bash
# Force re-optimize
vite optimize

# Clear cache
rm -rf node_modules/.vite
vite dev --force
```

## MONOREPO COMMANDS

### 1. Workspace Commands
```bash
# Install all
pnpm install

# Build all
pnpm -r build

# Run in specific package
pnpm --filter @repo/ui build
pnpm --filter web dev

# Run in parallel
pnpm -r --parallel dev
```

### 2. Turbo Commands
```bash
# Run pipeline
turbo run build test lint

# With cache
turbo run build --cache-dir=.turbo

# No cache
turbo run build --no-cache

# Specific app
turbo run dev --filter=web
```

## UTILITY COMMANDS

### 1. Clean
```bash
# Clean build artifacts
rm -rf .svelte-kit build .vercel

# Clean deps
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clean everything
pnpm clean
git clean -fdx
```

### 2. Update Dependencies
```bash
# Check outdated
pnpm outdated

# Update all
pnpm update

# Update specific
pnpm update @sveltejs/kit

# Interactive update
pnpm up -i
```

## TROUBLESHOOTING

### 1. Common Fixes
```bash
# Type errors
svelte-kit sync
pnpm check

# Build errors
rm -rf .svelte-kit
pnpm build

# Port in use
vite dev --port 3001

# Permission errors
sudo pnpm install --unsafe-perm
```

### 2. Cache Issues
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear build cache
rm -rf .svelte-kit

# Clear turbo cache
rm -rf .turbo

# Clear all
pnpm clean-all
```

## CUSTOM COMMANDS

### 1. Package.json Scripts
```json
{
  "scripts": {
    "clean": "rm -rf .svelte-kit build",
    "clean:all": "pnpm clean && rm -rf node_modules",
    "prebuild": "pnpm clean",
    "postbuild": "echo Build complete",
    "dev:debug": "DEBUG=* vite dev",
    "analyze": "ANALYZE=true vite build",
    "type-check": "tsc --noEmit",
    "update:deps": "pnpm up -Li"
  }
}
```

### 2. Shell Aliases
```bash
# .zshrc or .bashrc
alias sk="pnpm"
alias skd="pnpm dev"
alias skb="pnpm build"
alias skp="pnpm preview"
alias skc="pnpm check"
alias skt="pnpm test"
```

## PRODUCTION CHECKLIST

```bash
# Before deployment
pnpm check        # Type check
pnpm lint         # Lint code
pnpm test         # Run tests
pnpm build        # Build prod
pnpm preview      # Test locally

# Analyze bundle
pnpm analyze

# Check env vars
vercel env pull
```

## COMMAND FLAGS

### Essential Flags
- `--host` - Expose to network
- `--port` - Custom port
- `--open` - Open browser
- `--force` - Force re-optimize
- `--mode` - Environment mode
- `--debug` - Debug output
- `--watch` - Watch mode
- `--no-cache` - Skip cache

## AUDIT COMMANDS

```bash
# Check setup
npx svelte-kit --version
node --version
pnpm --version

# Validate project
pnpm check
pnpm lint
pnpm test

# Performance
pnpm build --mode analyze
npx lighthouse http://localhost:4173
```