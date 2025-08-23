# ADVANCED ROUTING - Complex Route Patterns

**Reference**: https://svelte.dev/docs/kit/advanced-routing

## REST PARAMETERS

### 1. File System Routes
```
src/routes/
  [...path]/+page.svelte         # Matches any path
  blog/[...slug]/+page.svelte    # /blog/2024/my-post/part-1
  docs/[...file]/+page.svelte    # /docs/guide/intro.md
```

### 2. Implementation
```typescript
// src/routes/[org]/[repo]/tree/[branch]/[...file]/+page.ts
export async function load({ params }) {
  // params.org = 'sveltejs'
  // params.repo = 'kit'
  // params.branch = 'main'
  // params.file = 'docs/routing.md'
  
  const path = params.file || 'README.md';
  const content = await fetchFile(params.org, params.repo, path);
  
  return { content };
}
```

### 3. Zero-Length Matching
```typescript
// Routes: /blog/[...slug]
// Matches: /blog (slug = '')
// Matches: /blog/post (slug = 'post')
// Matches: /blog/2024/01/post (slug = '2024/01/post')

export async function load({ params }) {
  if (!params.slug) {
    // Show blog index
    return { posts: await getAllPosts() };
  }
  // Show specific post
  return { post: await getPost(params.slug) };
}
```

## OPTIONAL PARAMETERS

### 1. Language Routes
```
src/routes/
  [[lang]]/+layout.ts           # Optional language prefix
  [[lang]]/about/+page.svelte   # /about or /en/about
  [[lang]]/products/+page.svelte
```

### 2. Implementation
```typescript
// [[lang]]/+layout.ts
const languages = ['en', 'es', 'fr', 'de'];

export async function load({ params }) {
  const lang = params.lang || 'en';
  
  if (!languages.includes(lang)) {
    error(404, 'Language not supported');
  }
  
  return {
    lang,
    translations: await loadTranslations(lang)
  };
}
```

### 3. Multiple Optional
```
src/routes/
  products/[[category]]/[[subcategory]]/+page.svelte
  
# Matches:
# /products
# /products/clothing
# /products/clothing/shirts
```

## PARAMETER MATCHERS

### 1. Create Matchers
```typescript
// src/params/integer.ts
export function match(param: string): boolean {
  return /^\d+$/.test(param);
}

// src/params/uuid.ts
export function match(param: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param);
}

// src/params/slug.ts
export function match(param: string): boolean {
  return /^[a-z0-9-]+$/.test(param);
}
```

### 2. Use in Routes
```
src/routes/
  product/[id=integer]/+page.svelte      # Only matches numbers
  user/[id=uuid]/+page.svelte           # Only matches UUIDs
  blog/[slug=slug]/+page.svelte         # Only matches slugs
```

### 3. Complex Matchers
```typescript
// src/params/date.ts
export function match(param: string): boolean {
  // YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(param)) return false;
  
  // Validate actual date
  const date = new Date(param);
  return !isNaN(date.getTime());
}

// src/params/locale.ts
const SUPPORTED_LOCALES = ['en-US', 'en-GB', 'es-ES', 'fr-FR'];

export function match(param: string): boolean {
  return SUPPORTED_LOCALES.includes(param);
}
```

## ROUTE PRIORITY

### 1. Specificity Rules
```
More specific → Less specific:

1. /products/new             # Static segment
2. /products/[id=integer]    # Matcher
3. /products/[id]            # Dynamic
4. /products/[[id]]          # Optional
5. /products/[...path]       # Rest
```

### 2. Sorting Algorithm
```typescript
// SvelteKit sorts routes by:
// 1. Number of static segments (more = higher priority)
// 2. Parameter matchers (with matcher > without)
// 3. Dynamic segments (fewer = higher priority)
// 4. Rest parameters (lowest priority)
// 5. Alphabetical order (tiebreaker)

// Example priority:
routes = [
  '/admin/users',           // 1st - most specific
  '/admin/[id=uuid]',      // 2nd - has matcher
  '/admin/[id]',           // 3rd - dynamic
  '/[...catchall]'         // 4th - catch all
];
```

## ROUTE GROUPS

### 1. Layout Groups
```
src/routes/
  (app)/                    # Group - no URL impact
    +layout.svelte         # Shared layout
    dashboard/+page.svelte # /dashboard
    profile/+page.svelte   # /profile
  
  (marketing)/
    +layout.svelte         # Different layout
    +page.svelte          # /
    about/+page.svelte    # /about
```

