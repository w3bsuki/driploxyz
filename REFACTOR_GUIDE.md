# 🔧 PRODUCTION REFACTOR GUIDE

*A strict, no-nonsense guide to fixing our codebase based on official Svelte 5/SvelteKit 2 best practices*

## 🎯 CORE PRINCIPLES

1. **No Over-Engineering** - If it works and follows best practices, don't touch it
2. **Test Every Change** - Break one thing at a time, fix it, then move on
3. **Mobile-First Always** - 375px viewport, 44px touch targets
4. **Performance First** - Every refactor must improve or maintain performance

## ✅ SVELTE 5 DOS

### State Management
```svelte
<!-- ✅ DO: Use $state for reactive values -->
let count = $state(0);
let user = $state({ name: 'Alice' });

<!-- ✅ DO: Use $derived for computed values -->
const doubled = $derived(count * 2);
const fullName = $derived(`${user.firstName} ${user.lastName}`);

<!-- ✅ DO: Use $effect for side effects with cleanup -->
$effect(() => {
  const timer = setInterval(() => count++, 1000);
  return () => clearInterval(timer);
});

<!-- ✅ DO: Use $state.raw for large arrays/objects -->
let largeList = $state.raw(items); // Only reactive on reassignment
largeList = [...largeList, newItem]; // Triggers update
```

### Component Props
```svelte
<!-- ✅ DO: Type your props interface -->
<script lang="ts">
interface Props {
  product: Product;
  variant?: 'card' | 'list';
}

let { product, variant = 'card' }: Props = $props();
</script>
```

### Events
```svelte
<!-- ✅ DO: Use onclick not on:click -->
<button onclick={handleClick}>Click me</button>

<!-- ✅ DO: Use callback props for component events -->
<!-- Child.svelte -->
let { onMessage }: { onMessage: (text: string) => void } = $props();
<button onclick={() => onMessage('Hello')}>Send</button>

<!-- Parent.svelte -->
<Child onMessage={(text) => console.log(text)} />
```

### Global State (.svelte.js files)
```js
// ✅ DO: Export functions, not state directly
// store.svelte.js
let count = $state(0);

export function getCount() {
  return count;
}

export function increment() {
  count++;
}

// ✅ DO: Use getters for reactive exports
export const store = {
  get count() { return count },
  increment: () => count++
};
```

## ❌ SVELTE 5 DON'TS

### State Management
```svelte
<!-- ❌ DON'T: Use old Svelte 4 syntax -->
let count = 0;
$: doubled = count * 2;

<!-- ❌ DON'T: Export state directly -->
export let count = $state(0); // Loses reactivity

<!-- ❌ DON'T: Create circular dependencies -->
const a = $derived(b + 1);
const b = $derived(a - 1); // Infinite loop!

<!-- ❌ DON'T: Mutate in $derived -->
const sorted = $derived(items.sort()); // Mutates original!
<!-- Use: -->
const sorted = $derived([...items].sort());

<!-- ❌ DON'T: Side effects in $derived -->
const data = $derived(fetch('/api')); // Use $effect instead
```

## ✅ SVELTEKIT 2 DOS

### Data Loading
```js
// ✅ DO: Use parallel fetching to avoid waterfalls
export async function load({ fetch }) {
  const [user, products] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/products').then(r => r.json())
  ]);
  
  return { user, products };
}

// ✅ DO: Stream slow data that's not critical
export function load({ fetch }) {
  return {
    critical: await fetch('/api/critical').then(r => r.json()),
    // This will stream and won't block render
    optional: fetch('/api/slow-data').then(r => r.json())
  };
}

// ✅ DO: Use +page.server.js for private operations
// +page.server.js
export async function load({ locals }) {
  // Direct DB access, private keys OK here
  const data = await db.query('SELECT * FROM users');
  return { users: data };
}

// ✅ DO: Use invalidateAll() wisely
import { invalidateAll } from '$app/navigation';
// Only when you need to refetch ALL load functions
```

### Error Handling
```js
// ✅ DO: Handle errors in load functions
export async function load({ fetch }) {
  try {
    const data = await fetch('/api').then(r => {
      if (!r.ok) throw new Error('Failed');
      return r.json();
    });
    return { data };
  } catch (error) {
    return { 
      data: null, 
      error: 'Failed to load data' 
    };
  }
}
```

