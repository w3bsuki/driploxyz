# APP MODULES - $app/* Imports

**References**: 
- https://svelte.dev/docs/kit/$app-environment
- https://svelte.dev/docs/kit/$app-forms
- https://svelte.dev/docs/kit/$app-navigation
- https://svelte.dev/docs/kit/$app-paths
- https://svelte.dev/docs/kit/$app-stores

## $app/environment

### 1. Environment Detection
```typescript
import { browser, building, dev, version } from '$app/environment';

// Browser vs Server
if (browser) {
  // Client-side only code
  window.localStorage.setItem('key', 'value');
} else {
  // Server-side only code
  console.log('SSR rendering');
}

// Development vs Production
if (dev) {
  console.log('Development mode');
} else {
  // Production optimizations
}

// Build time check
if (building) {
  // Skip during build
}

// Version hash
console.log(`App version: ${version}`);
```

### 2. Common Patterns
```svelte
<script>
  import { browser } from '$app/environment';
  
  // Lazy load heavy libraries
  if (browser) {
    import('heavy-library').then(lib => {
      // Use library
    });
  }
  
  // Conditional rendering
  {#if browser}
    <ClientOnlyComponent />
  {/if}
</script>
```

## $app/forms

### 1. Progressive Enhancement
```svelte
<script>
  import { enhance, applyAction } from '$app/forms';
  
  let loading = false;
</script>

<form method="POST" use:enhance={() => {
  loading = true;
  
  return async ({ result }) => {
    loading = false;
    
    // Custom handling
    if (result.type === 'success') {
      // Handle success
    }
    
    // Apply default behavior
    await applyAction(result);
  };
}}>
  <button disabled={loading}>
    {loading ? 'Saving...' : 'Save'}
  </button>
</form>
```

### 2. Advanced Enhancement
```svelte
<script>
  import { enhance } from '$app/forms';
  
  function handleSubmit() {
    return async ({ action, cancel, formData, formElement, submitter }) => {
      // Validate before submit
      if (!formData.get('email')) {
        cancel();
        return;
      }
      
      // Modify form data
      formData.append('timestamp', Date.now());
      
      // Return cleanup function
      return async ({ result, update }) => {
        if (result.type === 'success') {
          // Custom success handling
          formElement.reset();
        } else {
          // Use default SvelteKit handling
          await update();
        }
      };
    };
  }
</script>

<form use:enhance={handleSubmit}>
  <!-- Form fields -->
</form>
```

## $app/navigation

### 1. Programmatic Navigation
```typescript
import { 
  goto, 
  invalidate, 
  invalidateAll,
  preloadCode,
  preloadData,
  afterNavigate,
  beforeNavigate,
  onNavigate
} from '$app/navigation';

// Navigate programmatically
await goto('/dashboard', {
  replaceState: true,
  noScroll: true,
  keepFocus: true,
  invalidateAll: false
});

// Preload routes
await preloadData('/next-page');
await preloadCode('/products/*');

// Invalidate data
await invalidate('app:products');
await invalidateAll(); // Rerun all load functions
```

### 2. Navigation Lifecycle
```svelte
<script>
  import { beforeNavigate, afterNavigate, onNavigate } from '$app/navigation';
  
  beforeNavigate(({ cancel, from, to, type, willUnload }) => {
    if (hasUnsavedChanges && !willUnload) {
      if (!confirm('Leave without saving?')) {
        cancel();
      }
    }
  });
  
  afterNavigate(({ from, to, type, willUnload }) => {
    // Analytics tracking
    gtag('event', 'page_view', {
      page_path: to?.url.pathname
    });
  });
  
  onNavigate((navigation) => {
    // View transitions API
    if (!document.startViewTransition) return;
    
    return new Promise(resolve => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>
```

### 3. Form Reset on Navigation
```typescript
import { beforeNavigate } from '$app/navigation';

beforeNavigate(() => {
  // Reset form state
  formData = {};
  errors = {};
});
```

## $app/paths

### 1. Base Path & Assets
```typescript
import { base, assets } from '$app/paths';

// Construct URLs with base path
const apiUrl = `${base}/api/data`;
const homeUrl = `${base}/`;

// Reference assets
const logoUrl = `${assets}/logo.png`;
const styleUrl = `${assets}/styles.css`;
```

### 2. Dynamic Path Construction
```svelte
<script>
  import { base, assets } from '$app/paths';
  
  function buildPath(path: string) {
    return `${base}${path}`;
  }
</script>

<a href={buildPath('/about')}>About</a>
<img src="{assets}/images/hero.jpg" alt="Hero">

<!-- Handle subdirectory deployments -->
<a href="{base}/products">Products</a>
```

