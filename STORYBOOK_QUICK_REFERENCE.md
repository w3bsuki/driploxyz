# Storybook Quick Reference

## Running Storybook

```bash
# Development mode (with HMR)
cd K:\driplo-turbo-1\packages\ui
npx storybook dev -p 6006

# Production build
cd K:\driplo-turbo-1\packages\ui
npx storybook build

# Preview production build
npx http-server storybook-static
```

**URL:** http://localhost:6006

---

## Story File Format (Svelte CSF)

```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Component from './Component.svelte';

  const { Story } = defineMeta({
    title: 'Category/Component',
    component: Component,
    tags: ['autodocs']
  });
</script>

<Story name="Default">
  <Component prop="value">
    Content here
  </Component>
</Story>

<Story name="Variant">
  <Component variant="primary" size="lg">
    Custom content
  </Component>
</Story>
```

---

## Configuration Files

### `.storybook/main.ts`
```ts
import type { StorybookConfig } from '@storybook/svelte-vite';
import { join, dirname } from 'path';

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|ts|svelte)'
  ],
  addons: [
    {
      name: getAbsolutePath('@storybook/addon-svelte-csf'),
      options: {
        legacyTemplate: true  // Important for Svelte 5!
      }
    },
    getAbsolutePath('@storybook/addon-docs')
  ],
  framework: {
    name: getAbsolutePath('@storybook/svelte-vite'),
    options: {}
  },
  docs: {
    autodocs: 'tag'
  }
};

export default config;
```

### `.storybook/preview.ts`
```ts
import type { Preview } from '@storybook/svelte-vite';

// Import all design tokens
import '../src/styles/tokens/foundations.css';
import '../src/styles/tokens/semantic.css';
import '../src/styles/tokens/components.css';
import '../src/styles/tokens/dark-theme.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'gray', value: '#f5f5f5' }
      ]
    }
  },
};

export default preview;
```

### `svelte.config.js` (Svelte 5 Compatibility)
```js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true  // Enable Svelte 5 runes mode
  },
  kit: {
    // SvelteKit config...
  },
  vitePlugin: {
    // Allow legacy syntax in node_modules for Storybook compatibility
    dynamicCompileOptions({ filename }) {
      if (filename.includes('node_modules')) {
        return {
          runes: undefined  // Disable runes mode for node_modules
        };
      }
    }
  }
};
```

---

## Common Issues & Solutions

### Issue: `Unable to index stories: Could not parse import/exports with acorn`
**Solution:** Use `.stories.svelte` format instead of `.stories.ts`

### Issue: `SB_SVELTE_CSF_LEGACY_API_0002: Stories file is using legacy API`
**Solution:** Add `legacyTemplate: true` to addon-svelte-csf options in `main.ts`

### Issue: `context="module" is deprecated`
**Solution:** Use `<script module>` instead of `<script context="module">`

### Issue: Storybook starts in wrong directory
**Solution:** Always run with full path:
```bash
cd K:\driplo-turbo-1\packages\ui && npx storybook dev -p 6006
```

---

## Design Token Usage in Stories

```svelte
<Story name="Themed Button">
  <div style="padding: var(--space-4); background: var(--surface-100);">
    <Button 
      variant="primary" 
      style="--button-bg: var(--color-primary); --button-text: var(--color-on-primary);"
    >
      Themed Button
    </Button>
  </div>
</Story>
```

---

## Useful Commands

```bash
# Check if Storybook is running
netstat -an | findstr 6006

# Kill process on port 6006
npx kill-port 6006

# List all story files
Get-ChildItem -Recurse -Filter "*.stories.*" | Select-Object FullName

# Check Storybook version
npx storybook --version

# Upgrade Storybook
npx storybook upgrade
```

---

## File Structure

```
packages/ui/
├── .storybook/
│   ├── main.ts          # Core configuration
│   └── preview.ts       # Global decorators
├── src/
│   ├── lib/
│   │   ├── primitives/
│   │   │   ├── button/
│   │   │   │   ├── Button.svelte
│   │   │   │   └── Button.stories.svelte
│   │   │   ├── input/
│   │   │   │   ├── Input.svelte
│   │   │   │   └── Input.stories.svelte
│   │   │   └── card/
│   │   │       ├── Card.svelte
│   │   │       └── Card.stories.svelte
│   │   └── card/
│   │       └── Card.stories.svelte
│   └── styles/
│       └── tokens/
│           ├── foundations.css
│           ├── semantic.css
│           ├── components.css
│           └── dark-theme.css
└── svelte.config.js     # Svelte 5 compatibility fix
```

---

## Resources

- [Storybook for Svelte](https://storybook.js.org/docs/svelte/get-started/install)
- [addon-svelte-csf](https://github.com/storybookjs/addon-svelte-csf)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4-alpha)

---

*Last updated: 2025-01-17 01:50 AM*