## ❌ SVELTEKIT 2 DON'TS

### Data Loading
```js
// ❌ DON'T: Create waterfalls
export async function load({ fetch }) {
  const user = await fetch('/api/user').then(r => r.json());
  // This waits for user to complete first!
  const items = await fetch(`/api/items/${user.id}`).then(r => r.json());
  return { user, items };
}

// ❌ DON'T: Use load functions for non-data operations
export async function load() {
  // Don't do this in load!
  document.title = 'My Page'; 
  return {};
}

// ❌ DON'T: Fetch same data in multiple load functions
// Instead, fetch once in layout and pass down

// ❌ DON'T: Return non-serializable data from server load
// +page.server.js
export async function load() {
  return {
    date: new Date(), // ✅ OK - serializable
    map: new Map(), // ✅ OK - devalue handles it
    fn: () => {}, // ❌ NOT OK - functions can't serialize
    class: MyClass // ❌ NOT OK - class instances can't serialize
  };
}
```

## 🚀 REFACTOR CHECKLIST

### Per-Page Refactor Process
1. [ ] **Identify Issues**
   - Check DevTools Network tab for duplicate/infinite requests
   - Check for waterfalls in data loading
   - Measure LCP, identify bottlenecks

2. [ ] **Fix State Management**
   - Convert `let` to `$state()`
   - Convert `$:` to `$derived()`
   - Convert `on:event` to `onevent`
   - Check for state export issues

3. [ ] **Fix Data Loading**
   - Move private operations to `+page.server.js`
   - Parallelize fetches with `Promise.all()`
   - Stream non-critical data
   - Remove duplicate fetches

4. [ ] **Fix Components**
   - Convert to `$props()` syntax
   - Replace slots with snippets
   - Update event handlers
   - Type all props

5. [ ] **Test & Measure**
   - Run `pnpm check-types`
   - Test at 375px viewport
   - Measure performance change
   - Check for regressions

## 🔍 COMMON ISSUES & FIXES

### Issue: Infinite Fetching Loop
```js
// ❌ PROBLEM: Reactive statement triggers fetch
$: if (someValue) {
  fetchData();
}

// ✅ SOLUTION: Use $effect with proper dependencies
$effect(() => {
  if (someValue) {
    fetchData();
  }
});
```

### Issue: Slow Initial Load
```js
// ❌ PROBLEM: Sequential data loading
const a = await fetchA();
const b = await fetchB();
const c = await fetchC();

// ✅ SOLUTION: Parallel loading
const [a, b, c] = await Promise.all([
  fetchA(),
  fetchB(), 
  fetchC()
]);
```

### Issue: Memory Leaks
```js
// ❌ PROBLEM: No cleanup
$effect(() => {
  const interval = setInterval(update, 1000);
  // Missing cleanup!
});

// ✅ SOLUTION: Return cleanup function
$effect(() => {
  const interval = setInterval(update, 1000);
  return () => clearInterval(interval);
});
```

### Issue: Over-Reactive Updates
```js
// ❌ PROBLEM: Everything is deeply reactive
let hugeArray = $state(data);

// ✅ SOLUTION: Use $state.raw for large collections
let hugeArray = $state.raw(data);
// Update by reassignment
hugeArray = [...hugeArray, newItem];
```

## 📋 REFACTOR ORDER

1. **Start with leaf components** (no children)
2. **Then container components** 
3. **Then pages**
4. **Finally layouts**

This prevents breaking parent components while refactoring children.

## ⚠️ DANGER ZONES

**NEVER:**
- Refactor everything at once
- Skip type checking
- Ignore mobile testing
- Mix Svelte 4 and 5 syntax in same component
- Deploy without testing critical paths

**ALWAYS:**
- Test one change at a time
- Keep old code commented until new code works
- Run full test suite after each major change
- Check performance metrics before/after

## 🔄 GRADUAL MIGRATION

For components that can't be fully migrated:
1. Mark with `// TODO: Migrate to Svelte 5`
2. Document why it can't be migrated yet
3. Create issue for tracking
4. Move on - don't get stuck

## 📈 SUCCESS METRICS

After refactoring each page:
- [ ] 0 TypeScript errors
- [ ] No infinite loops/fetches
- [ ] LCP <2s on mobile
- [ ] No duplicate API calls
- [ ] All touch targets ≥44px
- [ ] Load functions use parallel fetching

