# React Version Mismatch Fix for Storybook

## Problem
```
Uncaught (in promise) Error: Incompatible React versions: 
The "react" and "react-dom" packages must have the exact same version. 
Instead got:
  - react:      19.2.0
  - react-dom:  19.1.0
```

## Root Cause

**You're using Storybook for Svelte, which shouldn't need React at all!**

The issue was caused by React-dependent Storybook addons that were installed but not being used:
- `@storybook/addon-a11y` (React-based)
- `@storybook/addon-themes` (React-based)
- `@chromatic-com/storybook` (Has React dependencies)

These addons were pulling in React as a peer dependency even though your Storybook config was only using Svelte-specific addons.

---

## Solution

### 1. Removed React-dependent addons:
```bash
cd packages/ui
pnpm remove @storybook/addon-a11y @storybook/addon-themes @chromatic-com/storybook
```

### 2. Your current Storybook setup (Svelte-only):

**Installed addons:**
- ✅ `@storybook/svelte-vite` - Core Svelte framework
- ✅ `@storybook/addon-svelte-csf` - Svelte Component Story Format
- ✅ `@storybook/addon-docs` - Documentation addon (works with Svelte)
- ✅ `storybook` - Core Storybook

**Config (`.storybook/main.ts`):**
```typescript
const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|ts|svelte)'
  ],
  addons: [
    {
      name: '@storybook/addon-svelte-csf',
      options: { legacyTemplate: true }
    },
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/svelte-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  }
};
```

---

## Why This Happened

When you installed additional Storybook addons (likely experimenting), some were **React-specific** addons that aren't compatible with Svelte. Even though they weren't in your config, they were still being bundled by Vite and causing conflicts.

---

## Svelte-Compatible Addons

If you need these features, use Svelte-compatible alternatives:

### ❌ Don't Use (React-based):
- `@storybook/addon-a11y` → Use browser devtools or `@axe-core/playwright`
- `@storybook/addon-themes` → Implement theme switching in Svelte
- `@storybook/addon-essentials` → Too bloated, cherry-pick what you need
- `@storybook/addon-interactions` → Use Svelte Testing Library instead

### ✅ Safe to Use (Svelte-compatible):
- `@storybook/addon-svelte-csf` ✅ (already installed)
- `@storybook/addon-docs` ✅ (already installed)
- `@storybook/addon-links` - Navigate between stories
- `@storybook/addon-viewport` - Test responsive designs
- `@storybook/addon-backgrounds` - Test on different backgrounds
- `@storybook/addon-measure` - Measure elements
- `@storybook/addon-outline` - Outline elements

---

## Current Status

✅ **Storybook is now running without React conflicts**

**Running at:** http://localhost:6006

**Stories available:**
- Example/Button (4 variants)
- Example/Header (2 variants)
- Example/Page (2 variants)
- Primitives/Button (9 variants)
- Primitives/Input (6 variants)
- Components/Card (5 variants)

---

## Prevention

**Before installing any Storybook addon:**

1. Check if it's Svelte-compatible
2. Look for "react" in its peer dependencies: `pnpm info <addon> peerDependencies`
3. Test in isolation before committing

**Example:**
```bash
# Check addon dependencies before installing
pnpm info @storybook/addon-a11y peerDependencies

# If it lists "react" as a peer dependency, DON'T install it for Svelte!
```

---

## If You Need Chromatic (Visual Regression Testing)

Use the CLI directly instead of the addon:

```bash
# Install Chromatic CLI (not the Storybook addon)
pnpm add -D chromatic

# Run Chromatic
npx chromatic --project-token=<your-token>
```

This avoids the React dependency issue.

---

*Issue resolved: 2025-01-17 02:00 AM*  
*Storybook now running React-free!* ✅
