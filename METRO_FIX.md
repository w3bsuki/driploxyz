# Metro Bundler Fix for @repo/mobile-shared

## Problem
Metro can't resolve `@repo/mobile-shared` in the monorepo because of pnpm's isolated node_modules structure.

## Solution

### Option 1: Clear Cache (Try This First)

```bash
# Stop any running Expo servers (Ctrl+C)
cd k:\driplo-turbo-1\apps\mobile

# Clear Metro cache
npx expo start --clear
```

### Option 2: Reset Everything

```bash
# Stop all servers
cd k:\driplo-turbo-1

# Remove Metro cache
rm -rf apps/mobile/.expo
rm -rf apps/mobile/node_modules/.cache

# Restart
cd apps/mobile
npx expo start --clear
```

### Option 3: Fix pnpm Hoisting for Expo (Recommended)

The issue is that Expo's Metro bundler doesn't work well with pnpm's strict isolation. We need to hoist some Expo packages.

**Update `.npmrc`:**
```ini
strict-peer-dependencies=false
enable-pre-post-scripts=false
auto-install-peers=true

# Hoist Expo packages to avoid Metro resolution issues
public-hoist-pattern[]=*expo*
public-hoist-pattern[]=*react-native*
public-hoist-pattern[]=@react-native-async-storage/*
```

Then reinstall:
```bash
cd k:\driplo-turbo-1
rm -rf node_modules apps/mobile/node_modules
pnpm install
```

### Option 4: Use Expo's Experimental Package Exports

Update `apps/mobile/package.json` to use proper exports:

```json
{
  "dependencies": {
    "@repo/mobile-shared": "workspace:*"
  },
  "resolutions": {
    "@repo/mobile-shared": "link:../../packages/mobile-shared"
  }
}
```

## Why This Happens

1. **pnpm isolated mode**: Each package gets its own node_modules with symlinks
2. **Metro resolver**: Doesn't follow symlinks by default
3. **Workspace packages**: Metro needs extra config to resolve them

## Current Import (Should Work)

✅ **Correct**: `import { supabase } from '@repo/mobile-shared';`

❌ **Wrong**: `import { supabase } from '@repo/mobile-shared/lib/supabase';`

The package exports `supabase` from its root `index.ts`.

## Verify It Works

After clearing cache and restarting:

```bash
cd apps/mobile
npx expo start --clear
```

Press `w` to open web and check if it loads without errors.

## Still Not Working?

If you still get `Cannot find module @repo/mobile-shared`, the nuclear option is:

```bash
cd k:\driplo-turbo-1

# Nuclear reset
rm -rf node_modules
rm -rf apps/mobile/node_modules  
rm -rf packages/*/node_modules
rm pnpm-lock.yaml

# Reinstall from scratch
pnpm install

# Start fresh
cd apps/mobile
npx expo start --clear
```

This will reinstall everything and clear all caches.
