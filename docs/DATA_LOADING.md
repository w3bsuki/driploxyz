# DATA LOADING - SvelteKit Best Practices & Rules

**Reference**: https://svelte.dev/docs/kit/load

## STRICT RULES

### 1. Load Function Types
```typescript
// +page.ts - Runs on server & client
export async function load({ params, url, fetch }) {
  // Public data only
  return { posts: await fetch('/api/posts').then(r => r.json()) };
}

// +page.server.ts - Server ONLY
export async function load({ params, locals, cookies }) {
  // Sensitive data, DB queries
  return { user: await db.getUser(locals.userId) };
}
```

**NEVER put secrets in +page.ts**

### 2. Data Loading Priority
```
1. +layout.server.ts   # Runs first
2. +layout.ts          # Runs second
3. +page.server.ts     # Runs third
4. +page.ts            # Runs last
```

### 3. Parallel Loading Rules
```typescript
// ✅ CORRECT - Parallel
export async function load({ fetch }) {
  const [posts, users] = await Promise.all([
    fetch('/api/posts'),
    fetch('/api/users')
  ]);
  return {
    posts: await posts.json(),
    users: await users.json()
  };
}

// ❌ WRONG - Sequential (slow)
const posts = await fetch('/api/posts');
const users = await fetch('/api/users');
```

### 4. Invalidation Rules
```typescript
// Invalidate specific dependencies
import { invalidate } from '$app/navigation';
invalidate('data:posts');
invalidate('/api/posts');
invalidateAll(); // Nuclear option

// Depend on custom identifiers
export async function load({ depends }) {
  depends('data:posts');
  return { posts: await getPosts() };
}
```

### 5. Error Handling
```typescript
// ✅ CORRECT
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const post = await getPost(params.id);
  if (!post) {
    error(404, 'Post not found');
  }
  return { post };
}

// ❌ WRONG
throw new Error('Not found'); // Don't use regular errors
```

### 6. Streaming Rules
```typescript
// Stream for slow data
export async function load() {
  return {
    fast: await getFast(),
    slow: getSlowData() // No await - streams
  };
}
```

## ANTI-PATTERNS TO AVOID

### ❌ Never fetch in components
```svelte
<!-- WRONG -->
<script>
  onMount(async () => {
    const data = await fetch('/api/data');
  });
</script>
```

### ❌ Never mix server/client loads
```typescript
// WRONG - Don't have both in same route
// +page.ts
export async function load() { }
// +page.server.ts  
export async function load() { }
```

### ❌ Never expose sensitive data
```typescript
// WRONG in +page.ts
return {
  apiKey: process.env.SECRET_KEY // LEAKED!
};
```

## SUPABASE OPTIMIZATION

### 1. Batch Queries
```typescript
// ✅ GOOD - Single query
const { data } = await supabase
  .from('products')
  .select('*, profiles(*), categories(*)');

// ❌ BAD - Multiple queries
const products = await supabase.from('products').select();
const profiles = await supabase.from('profiles').select();
```

### 2. Select Only Needed
```typescript
// ✅ GOOD
.select('id, title, price')

// ❌ BAD
.select('*')
```

### 3. Use RLS
```typescript
// Server-side with service role
const supabase = createClient(url, SERVICE_KEY);

// Client-side with anon key
const supabase = createClient(url, ANON_KEY);
```

## COMMANDS TO AUDIT

```bash
# Find mixed load functions
find src/routes -name "+page.ts" -exec dirname {} \; | \
  xargs -I {} sh -c 'ls {}/+page.server.ts 2>/dev/null && echo "MIXED: {}"'

# Find components fetching data
grep -r "fetch(" src/routes --include="*.svelte"

# Check for sequential fetches
grep -A5 -B5 "await fetch" src/routes
```