## 🔐 SUPABASE SSR BEST PRACTICES

### Authentication Setup
```js
// ✅ DO: Use @supabase/ssr package, NOT auth-helpers
npm install @supabase/ssr @supabase/supabase-js

// ✅ DO: Create server client in hooks.server.ts
// hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return event.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // CRITICAL: Must set path: '/' for SvelteKit
        cookiesToSet.forEach(({ name, value, options }) =>
          event.cookies.set(name, value, { ...options, path: '/' })
        )
      },
    },
  })

  // ✅ DO: Use safeGetSession with getUser validation
  event.locals.safeGetSession = async () => {
    const { data: { user }, error } = await event.locals.supabase.auth.getUser()
    if (error) return { session: null, user: null }
    
    const { data: { session } } = await event.locals.supabase.auth.getSession()
    return { session, user }
  }
}
```

### Session Validation
```js
// ❌ DON'T: Trust getSession() for security
const { data: { session } } = await supabase.auth.getSession()
// Session can be spoofed!

// ✅ DO: Always use getUser() for protected routes
const { data: { user }, error } = await supabase.auth.getUser()
if (!user) {
  throw redirect(303, '/login')
}
```

### Client Creation Strategy
```js
// ✅ DO: Different clients for different contexts
// +layout.server.ts (Server-side)
export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session, user } = await safeGetSession()
  return { session, user }
}

// +layout.ts (Client-side)
export const load: LayoutLoad = async ({ data, depends }) => {
  depends('supabase:auth')
  
  const supabase = isBrowser()
    ? createBrowserClient(url, key, { global: { fetch } })
    : createServerClient(url, key, { 
        global: { fetch },
        cookies: { getAll: () => data.cookies }
      })
  
  return { supabase, session: data.session }
}
```

### Data Fetching with RLS
```js
// ✅ DO: Let RLS handle authorization
// +page.server.ts
export async function load({ locals }) {
  // User's session automatically sent with request
  const { data, error } = await locals.supabase
    .from('profiles')
    .select('*')
    .single()
  
  if (error) {
    // Handle gracefully - user might not have profile yet
    return { profile: null }
  }
  
  return { profile: data }
}

// ❌ DON'T: Manually filter by user ID (let RLS do it)
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id) // Unnecessary with proper RLS
```

### Realtime & SSR
```js
// ✅ DO: Set up realtime subscriptions client-side only
// +page.svelte
onMount(() => {
  const channel = supabase.channel('changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'products' 
    }, handleChange)
    .subscribe()
  
  return () => supabase.removeChannel(channel)
})

// ❌ DON'T: Try to set up realtime in load functions
```

### Cookie Configuration
```js
// ✅ DO: Set cookies with far future expiry
// Let Supabase Auth control token validity
cookies.set(name, value, {
  ...options,
  path: '/',
  maxAge: 100 * 365 * 24 * 60 * 60 // Very far future
})

// ❌ DON'T: Set short cookie expiry times
```

### Error Handling
```js
// ✅ DO: Handle auth errors gracefully
export async function load({ locals }) {
  const { user } = await locals.safeGetSession()
  
  if (!user) {
    // Return empty state, don't throw
    return { 
      products: [],
      isAuthenticated: false 
    }
  }
  
  const { data, error } = await locals.supabase
    .from('products')
    .select('*')
  
  if (error) {
    console.error('Failed to fetch products:', error)
    return { 
      products: [],
      error: 'Failed to load products' 
    }
  }
  
  return { products: data, isAuthenticated: true }
}
```

### SUPABASE SSR DON'TS
```js
// ❌ DON'T: Use auth-helpers (deprecated)
import { createClient } from '@supabase/auth-helpers-sveltekit'

// ❌ DON'T: Store tokens in localStorage for SSR
localStorage.setItem('token', session.access_token)

// ❌ DON'T: Create new clients on every request
// Cache and reuse clients where possible

// ❌ DON'T: Expose service role key to client
PUBLIC_SUPABASE_SERVICE_ROLE // NEVER expose this

// ❌ DON'T: Skip session validation on protected routes
// Always validate with getUser()

// ❌ DON'T: Make database queries from client components
// Use server load functions for data fetching
```

---

**Remember:** The goal is a working, fast production app, not perfect code. If it works and follows these practices, ship it.