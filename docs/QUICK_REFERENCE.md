# Svelte 5 & SvelteKit 2 Quick Reference Guide

## Core Concepts

### Runes (Svelte 5)

| Rune | Purpose | Example |
|------|---------|---------|
| `$state` | Reactive state | `let count = $state(0);` |
| `$derived` | Computed values | `let doubled = $derived(count * 2);` |
| `$props` | Component props | `let { name = 'Guest' } = $props();` |
| `$effect` | Side effects | `$effect(() => console.log(count));` |
| `$bindable` | Two-way binding | `let { value = $bindable() } = $props();` |

### Event Handling

```typescript
// Svelte 4 (legacy)
<button on:click={handleClick}>Click</button>

// Svelte 5 (current)
<button onclick={handleClick}>Click</button>
```

### Component Props

```typescript
// Svelte 4 (legacy)
export let name = 'Guest';
export let count = 0;

// Svelte 5 (current)
let { name = 'Guest', count = 0 } = $props();
```

## Project Structure

### Server/Client Separation

```typescript
// ✅ Server-only code (in $lib/server)
// src/lib/server/database.ts
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// ❌ Never import server code in client components
```

### Component Organization

```typescript
// ✅ Route-specific component (colocated)
// src/routes/blog/[slug]/BlogComments.svelte

// ✅ Shared component (in packages/ui)
// packages/ui/src/lib/components/Button.svelte

// ❌ Avoid putting route-specific components in $lib/components
```

## Data Loading

### Load Functions

```typescript
// ✅ Server load with type safety
// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPost(params.slug);
  return { post };
};

// ✅ Universal load
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const response = await fetch(`/api/posts/${params.slug}`);
  const post = await response.json();
  return { post };
};
```

### Error Handling

```typescript
import { error, redirect } from '@sveltejs/kit';

// ✅ Proper error handling
export const load: PageServerLoad = async ({ params }) => {
  const post = await getPost(params.slug);
  if (!post) error(404, 'Post not found');
  return { post };
};

// ✅ Proper redirect
export const actions = {
  default: async ({ cookies }) => {
    if (!cookies.get('session')) {
      redirect(307, '/login');
    }
  }
};
```

## State Management

### Context API

```typescript
// ✅ Setting context in layout
// src/routes/+layout.svelte
<script>
  import { setContext } from 'svelte';
  let { data }: LayoutProps = $props();
  setContext('user', () => data.user);
</script>

// ✅ Getting context in child component
// src/routes/profile/+page.svelte
<script>
  import { getContext } from 'svelte';
  const user = getContext('user');
</script>
```

### URL-based State

```typescript
// ✅ Using URL search params for state
// src/routes/products/+page.svelte
<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  
  let filters = $derived(new URLSearchParams(page.url.searchParams));
  
  function updateFilter(key: string, value: string) {
    filters.set(key, value);
    const url = new URL(page.url);
    url.searchParams.set(key, value);
    goto(url);
  }
</script>
```

## Component Patterns

### Component Props with Types

```typescript
// ✅ Component with typed props
// Button.svelte
<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    onclick?: () => void;
  }
  
  let { variant = 'primary', size = 'md', onclick }: Props = $props();
</script>

<button class="btn btn-{variant} btn-{size}" {onclick}>
  <slot />
</button>
```

### Component Events

```typescript
// ✅ Callback props instead of events
// Parent.svelte
<script>
  import Child from './Child.svelte';
  
  function handleAction(data: string) {
    console.log('Action:', data);
  }
</script>

<Child onAction={handleAction} />

// Child.svelte
<script>
  let { onAction }: { onAction: (data: string) => void } = $props();
  
  function handleClick() {
    onAction('button clicked');
  }
</script>

<button onclick={handleClick}>Click Me</button>
```

### Snippets (Slots Replacement)

