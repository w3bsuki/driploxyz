# Debug Common Issues

Quick fixes for common Driplo development problems.

## TypeScript Errors

### "Cannot find module" errors
```bash
# Regenerate types
pnpm -w turbo run check-types
# Check import paths use @repo/ui, $lib aliases
```

### "Property does not exist" errors
- Check `TECHNICAL.md` for proper type guards
- Use `unknown` instead of `any`
- Implement proper interfaces

### "any" type usage
- Replace with `unknown` + type guards
- See `TECHNICAL.md` for patterns

## Svelte 5 Issues

### Legacy syntax errors
- Replace `export let` with `let { prop } = $props()`
- Replace `$:` with `$derived()`
- Replace `on:click` with `onclick`
- Replace `onMount` with `$effect()`

### Reactivity not working
- Use `$state()` for reactive data
- Use `$derived()` for computed values
- Check `TECHNICAL.md` for patterns

## SvelteKit 2 Issues

### Load function errors
- Server load: Use `+page.server.ts`
- Client load: Use `+page.ts`
- Check `TECHNICAL.md` for patterns

### Form action errors
- Always validate with Zod
- Use `satisfies Actions`
- Return proper error objects

## Build/Dev Issues

### Development server won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

### Port already in use
```bash
# Kill process on port 5173
npx kill-port 5173
```

### Build fails
```bash
# Check for TypeScript errors first
pnpm -w turbo run check-types
# Then try build
pnpm -w turbo run build
```

## Import/Module Issues

### Wrong import paths
```ts
// ✅ CORRECT
import { Button } from '@repo/ui'
import { formatCurrency } from '@repo/utils'
import { supabase } from '$lib/supabase'

// ❌ WRONG
import { Button } from '../../../packages/ui/src/lib/Button.svelte'
```

### Circular dependencies
- Check import chain
- Move shared types to separate files
- Use type-only imports when possible

## Performance Issues

### Slow development server
```bash
# Clear Vite cache
rm -rf node_modules/.vite
pnpm dev --filter web
```

### Slow TypeScript checking
```bash
# Restart TypeScript service in VS Code
# Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

## Mobile Testing Issues

### Layout broken on mobile
- Test at 375px viewport
- Check touch target sizes (44px minimum)
- Verify responsive classes

### Performance on mobile
- Check Network tab for large assets
- Optimize images
- Test on slower connections

## Quick Diagnostic Commands

```bash
# Check all issues at once
pnpm -w turbo run check-types && pnpm -w turbo run lint

# Reset everything
rm -rf node_modules && pnpm install

# Check for outdated packages
pnpm outdated

# Clear all caches
rm -rf node_modules/.cache && rm -rf .svelte-kit
```

## When to Ask for Help

1. Error persists after following these steps
2. Multiple team members affected
3. Build works locally but fails in CI
4. Performance regression detected

Reference `TECHNICAL.md` for detailed patterns and `DEVELOPER.md` for architecture guidance.