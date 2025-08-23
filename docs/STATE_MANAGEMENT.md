# STATE MANAGEMENT - SvelteKit Best Practices & Rules

**Reference**: https://svelte.dev/docs/kit/state-management

## STRICT RULES

### 1. Svelte 5 Runes (ONLY USE THESE)
```typescript
// ✅ CORRECT - Svelte 5 Runes
let count = $state(0);
let doubled = $derived(count * 2);
let { prop } = $props();

// ❌ WRONG - Legacy (NEVER USE)
$: doubled = count * 2;  // FORBIDDEN
export let prop;         // FORBIDDEN
```

### 2. Store Patterns
```typescript
// stores/user.svelte.ts
function createUserStore() {
  let user = $state(null);
  
  return {
    get user() { return user; },
    login(data) { user = data; },
    logout() { user = null; }
  };
}

export const userStore = createUserStore();
```

### 3. Global State Rules
```typescript
// ✅ CORRECT - URL as state
goto(`/search?q=${query}`);

// ❌ WRONG - Global store for UI
export const searchQuery = writable('');
```

### 4. Context API
```svelte
<!-- Parent -->
<script>
  import { setContext } from 'svelte';
  setContext('user', userStore);
</script>

<!-- Child -->
<script>
  import { getContext } from 'svelte';
  const user = getContext('user');
</script>
```

### 5. Page Store Usage
```svelte
<script>
  import { page } from '$app/stores';
  
  // Reactive to URL changes
  $: currentPath = $page.url.pathname;
  $: searchParams = $page.url.searchParams;
</script>
```

### 6. Navigating Store
```svelte
<script>
  import { navigating } from '$app/stores';
</script>

{#if $navigating}
  <div class="loading">Loading...</div>
{/if}
```

## STATE LOCATION RULES

### URL State (Preferred)
```typescript
// Filters, search, pagination
/products?category=shirts&page=2

// Access in load function
export async function load({ url }) {
  const category = url.searchParams.get('category');
  const page = url.searchParams.get('page');
}
```

### Component State
```svelte
<script>
  // UI-only state
  let isOpen = $state(false);
  let selectedTab = $state('details');
</script>
```

### Store State (Minimize)
```typescript
// Only for cross-route persistence
// cart.svelte.ts
let items = $state([]);
```

## ANTI-PATTERNS TO AVOID

### ❌ Over-using stores
```typescript
// WRONG - Too many stores
export const modalStore = writable();
export const toastStore = writable();
export const themeStore = writable();
```

### ❌ Store subscriptions without cleanup
```typescript
// WRONG - Memory leak
onMount(() => {
  store.subscribe(value => {
    // No unsubscribe
  });
});
```

### ❌ Mutating $page store
```typescript
// WRONG - Never mutate
$page.data.something = 'new';
```

## SUPABASE REALTIME STATE

### 1. Subscription Pattern
```typescript
// +page.svelte
<script>
  import { onMount } from 'svelte';
  
  let messages = $state([]);
  
  onMount(() => {
    const subscription = supabase
      .channel('messages')
      .on('INSERT', payload => {
        messages = [...messages, payload.new];
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  });
</script>
```

### 2. Optimistic Updates
```typescript
// Update UI immediately
messages = [...messages, newMessage];

// Then sync with server
const { error } = await supabase
  .from('messages')
  .insert(newMessage);

if (error) {
  // Rollback on error
  messages = messages.filter(m => m.id !== newMessage.id);
}
```

## COMMANDS TO AUDIT

```bash
# Find legacy reactive statements
grep -r '\$:' src --include="*.svelte"

# Find export let (legacy props)
grep -r 'export let' src --include="*.svelte"

# Find writable stores
grep -r 'writable(' src

# Check for memory leaks
grep -r 'subscribe(' src | grep -v 'unsubscribe'
```