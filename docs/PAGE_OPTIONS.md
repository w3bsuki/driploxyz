# PAGE OPTIONS - SvelteKit Rendering Strategies

**Reference**: https://svelte.dev/docs/kit/page-options

## RENDERING OPTIONS

### 1. SSR (Server-Side Rendering)
```typescript
// +page.ts or +page.server.ts
export const ssr = true; // Default

// When to use:
// - SEO-critical pages
// - Dynamic content
// - Initial page load performance
```

### 2. CSR (Client-Side Rendering)
```typescript
// +page.ts
export const csr = true; // Default

// Disable for static content:
export const csr = false;
```

### 3. Prerendering
```typescript
// +page.ts or +page.server.ts
export const prerender = true;

// Options:
export const prerender = 'auto'; // Try to prerender
export const prerender = false;   // Never prerender
```

### 4. Trailing Slashes
```typescript
// +page.ts
export const trailingSlash = 'always';  // /about/
export const trailingSlash = 'never';   // /about
export const trailingSlash = 'ignore';  // Both work
```

## ROUTE-SPECIFIC CONFIGURATIONS

### 1. Static Pages (Prerender)
```typescript
// src/routes/about/+page.ts
export const prerender = true;
export const ssr = true;
export const csr = false; // No hydration needed
```

### 2. Dynamic Pages (SSR)
```typescript
// src/routes/product/[id]/+page.ts
export const prerender = false;
export const ssr = true;
export const csr = true;
```

### 3. SPA Pages (CSR Only)
```typescript
// src/routes/dashboard/+page.ts
export const ssr = false;
export const csr = true;
export const prerender = false;
```

### 4. API Routes
```typescript
// src/routes/api/+server.ts
export const prerender = false; // APIs can't be prerendered
```

## OPTIMAL CONFIGURATIONS BY ROUTE TYPE

### Homepage
```typescript
// src/routes/+page.ts
export const prerender = 'auto';
export const ssr = true;
export const csr = true;
```

### Product Pages
```typescript
// src/routes/product/[id]/+page.ts
export const prerender = false; // Dynamic
export const ssr = true;        // SEO needed
export const csr = true;        // Interactivity
```

### Auth Pages
```typescript
// src/routes/(auth)/login/+page.ts
export const ssr = false; // No SEO needed
export const csr = true;
export const prerender = false;
```

### Admin Dashboard
```typescript
// src/routes/(admin)/+layout.ts
export const ssr = false; // Client-only
export const csr = true;
export const prerender = false;
```

### Legal Pages
```typescript
// src/routes/privacy/+page.ts
export const prerender = true;  // Static
export const ssr = true;
export const csr = false;       // No JS needed
```

## ENTRIES CONFIGURATION

```typescript
// +page.server.ts
export const entries = async () => {
  // For dynamic prerendering
  const products = await getProducts();
  return products.map(p => ({ id: p.id }));
};

// Generates:
// /product/1
// /product/2
// etc.
```

## PERFORMANCE PATTERNS

### 1. Hybrid Rendering
```typescript
// +layout.ts - Shell prerendered
export const prerender = true;
export const ssr = true;

// +page.ts - Content dynamic
export const prerender = false;
export const ssr = true;
```

### 2. Progressive Enhancement
```typescript
// Works without JavaScript
export const ssr = true;
export const csr = true; // Enhances when JS loads
```

### 3. Static Shell + Dynamic Content
```svelte
<!-- +page.svelte -->
<script>
  import { browser } from '$app/environment';
  
  let dynamicData = $state(null);
  
  if (browser) {
    // Load dynamic content client-side
    fetch('/api/data').then(r => r.json()).then(d => {
      dynamicData = d;
    });
  }
</script>

<!-- Static shell renders immediately -->
<div class="shell">
  {#if dynamicData}
    <!-- Dynamic content -->
  {:else}
    <div class="skeleton" />
  {/if}
</div>
```

## CACHING STRATEGIES

### 1. Prerendered Pages
```typescript
// Cached at build time
export const prerender = true;

// With ISR on Vercel
export const config = {
  isr: {
    expiration: 3600 // Revalidate hourly
  }
};
```

### 2. Dynamic Pages
```typescript
// +page.server.ts
export async function load({ setHeaders }) {
  setHeaders({
    'cache-control': 'public, max-age=300' // 5 min cache
  });
  
  return { data };
}
```

## DECISION MATRIX

| Page Type | prerender | ssr | csr | Why |
|-----------|-----------|-----|-----|-----|
| Homepage | auto | true | true | SEO + Dynamic |
| Product | false | true | true | Dynamic + SEO |
| Search | false | false | true | Client-side filtering |
| Legal | true | true | false | Static content |
| Dashboard | false | false | true | Auth required |
| API | false | N/A | N/A | Can't prerender |

## RULES

- ✅ Prerender static content
- ✅ SSR for SEO-critical pages
- ✅ CSR for interactive features
- ✅ Disable CSR for pure static pages
- ❌ Don't prerender user-specific content
- ❌ Don't SSR auth-protected pages
- ❌ Don't disable both SSR and prerender