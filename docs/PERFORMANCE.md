# PERFORMANCE - SvelteKit Best Practices & Rules

**Reference**: https://svelte.dev/docs/kit/performance

## STRICT RULES

### 1. Bundle Size Optimization
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['svelte', '@sveltejs/kit'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    },
    target: 'es2020',
    minify: 'terser'
  }
};
```

**Target:** < 200KB initial JavaScript

### 2. Preloading & Prefetching
```svelte
<!-- Preload on hover (default) -->
<a href="/about">About</a>

<!-- Preload immediately -->
<a href="/important" data-sveltekit-preload-data="eager">Important</a>

<!-- Preload code only -->
<a href="/heavy" data-sveltekit-preload-code="viewport">Heavy Page</a>

<!-- No preload -->
<a href="/external" data-sveltekit-preload-data="off">External</a>
```

### 3. Image Optimization
```svelte
<!-- ✅ CORRECT - Lazy loading -->
<img src="/image.jpg" loading="lazy" decoding="async" alt="Description">

<!-- ✅ CORRECT - Responsive images -->
<picture>
  <source srcset="/image.webp" type="image/webp">
  <source srcset="/image.jpg" type="image/jpeg">
  <img src="/image.jpg" alt="Description">
</picture>

<!-- ❌ WRONG - No optimization -->
<img src="/huge-image.png">
```

### 4. Code Splitting
```typescript
// ✅ CORRECT - Dynamic imports
const { Component } = await import('$lib/heavy-component');

// ❌ WRONG - Static import of heavy component
import HeavyComponent from '$lib/heavy-component';
```

### 5. Data Loading Optimization
```typescript
// ✅ CORRECT - Parallel loading
export async function load({ fetch }) {
  const [products, categories] = await Promise.all([
    fetch('/api/products'),
    fetch('/api/categories')
  ]);
  
  return {
    products: products.json(),
    categories: categories.json()
  };
}

// ❌ WRONG - Sequential
const products = await fetch('/api/products');
const categories = await fetch('/api/categories');
```

### 6. Caching Strategies
```typescript
// +page.server.ts
export async function load({ setHeaders }) {
  setHeaders({
    'cache-control': 'public, max-age=3600', // 1 hour
    'etag': '"v1.2.3"'
  });
  
  return { data };
}
```

## SUPABASE PERFORMANCE

### 1. Query Optimization
```typescript
// ✅ GOOD - Select only needed columns
const { data } = await supabase
  .from('products')
  .select('id, title, price, image_url')
  .limit(20);

// ❌ BAD - Select everything
const { data } = await supabase
  .from('products')
  .select('*');
```

### 2. Pagination
```typescript
// ✅ CORRECT - Use range
const { data } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .range(0, 9); // Get 10 items

// ❌ WRONG - Get all then slice
const all = await supabase.from('products').select('*');
const page = all.slice(0, 10);
```

### 3. Reduce Data Egress
```typescript
// ✅ GOOD - Cache in memory
let cachedProducts = null;
let cacheTime = 0;

export async function load() {
  if (Date.now() - cacheTime < 60000) {
    return { products: cachedProducts };
  }
  
  const { data } = await supabase
    .from('products')
    .select('id, title, price');
  
  cachedProducts = data;
  cacheTime = Date.now();
  
  return { products: data };
}
```

## CORE WEB VITALS

### 1. Largest Contentful Paint (LCP)
**Target:** < 2.5s

```svelte
<!-- Preload hero image -->
<link rel="preload" as="image" href="/hero.jpg">

<!-- Priority hints -->
<img src="/hero.jpg" fetchpriority="high" alt="Hero">
```

### 2. First Input Delay (FID)
**Target:** < 100ms

```typescript
// ✅ GOOD - Non-blocking
requestIdleCallback(() => {
  // Heavy computation
});

// ❌ BAD - Blocks main thread
for (let i = 0; i < 1000000; i++) {
  // Heavy computation
}
```

### 3. Cumulative Layout Shift (CLS)
**Target:** < 0.1

```css
/* ✅ GOOD - Reserve space */
.image-container {
  aspect-ratio: 16 / 9;
}

/* ❌ BAD - No dimensions */
img {
  /* No width/height */
}
```

## MONITORING

### 1. Performance Observer
```typescript
// app.html
if ('PerformanceObserver' in window) {
  // Monitor LCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    // Send to analytics
    analytics.track('LCP', {
      value: lastEntry.renderTime || lastEntry.loadTime
    });
  }).observe({ type: 'largest-contentful-paint', buffered: true });
}
```

### 2. Build Analysis
```bash
# Analyze bundle size
pnpm build
pnpm analyze

# Check for large dependencies
npx vite-bundle-visualizer
```

## CHECKLIST

- [ ] Initial JS < 200KB
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Images lazy loaded
- [ ] Critical CSS inlined
- [ ] Fonts preloaded
- [ ] Code split by route
- [ ] API responses < 1s
- [ ] Supabase queries optimized

## COMMANDS TO AUDIT

```bash
# Check bundle size
du -sh .svelte-kit/output/client/_app/

# Find large images
find static -type f -size +100k

# Check for missing lazy loading
grep -r '<img' src --include="*.svelte" | grep -v 'loading='

# Find sequential fetches
grep -B2 -A2 'await.*fetch' src/routes
```