```typescript
// ✅ Default content
// Parent.svelte
<script>
  import Child from './Child.svelte';
</script>

<Child>
  {#snippet content()}
    <p>This is default content</p>
  {/snippet}
</Child>

// Child.svelte
<script>
  let { children }: { children: Snippet } = $props();
</script>

<div>
  {@render children?.()}
</div>

// ✅ Named snippets
// Parent.svelte
<script>
  import Child from './Child.svelte';
</script>

<Child>
  {#snippet header()}
    <h1>Page Title</h1>
  {/snippet}
  {#snippet content()}
    <p>Page content</p>
  {/snippet}
</Child>

// Child.svelte
<script>
  let { header, content }: { 
    header: Snippet, 
    content: Snippet 
  } = $props();
</script>

<header>
  {@render header()}
</header>
<main>
  {@render content()}
</main>
```

## Package Structure

### UI Package

```typescript
// ✅ Proper package exports
// packages/ui/package.json
{
  "name": "@repo/ui",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js"
    },
    "./components/*": {
      "types": "./dist/components/*.d.ts",
      "svelte": "./dist/components/*"
    }
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"]
}

// ✅ Main export file
// packages/ui/src/lib/index.ts
export { default as Button } from './components/Button.svelte';
export { default as Input } from './components/Input.svelte';
// ... other exports
```

### Core Package

```typescript
// ✅ Framework-agnostic business logic
// packages/core/src/services/product.service.ts
export class ProductService {
  async getProduct(id: string): Promise<Product> {
    // Pure business logic, no framework dependencies
  }
}
```

## Common Patterns

### Form Handling

```typescript
// ✅ Form with validation
// src/routes/contact/+page.svelte
<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  
  let { form } = $state({
    name: '',
    email: '',
    message: ''
  });
  
  async function handleSubmit({ data, formElement }) {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(data))
    });
    
    if (response.ok) {
      goto('/contact/success');
    } else {
      return { error: 'Failed to send message' };
    }
  }
</script>

<form method="POST" use:enhance={handleSubmit}>
  <label>
    Name:
    <input name="name" bind:value={form.name} required />
  </label>
  
  <label>
    Email:
    <input name="email" type="email" bind:value={form.email} required />
  </label>
  
  <label>
    Message:
    <textarea name="message" bind:value={form.message} required></textarea>
  </label>
  
  <button type="submit">Send</button>
</form>
```

### API Routes

```typescript
// ✅ Type-safe API route
// src/routes/api/posts/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const posts = await getPosts(url.searchParams);
  return json(posts);
};

export const POST: RequestHandler = async ({ request }) => {
  const post = await request.json() as CreatePostData;
  const newPost = await createPost(post);
  return json(newPost, { status: 201 });
};
```

## Migration Checklist

### Svelte 4 → Svelte 5

- [ ] Replace `export let` with `$props()` destructuring
- [ ] Replace `$:` statements with `$derived` or `$effect`
- [ ] Update event handlers from `on:click` to `onclick`
- [ ] Replace `createEventDispatcher` with callback props
- [ ] Replace slots with snippets
- [ ] Update component instantiation from `new Component` to `mount`

### SvelteKit 1 → SvelteKit 2

- [ ] Update `error()` and `redirect()` calls (no need to throw)
- [ ] Add `path` to `cookies.set()` calls
- [ ] Update `goto()` usage (no external URLs)
- [ ] Update `preloadCode()` to include base path
- [ ] Replace `$app/stores` with `$app/state`
- [ ] Update `resolvePath()` to `resolveRoute()`

## Performance Tips

### Lazy Loading

```typescript
// ✅ Lazy loading components
<script>
  import { lazy } from 'svelte';
  
  const HeavyComponent = lazy(() => import('./HeavyComponent.svelte'));
</script>

{#await HeavyComponent}
  <HeavyComponent />
{/await}
```

### Optimizing Builds

```typescript
// ✅ Dynamic imports for code splitting
<script>
  async function loadEditor() {
    const { default: Editor } = await import('./Editor.svelte');
    // Use Editor component
  }
</script>
```

### Streaming Data

```typescript
// ✅ Streaming with promises in load functions
export const load: PageServerLoad = async ({ params }) => {
  return {
    // Stream comments as they resolve
    comments: loadComments(params.slug),
    // Wait for post before rendering
    post: await loadPost(params.slug)
  };
};