### 2. Breaking Out of Layouts
```svelte
<!-- Use @ to reset to root layout -->
src/routes/
  (app)/
    +layout.svelte
    settings/
      +page@.svelte       # Uses root layout
      profile/
        +page@(app).svelte # Uses (app) layout
```

### 3. Multiple Groups
```
src/routes/
  (auth)/
    login/+page.svelte
    signup/+page.svelte
  
  (public)/
    [[lang]]/
      +layout.ts
      +page.svelte
  
  (admin)/
    +layout.server.ts     # Auth check
    dashboard/+page.svelte
```

## ENCODED CHARACTERS

### 1. Special Characters
```
# Encode : as [x+3a]
src/routes/
  [time=time]/+page.svelte  # Matches HH:MM format
  
# src/params/time.ts
export function match(param: string): boolean {
  return /^\d{2}:\d{2}$/.test(decodeURIComponent(param));
}
```

### 2. Hex Encoding Table
```
Character | Encoded
----------|----------
/         | [x+2f]
\         | [x+5c]
:         | [x+3a]
*         | [x+2a]
?         | [x+3f]
"         | [x+22]
<         | [x+3c]
>         | [x+3e]
|         | [x+7c]
```

## COMPLEX PATTERNS

### 1. Multi-tenant Routes
```typescript
// src/routes/[tenant]/[...path]/+layout.server.ts
export async function load({ params, locals }) {
  const tenant = await getTenant(params.tenant);
  
  if (!tenant) {
    error(404, 'Tenant not found');
  }
  
  // Set tenant context
  locals.tenant = tenant;
  
  return { tenant };
}
```

### 2. Version-based API
```
src/routes/
  api/
    v1/[...endpoint]/+server.ts
    v2/[...endpoint]/+server.ts
    
# Handles:
# /api/v1/users
# /api/v2/users/profile
```

### 3. Dynamic Nesting
```typescript
// src/routes/[...segments]/+page.server.ts
export async function load({ params }) {
  const segments = params.segments.split('/');
  
  // Build breadcrumbs
  const breadcrumbs = segments.map((seg, i) => ({
    name: seg,
    href: '/' + segments.slice(0, i + 1).join('/')
  }));
  
  return { breadcrumbs };
}
```

## COMMON MISTAKES

### ❌ DON'T
```
# Optional after rest
/[...path]/[[optional]]  # Invalid

# Multiple rest parameters
/[...path]/[...more]     # Invalid

# Nested optional
/[[outer]]/[[inner]]      # Confusing

# Too many matchers
/[a=x]/[b=y]/[c=z]/[d=w] # Over-engineered
```

### ✅ DO
```
# Clear hierarchy
/products/[category]/[id]

# Sensible matchers
/user/[id=uuid]

# Logical groups
/(app)/dashboard
/(marketing)/landing

# Simple patterns
/blog/[slug]
```

## PERFORMANCE TIPS

### 1. Minimize Matchers
```typescript
// Fast - simple regex
export function match(param: string): boolean {
  return /^\d+$/.test(param);
}

// Slow - complex validation
export function match(param: string): boolean {
  // Avoid database calls in matchers!
  return checkDatabase(param); // ❌
}
```

### 2. Route Caching
```typescript
// Cache route data
const routeCache = new Map();

export async function load({ params }) {
  const key = `${params.category}/${params.id}`;
  
  if (routeCache.has(key)) {
    return routeCache.get(key);
  }
  
  const data = await fetchData(params);
  routeCache.set(key, data);
  
  return data;
}
```

## TESTING ROUTES

```typescript
// Test matchers
import { match } from './src/params/integer.js';

test('integer matcher', () => {
  expect(match('123')).toBe(true);
  expect(match('abc')).toBe(false);
  expect(match('12.3')).toBe(false);
});

// Test route priority
test('route sorting', () => {
  const routes = sortRoutes([
    '/[...path]',
    '/products/[id]',
    '/products/new'
  ]);
  
  expect(routes[0]).toBe('/products/new');
});
```

## AUDIT COMMANDS

```bash
# List all routes
find src/routes -name "+page.svelte" | sort

# Check for route conflicts
# Look for similar patterns that might conflict

# Test route matching
curl http://localhost:5173/test-path
# Check which route handles it
```