## $app/stores

### 1. Core Stores
```svelte
<script>
  import { 
    page, 
    navigating, 
    updated,
    getStores
  } from '$app/stores';
  
  // Current page info
  $: console.log($page.url.pathname);
  $: console.log($page.params);
  $: console.log($page.route.id);
  $: console.log($page.state);
  $: console.log($page.data);
  $: console.log($page.form);
  
  // Navigation state
  {#if $navigating}
    <p>Navigating to {$navigating.to?.url.pathname}</p>
  {/if}
  
  // App updates
  $: if ($updated) {
    location.reload();
  }
</script>
```

### 2. Page Store Patterns
```svelte
<script>
  import { page } from '$app/stores';
  
  // Active link highlighting
  $: isActive = (path: string) => $page.url.pathname === path;
  
  // Query params
  $: searchQuery = $page.url.searchParams.get('q');
  
  // Route-based logic
  $: if ($page.route.id === '/(app)/dashboard') {
    // Dashboard-specific code
  }
</script>

<nav>
  <a href="/home" class:active={isActive('/home')}>Home</a>
  <a href="/about" class:active={isActive('/about')}>About</a>
</nav>
```

### 3. SSR-Safe Store Access
```typescript
import { getStores } from '$app/stores';

export function load() {
  const { page } = getStores();
  
  // Safe in SSR context
  const currentPage = page.subscribe(p => {
    console.log(p.url);
  });
  
  // Cleanup
  currentPage();
}
```

## $app/server

### 1. Server-Only Utilities
```typescript
// +page.server.ts
import { read } from '$app/server';

export async function load({ fetch }) {
  // Read static assets during SSR
  const file = await read('static/data.json');
  const data = file.body;
  
  return {
    data: JSON.parse(data)
  };
}
```

## $app/state

### 1. History State Management
```typescript
import { pushState, replaceState, preloadCode } from '$app/navigation';

// Push state to history
pushState('/modal', { showModal: true });

// Replace current state
replaceState('/updated', { updated: Date.now() });

// Access state in component
import { page } from '$app/stores';
$: modalOpen = $page.state.showModal;
```

## COMMON PATTERNS

### 1. Loading States
```svelte
<script>
  import { navigating } from '$app/stores';
  
  $: loading = !!$navigating;
</script>

{#if loading}
  <div class="spinner" />
{/if}
```

### 2. Protected Routes
```typescript
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

if (browser && !user) {
  goto('/login');
}
```

### 3. Query Parameter Sync
```svelte
<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  function updateFilter(key: string, value: string) {
    const url = new URL($page.url);
    url.searchParams.set(key, value);
    goto(url, { keepFocus: true, noScroll: true });
  }
</script>
```

### 4. Analytics Integration
```typescript
import { afterNavigate } from '$app/navigation';

afterNavigate(({ to }) => {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_ID', {
      page_path: to?.url.pathname
    });
  }
});
```

## ANTI-PATTERNS

### ❌ DON'T
```typescript
// Don't access window without browser check
const storage = window.localStorage; // ❌

// Don't use stores outside components
import { page } from '$app/stores';
const path = page.url.pathname; // ❌

// Don't navigate in load functions
export async function load() {
  goto('/other'); // ❌
}

// Don't mutate page store
$page.data.something = 'new'; // ❌
```

### ✅ DO
```typescript
// Check browser environment
import { browser } from '$app/environment';
if (browser) {
  const storage = window.localStorage; // ✅
}

// Subscribe to stores properly
import { page } from '$app/stores';
page.subscribe($p => {
  const path = $p.url.pathname; // ✅
});

// Return redirect from load
export async function load() {
  redirect(303, '/other'); // ✅
}

// Create derived state
import { derived } from 'svelte/store';
const customStore = derived(page, $p => $p.data); // ✅
```

## RULES

- Always check `browser` before accessing window/document
- Use `building` to skip code during build
- Use `dev` for development-only features
- Subscribe to stores, don't access directly
- Use navigation guards for unsaved changes
- Preload critical routes for performance
- Handle navigation errors gracefully
- Clean up store subscriptions
- Use proper TypeScript types
- Test SSR and CSR scenarios

## AUDIT COMMANDS

```bash
# Check for browser-only code
grep -r "window\." src/ --include="*.ts" | grep -v "if (browser"

# Find direct store access
grep -r "\$page\." src/ --include="*.ts"

# Check navigation patterns
grep -r "goto(" src/

# Find environment checks
grep -r "browser" src/ --include="*.svelte"
```