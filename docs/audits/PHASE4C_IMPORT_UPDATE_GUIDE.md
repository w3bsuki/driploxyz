# Phase 4C Import Update Guide

This guide explains how to use the comprehensive import update scripts after the Phase 4C restructure.

## What Changed in Phase 4C

### Route Moves
- **Shop routes**: `search`, `brands`, `designer`, `drip`, `sellers`, `wishlist`, `category`, `collection`, `product` → moved to `(app)/(shop)/`
- **Account routes**: `pro` → moved to `(app)/(account)/`
- **Marketing routes**: `about`, `blog`, `careers`, `help`, `privacy`, `terms`, `returns`, `trust-safety` → moved to `(marketing)/`

### Component Colocation
- **Modular components**: `ChatWindow.svelte`, `ConnectionStatus.svelte`, `ConversationSidebar.svelte` → moved to `routes/(protected)/messages/components/`
- **Layout components**: `Header.svelte`, `RealtimeErrorBoundary.svelte`, `RegionSwitchModal.svelte` → moved to `routes/components/`

### Server Code Moves
- **Server modules**: `env/`, `supabase/`, `middleware/`, `analytics/`, `monitoring/`, `security/` → moved to `lib/server/`
- **Utils modules**: `utils/rate-limiting.ts`, `utils/payments.ts`, `cache.ts`, `jobs/slug-processor.ts`, `cookies/` → moved to `lib/server/`

## Import Updates Required

### 1. Component Import Updates
- `$lib/components/modular/` → `./components/` (in messages route)
- `$lib/components/Header.svelte` → `./components/Header.svelte` (in root layout)
- `$lib/components/RealtimeErrorBoundary.svelte` → `./components/RealtimeErrorBoundary.svelte`
- `$lib/components/RegionSwitchModal.svelte` → `./components/RegionSwitchModal.svelte`

### 2. Server Import Updates
- `$lib/env/` → `$lib/server/env/`
- `$lib/supabase/server.ts` → `$lib/server/supabase/server.ts`
- `$lib/middleware/` → `$lib/server/middleware/`
- `$lib/analytics/` → `$lib/server/analytics/`
- `$lib/utils/rate-limiting.ts` → `$lib/server/utils/rate-limiting.ts`
- `$lib/utils/payments.ts` → `$lib/server/utils/payments.ts`
- `$lib/cache.ts` → `$lib/server/utils/cache.ts`
- `$lib/jobs/` → `$lib/server/jobs/`
- `$lib/cookies/` → `$lib/server/cookies/`
- `$lib/security/` → `$lib/server/security/`
- `$lib/monitoring/` → `$lib/server/monitoring/`

### 3. Core Package Import Updates
- `@repo/core/services/products` → `@repo/domain/products`
- `@repo/core/services/ConversationService` → `@repo/domain/conversations`

## Using the Update Scripts

### PowerShell Script (Windows)

```powershell
# Dry run to see what would be changed
.\update-phase4c-imports-comprehensive.ps1 -DryRun

# Live run to apply changes
.\update-phase4c-imports-comprehensive.ps1

# With verbose output
.\update-phase4c-imports-comprehensive.ps1 -Verbose

# Custom project root
.\update-phase4c-imports-comprehensive.ps1 -ProjectRoot "C:\path\to\project"
```

### Bash Script (Cross-platform)

```bash
# Make script executable
chmod +x update-phase4c-imports.sh

# Dry run
DRY_RUN=true ./update-phase4c-imports.sh

# Live run
./update-phase4c-imports.sh

# Custom project root
./update-phase4c-imports.sh "/path/to/project"
```

## Script Features

### Safety Features
- **Backup Creation**: Creates `.backup` files before modifying any file
- **Dry Run Mode**: Preview changes without applying them
- **Comprehensive Logging**: Logs all changes to `phase4c-comprehensive-import-updates.log`
- **Error Handling**: Continues processing even if individual files fail

### What the Scripts Do
1. **Update Modular Component Imports**: Fixes imports in messages route to use colocated components
2. **Update Layout Component Imports**: Fixes root layout imports to use routes/components
3. **Update Server Imports**: Systematically updates all server-related import paths
4. **Fix Core Package Imports**: Updates core package service imports
5. **Handle Duplicate Files**: Identifies and backs up duplicate component files

### Import Pattern Matching
The scripts handle various import styles:
- `import Component from '$lib/path/Component.svelte'`
- `import { Something } from '$lib/path/module'`
- `from '$lib/path/module'`
- Both single and double quotes
- With and without `.ts` extensions

## After Running the Scripts

### 1. Verify TypeScript Compilation
```bash
cd apps/web
pnpm run check
```

### 2. Check for Linting Issues
```bash
cd apps/web
pnpm run lint
```

### 3. Test the Application
```bash
cd apps/web
pnpm run dev
```

### 4. Clean Up (Optional)
If everything is working correctly, you can remove backup files:
```bash
# PowerShell
Get-ChildItem -Recurse -Filter "*.backup" | Remove-Item

# Bash
find . -name "*.backup" -delete
```

## Troubleshooting

### Common Issues
1. **Import Not Found**: After updates, some imports may point to non-existent files
   - Check if the target file exists at the new location
   - Verify the file was moved correctly during Phase 4C

2. **TypeScript Errors**: Import paths may be correct but types may not match
   - Run `pnpm run check` to see specific errors
   - Some services may need to be recreated or interfaces updated

3. **Circular Dependencies**: New import paths may create circular dependencies
   - Check the dependency graph
   - May need to refactor some imports

### Manual Fixes Required
Some imports may require manual attention:
- Dynamic imports with complex paths
- Imports in configuration files
- Imports in build scripts
- Imports in third-party tools

## Rollback Plan

If something goes wrong, you can rollback using the backup files:

```bash
# PowerShell
Get-ChildItem -Recurse -Filter "*.backup" | ForEach-Object {
    $original = $_.Name -replace '\.backup$',''
    Move-Item -Path $_.FullName -Destination (Join-Path $_.DirectoryName $original) -Force
}

# Bash
for backup in $(find . -name "*.backup"); do
    original="${backup%.backup}"
    mv "$backup" "$original"
done
```

## Validation Checklist

After running the update scripts, verify:

- [ ] All files compile without TypeScript errors
- [ ] All routes load correctly in the browser
- [ ] Component imports work in the new locations
- [ ] Server-side imports function properly
- [ ] No broken imports in the console
- [ ] All functionality works as expected

## Support

If you encounter issues:
1. Check the log file for detailed error messages
2. Verify the target files exist at the expected locations
3. Manually fix any complex import patterns the script missed
4. Test thoroughly before deploying to production