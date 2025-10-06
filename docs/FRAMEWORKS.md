# Framework Guides

Unified reference for SvelteKit 2, Svelte 5, Tailwind CSS v4, and Paraglide i18n.

---

## Table of Contents

1. [SvelteKit 2](#sveltekit-2) - Routing, data loading, actions
2. [Svelte 5](#svelte-5) - Runes, components, reactivity
3. [Tailwind CSS v4](#tailwind-css-v4) - Design system, utilities
4. [Paraglide](#paraglide) - Type-safe internationalization

---

## SvelteKit 2

SvelteKit 2 is the application framework handling routing, data loading, and server-side rendering.

### Routing Structure

```
src/routes/
├── +layout.svelte          # Root layout (UI)
├── +layout.server.ts       # Root layout data (server-only)
├── +page.svelte            # Home page (UI)
├── +page.server.ts         # Home page data (server-only)
├── products/
│   ├── +page.svelte
│   ├── +page.server.ts
│   └── [id]/
│       ├── +page.svelte
│       └── +page.server.ts
└── api/
    └── checkout/
        └── +server.ts      # API endpoint
```

### Load Functions

**Server Load (+page.server.ts):**
```typescript
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, params }) => {
  const { supabase } = locals;
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  return { product: data };
}) satisfies PageServerLoad;
```

**Universal Load (+page.ts):**
```typescript
import type { PageLoad } from './$types';

export const load = (async ({ data, fetch }) => {
  // Can run on server or client
  // No access to secrets
  return { ...data };
}) satisfies PageLoad;
```

### Form Actions

```typescript
// +page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get('email');

    // Validate
    if (!email) {
      return fail(400, { error: 'Email required' });
    }

    // Process
    const { supabase } = locals;
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      return fail(500, { error: error.message });
    }

    // Redirect (SvelteKit 2 syntax - no throw)
    return redirect(303, '/check-email');
  }
} satisfies Actions;
```

**Using in component:**
```svelte
<script>
  import { enhance } from '$app/forms';
  let { form } = $props();
</script>

<form method="POST" use:enhance>
  <input name="email" type="email" />
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  <button>Submit</button>
</form>
```

### Navigation

```typescript
import { goto, invalidate } from '$app/navigation';
import { beforeNavigate, afterNavigate } from '$app/navigation';

// Navigate programmatically
await goto('/products');

// Rerun load functions
await invalidate('supabase:auth');

// Navigation hooks
beforeNavigate(({ from, to, cancel }) => {
  if (unsavedChanges) {
    if (!confirm('Leave without saving?')) {
      cancel();
    }
  }
});

afterNavigate(({ from, to }) => {
  // Analytics, scroll restoration, etc.
});
```

### Error Handling

```typescript
// +error.svelte
<script>
  import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error.message}</h1>
```

```typescript
// In load/action
import { error } from '@sveltejs/kit';

if (!product) {
  return error(404, 'Product not found');
}
```

### Key Rules

- **UI in +page.svelte**, data logic in load functions
- **Server-only code** in +page.server.ts, +server.ts
- **Use `satisfies`** for type-safe load/action exports
- **Use `redirect()` and `error()`** without `throw` (SvelteKit 2)
- **Avoid window.location** - use `goto()` instead

---

## Svelte 5

Svelte 5 introduces runes - a new reactive paradigm replacing `$:` and `export let`.

### Runes Overview

| Rune | Purpose | Example |
|------|---------|---------|
| `$state` | Reactive state | `let count = $state(0);` |
| `$derived` | Computed values | `let doubled = $derived(count * 2);` |
| `$effect` | Side effects | `$effect(() => console.log(count));` |
| `$props` | Component props | `let { title } = $props();` |
| `$bindable` | Two-way binding | `let { value = $bindable() } = $props();` |

### State Management

```svelte
<script>
  // ✅ Reactive state
  let count = $state(0);

  // ✅ Derived values (pure computation)
  let doubled = $derived(count * 2);
  let isEven = $derived(count % 2 === 0);

  // ✅ Derived with function
  let expensive = $derived.by(() => {
    // Complex computation
    return count * Math.random();
  });

  // ✅ Side effects
  $effect(() => {
    console.log('Count changed:', count);

    // Cleanup
    return () => {
      console.log('Cleanup');
    };
  });

  function increment() {
    count++; // Reassign triggers reactivity
  }
</script>

<button onclick={increment}>
  {count} (doubled: {doubled})
</button>
```

### Arrays and Objects

**Important:** Reassign arrays/objects, don't mutate:

```svelte
<script>
  // ✅ Good - reassign
  let items = $state([1, 2, 3]);

  function addItem() {
    items = [...items, items.length + 1];
  }

  function removeItem(index) {
    items = items.filter((_, i) => i !== index);
  }

  // ❌ Bad - mutation won't trigger reactivity
  function badAdd() {
    items.push(4); // Won't update UI
  }
</script>
```

### Component Props

```svelte
<!-- Parent.svelte -->
<script>
  import Child from './Child.svelte';
  let name = $state('World');
</script>

<Child {name} age={25} />

<!-- Child.svelte -->
<script>
  // Props with defaults
  let { name, age = 18 } = $props();
</script>

<p>{name} is {age} years old</p>
```

### Bindable Props

```svelte
<!-- Input.svelte -->
<script>
  let { value = $bindable() } = $props();
</script>

<input bind:value />

<!-- Parent.svelte -->
<script>
  let text = $state('');
</script>

<Input bind:value={text} />
<p>You typed: {text}</p>
```

### Shared State (Stores)

**Factory pattern:**

```typescript
// stores/counter.svelte.ts
export function createCounter(initial = 0) {
  let count = $state(initial);
  let doubled = $derived(count * 2);

  return {
    get count() { return count; },
    get doubled() { return doubled; },
    increment: () => count++,
    decrement: () => count--
  };
}

// Usage in component
<script>
  import { createCounter } from '$lib/stores/counter.svelte.ts';
  const counter = createCounter(0);
</script>

<button onclick={counter.increment}>
  {counter.count}
</button>
```

### Context API

```svelte
<!-- Parent.svelte -->
<script>
  import { setContext } from 'svelte';

  const theme = $state({ mode: 'light' });
  setContext('theme', theme);
</script>

<!-- Child.svelte -->
<script>
  import { getContext } from 'svelte';

  const theme = getContext('theme');
</script>

<div class={theme.mode}>Content</div>
```

### Anti-Patterns

- ❌ Using `$effect` for pure computations (use `$derived`)
- ❌ Mutating arrays/objects (reassign instead)
- ❌ Renaming props (`export let someProp as renamed`)
- ❌ Mutating module-scope state without factories
- ❌ Complex logic in `$effect` (extract to functions)

---

## Tailwind CSS v4

Tailwind CSS v4 introduces CSS-first configuration and major performance improvements.

### Configuration (CSS-First)

**No more `tailwind.config.js`** - everything in CSS:

```css
/* apps/web/src/app.css */
@import 'tailwindcss';
@import '@repo/ui/styles/tokens.css';
@import '@repo/ui/styles/semantic.css';

@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';

@source '../../../packages/ui/src/**/*.{html,js,svelte,ts}';
@source './lib/**/*.{svelte,ts}';
@source './routes/**/*.{svelte,ts}';

@theme {
  /* Custom tokens */
  --color-primary: oklch(0.15 0.015 270);
  --spacing-gutter: 1rem;
}
```

### Design Tokens

**Shared tokens (packages/ui/src/styles/tokens.css):**

```css
@theme {
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Colors (OKLCH) */
  --color-gray-50: oklch(0.98 0.002 270);
  --color-gray-900: oklch(0.15 0.015 270);

  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'Fira Code', monospace;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}
```

**Semantic tokens (semantic.css):**

```css
@theme {
  /* Surfaces */
  --surface-primary: var(--color-gray-50);
  --surface-secondary: var(--color-gray-100);

  /* Text */
  --text-primary: var(--color-gray-900);
  --text-secondary: var(--color-gray-600);

  /* Borders */
  --border-default: var(--color-gray-300);
}
```

### Utility Classes

```svelte
<!-- Component example -->
<div class="flex flex-col gap-4 p-6 bg-surface-primary rounded-lg">
  <h2 class="text-2xl font-bold text-text-primary">
    Product Title
  </h2>
  <p class="text-sm text-text-secondary">
    Description text
  </p>
  <button class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
    Add to Cart
  </button>
</div>
```

### Responsive Design

```svelte
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Responsive grid -->
</div>

<h1 class="text-xl md:text-2xl lg:text-3xl">
  <!-- Responsive typography -->
</h1>
```

### Container Queries (Built-in v4)

```svelte
<div class="@container">
  <div class="@sm:flex @lg:grid @lg:grid-cols-2">
    <!-- Responds to container size, not viewport -->
  </div>
</div>
```

### Dark Mode

```css
@theme {
  --color-background: light-dark(white, black);
  --color-text: light-dark(black, white);
}
```

```svelte
<html data-theme="dark">
  <!-- Dark mode active -->
</html>
```

### Custom Layers

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600;
  }
}
```

### Accessibility

**Touch targets (44px minimum):**

```css
@layer components {
  .btn {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Performance

- **Purge unused CSS** automatically via `@source`
- **Optimize imports** - only import what you use
- **Monitor bundle size** - check `.svelte-kit/output/client`

---

## Paraglide

Type-safe internationalization with compile-time message extraction.

### Setup

**Project structure:**

```
packages/i18n/
├── messages/
│   ├── en.json
│   ├── fr.json
│   ├── de.json
│   └── es.json
├── project.inlang/
│   └── settings.json
└── src/
    └── index.ts
```

**Messages (messages/en.json):**

```json
{
  "welcome": "Welcome to Driplo",
  "greeting": "Hello, {name}!",
  "itemCount": "You have {count} items"
}
```

### Usage in Components

```svelte
<script>
  import * as m from '@repo/i18n/messages';

  let userName = 'Alice';
  let cartCount = 3;
</script>

<h1>{m.welcome()}</h1>
<p>{m.greeting({ name: userName })}</p>
<p>{m.itemCount({ count: cartCount })}</p>
```

### Adding Translations

1. **Edit message files:**
   ```json
   // messages/fr.json
   {
     "welcome": "Bienvenue sur Driplo"
   }
   ```

2. **Regenerate bundles:**
   ```bash
   pnpm --filter @repo/i18n build
   ```

3. **Use in components** (same API, different language)

### Locale Detection

**In hooks.server.ts:**

```typescript
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
  async ({ event, resolve }) => {
    // Detect locale from URL, cookie, or header
    const locale = event.url.pathname.split('/')[1];
    event.locals.locale = ['en', 'fr', 'de', 'es'].includes(locale)
      ? locale
      : 'en';

    return resolve(event);
  }
);
```

### Language Switcher

```svelte
<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' }
  ];

  function switchLanguage(lang) {
    const path = $page.url.pathname.replace(/^\/[a-z]{2}/, `/${lang}`);
    goto(path);
  }
</script>

<select onchange={(e) => switchLanguage(e.target.value)}>
  {#each languages as lang}
    <option value={lang.code}>{lang.name}</option>
  {/each}
</select>
```

### Supported Locales

- 🇺🇸 English (en)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇪🇸 Spanish (es)

### Adding New Locales

1. Create `messages/{locale}.json`
2. Update `project.inlang/settings.json`
3. Regenerate bundles: `pnpm --filter @repo/i18n build`
4. Update locale detection in hooks

---

## Integration Examples

### SvelteKit + Svelte 5 + Paraglide

```svelte
<!-- +page.server.ts -->
<script lang="ts">
  import type { PageServerLoad } from './$types';

  export const load = (async ({ locals }) => {
    const { supabase } = locals;
    const { data } = await supabase.from('products').select('*');
    return { products: data };
  }) satisfies PageServerLoad;
</script>

<!-- +page.svelte -->
<script>
  import * as m from '@repo/i18n/messages';

  let { data } = $props();
  let products = $derived(data.products || []);
</script>

<h1>{m.products_title()}</h1>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  {#each products as product}
    <div class="p-4 bg-white rounded-lg shadow">
      <h3 class="text-lg font-bold">{product.name}</h3>
      <p class="text-sm text-gray-600">{product.price}</p>
    </div>
  {/each}
</div>
```

---

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
- [TESTING.md](./TESTING.md) - Testing strategy
- [SUPABASE.md](./SUPABASE.md) - Database and auth