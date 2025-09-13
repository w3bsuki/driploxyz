# Performance Optimization Guide

**Target: LCP ≤ 1.5s on mobile** - Complete performance guide for Svelte 5 + SvelteKit 2 applications.

## Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: ≤ 1.5s mobile, ≤ 1.0s desktop
- **CLS (Cumulative Layout Shift)**: ≤ 0.1
- **FCP (First Contentful Paint)**: ≤ 1.0s mobile, ≤ 0.8s desktop
- **FID (First Input Delay)**: ≤ 100ms
- **Bundle Size**: ≤ 200KB gzipped for initial load

## 1. Reactive State Optimization

### Use `$state.raw` for Static Data
```svelte
<script lang="ts">
  // ❌ SLOW: Unnecessary deep reactivity
  let config = $state({
    api: { baseUrl: '/api', version: 'v1' },
    features: { /* 100+ feature flags */ },
    constants: { /* large static config */ }
  })

  // ✅ FAST: No reactivity overhead for static data
  let config = $state.raw({
    api: { baseUrl: '/api', version: 'v1' },
    features: { /* 100+ feature flags */ },
    constants: { /* large static config */ }
  })

  // ✅ FAST: Reactive only when needed
  let userPreferences = $state({ theme: 'dark', lang: 'en' })
  let isLoading = $state(false)
</script>
```

### Optimize Derived Computations
```svelte
<script lang="ts">
  let products = $state<Product[]>([])
  let searchQuery = $state('')
  let selectedCategory = $state<string | null>(null)

  // ✅ FAST: Efficient filtering with proper dependencies
  let filteredProducts = $derived(() => {
    // Early return for empty state
    if (products.length === 0) return []

    let result = products

    // Apply filters in order of selectivity
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory)
    }

    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      )
    }

    return result
  })

  // ❌ SLOW: Recreating objects in template
  // {#each products.filter(p => p.category === selectedCategory) as product}

  // ✅ FAST: Use derived state
  // {#each filteredProducts as product}
</script>
```

### Batch State Updates
```svelte
<script lang="ts">
  let users = $state<User[]>([])
  let isLoading = $state(false)
  let error = $state<string | null>(null)

  async function loadUsers() {
    // ✅ FAST: Batch state updates
    $effect.root(() => {
      isLoading = true
      error = null
    })

    try {
      const response = await fetch('/api/users')
      const userData = await response.json()

      // ✅ Batch update in single microtask
      users = userData
      isLoading = false
    } catch (err) {
      error = err.message
      isLoading = false
    }
  }

  // ❌ SLOW: Multiple reactive updates
  // isLoading = true  // Trigger 1
  // error = null      // Trigger 2
  // users = newData   // Trigger 3
  // isLoading = false // Trigger 4
</script>
```

## 2. Component Performance

### Lazy Loading & Code Splitting
```ts
// ✅ FAST: Dynamic imports for large components
const HeavyChart = lazy(() => import('$lib/components/HeavyChart.svelte'))
const DataTable = lazy(() => import('$lib/components/DataTable.svelte'))
const VideoPlayer = lazy(() => import('$lib/components/VideoPlayer.svelte'))

// ✅ Route-level code splitting (automatic with SvelteKit)
// Each route loads only its required code
```

```svelte
<!-- ✅ FAST: Conditional loading -->
<script lang="ts">
  let showChart = $state(false)
  const ChartComponent = lazy(() => import('./Chart.svelte'))
</script>

{#if showChart}
  <ChartComponent />
{/if}

<button onclick={() => showChart = !showChart}>
  Toggle Chart
</button>
```

### Optimize Large Lists
```svelte
<script lang="ts">
  let items = $state<Item[]>([]) // 1000+ items
  let visibleRange = $state({ start: 0, end: 20 })

  // ✅ FAST: Virtual scrolling for large lists
  let visibleItems = $derived(
    items.slice(visibleRange.start, visibleRange.end)
  )

  function handleScroll(event: Event) {
    const target = event.target as HTMLElement
    const itemHeight = 60
    const containerHeight = target.clientHeight
    const scrollTop = target.scrollTop

    const start = Math.floor(scrollTop / itemHeight)
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2

    visibleRange = {
      start: Math.max(0, start - 1),
      end: Math.min(items.length, start + visibleCount)
    }
  }
</script>

<div class="scroll-container" onscroll={handleScroll}>
  <!-- ✅ FAST: Only render visible items -->
  {#each visibleItems as item (item.id)}
    <div class="item">
      {item.title}
    </div>
  {/each}
</div>

<!-- ❌ SLOW: Rendering all 1000+ items -->
<!-- {#each items as item} -->
```

### Efficient Event Handlers
```svelte
<script lang="ts">
  let selectedItems = $state<Set<string>>(new Set())

  // ✅ FAST: Event delegation for lists
  function handleListClick(event: MouseEvent) {
    const target = event.target as HTMLElement
    const button = target.closest('[data-item-id]')

    if (button) {
      const itemId = button.getAttribute('data-item-id')!
      toggleSelection(itemId)
    }
  }

  function toggleSelection(itemId: string) {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId)
    } else {
      newSelection.add(itemId)
    }
    selectedItems = newSelection
  }
</script>

<!-- ✅ FAST: Single event listener for entire list -->
<div class="item-list" onclick={handleListClick}>
  {#each items as item}
    <button data-item-id={item.id} class="item">
      {item.title}
    </button>
  {/each}
</div>

<!-- ❌ SLOW: Individual event listeners -->
<!-- {#each items as item}
  <button onclick={() => toggleSelection(item.id)}>
    {item.title}
  </button>
{/each} -->
```

## 3. SSR & Preloading Optimization

### Efficient Load Functions
```ts
// ✅ FAST: Parallel data loading
export const load = (async ({ fetch, params, depends }) => {
  depends('app:product')

  // ✅ Load critical data in parallel
  const [product, reviews, relatedProducts] = await Promise.all([
    fetch(`/api/products/${params.id}`).then(r => r.json()),
    fetch(`/api/products/${params.id}/reviews`).then(r => r.json()),
    fetch(`/api/products/${params.id}/related`).then(r => r.json())
  ])

  return {
    product,
    reviews: reviews.slice(0, 5), // ✅ Limit initial data
    relatedProducts: relatedProducts.slice(0, 4),
    // ✅ Stream heavy data
    moreReviews: getMoreReviews(params.id), // Returns Promise
    analytics: getAnalytics(params.id)      // Returns Promise
  }
}) satisfies PageServerLoad

// ❌ SLOW: Sequential loading
// const product = await getProduct(params.id)
// const reviews = await getReviews(params.id)
// const related = await getRelated(params.id)
```

### Smart Preloading
```svelte
<!-- ✅ FAST: Preload on hover -->
<a
  href="/product/{product.id}"
  data-sveltekit-preload-data="hover"
  data-sveltekit-preload-code="hover"
>
  {product.title}
</a>

<!-- ✅ FAST: Preload critical routes -->
<a
  href="/checkout"
  data-sveltekit-preload-data="tap"
>
  Proceed to Checkout
</a>

<!-- ✅ FAST: Disable preload for heavy pages -->
<a
  href="/heavy-dashboard"
  data-sveltekit-preload-data="off"
>
  Dashboard
</a>
```

### Streaming Data
```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data }: { data: PageData } = $props()
</script>

<!-- ✅ Show critical content immediately -->
<h1>{data.product.title}</h1>
<img src={data.product.image} alt={data.product.title} />
<p>{data.product.price}</p>

<!-- ✅ Stream non-critical data -->
{#await data.moreReviews}
  <div class="skeleton-reviews">Loading reviews...</div>
{:then reviews}
  <div class="reviews">
    {#each reviews as review}
      <div class="review">{review.text}</div>
    {/each}
  </div>
{/await}

{#await data.analytics then analytics}
  <div class="analytics">
    <p>Views: {analytics.views}</p>
    <p>Rating: {analytics.rating}</p>
  </div>
{/await}
```

## 4. Bundle Optimization

### Tree Shaking & Imports
```ts
// ✅ FAST: Named imports for tree shaking
import { writable } from 'svelte/store'
import { z } from 'zod'
import { format } from 'date-fns'

// ❌ SLOW: Imports entire library
// import * as zod from 'zod'
// import * as dateFns from 'date-fns'
// import _ from 'lodash'

// ✅ FAST: Specific utility functions
import { debounce } from '$lib/utils/debounce'
import { formatCurrency } from '$lib/utils/currency'

// ✅ FAST: Dynamic imports for heavy libraries
async function loadChartLibrary() {
  const { Chart } = await import('chart.js/auto')
  return Chart
}
```

### Vendor Chunk Optimization
```ts
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // ✅ Separate stable vendor libraries
          vendor: ['svelte'],
          utils: ['zod', 'date-fns'],
          ui: ['@floating-ui/dom'],
          // ✅ Heavy libraries in separate chunks
          charts: ['chart.js'],
          editor: ['@tiptap/core']
        }
      }
    }
  }
}
```

### Asset Optimization
```svelte
<script lang="ts">
  import { browser } from '$app/environment'

  // ✅ FAST: Lazy load images
  let imageRef: HTMLImageElement
  let isVisible = $state(false)

  $effect(() => {
    if (browser && imageRef) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isVisible = true
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )

      observer.observe(imageRef)
      return () => observer.disconnect()
    }
  })
</script>

<!-- ✅ FAST: Optimized images with lazy loading -->
<img
  bind:this={imageRef}
  src={isVisible ? product.image : ''}
  alt={product.title}
  loading="lazy"
  width={300}
  height={200}
  class="product-image"
/>

<!-- ✅ FAST: WebP with fallback -->
<picture>
  <source srcset={product.imageWebp} type="image/webp" />
  <img src={product.imageJpeg} alt={product.title} />
</picture>
```

## 5. Database & API Performance

### Query Optimization
```ts
// ✅ FAST: Efficient database queries
export const load = (async ({ locals, params }) => {
  const { user } = await locals.safeGetSession()

  // ✅ Single query with joins
  const { data: product } = await locals.supabase
    .from('products')
    .select(`
      id,
      title,
      price,
      description,
      image_url,
      seller:profiles(id, username, avatar_url),
      category:categories(name, slug),
      images:product_images(image_url, sort_order)
    `)
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  // ✅ Count query only when needed
  const reviewsCount = user ? await getReviewsCount(params.id) : 0

  return { product, reviewsCount }

  // ❌ SLOW: Multiple round-trip queries
  // const product = await getProduct(params.id)
  // const seller = await getUser(product.seller_id)
  // const category = await getCategory(product.category_id)
  // const images = await getProductImages(product.id)
}) satisfies PageServerLoad
```

### Caching Strategy
```ts
// lib/server/cache.ts
const cache = new Map<string, { data: any; expires: number }>()

export function cached<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const entry = cache.get(key)

  if (entry && Date.now() < entry.expires) {
    return Promise.resolve(entry.data)
  }

  return fn().then(data => {
    cache.set(key, {
      data,
      expires: Date.now() + ttl
    })
    return data
  })
}

// Usage
export const load = (async ({ params }) => {
  // ✅ Cache expensive operations
  const featuredProducts = await cached(
    'featured-products',
    5 * 60 * 1000, // 5 minutes
    () => getFeaturedProducts()
  )

  const categories = await cached(
    'categories',
    60 * 60 * 1000, // 1 hour
    () => getCategories()
  )

  return { featuredProducts, categories }
}) satisfies PageServerLoad
```

### API Response Optimization
```ts
// ✅ FAST: Paginated responses
export const GET: RequestHandler = async ({ url, locals }) => {
  const page = Number(url.searchParams.get('page')) || 1
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100)
  const offset = (page - 1) * limit

  const { data: products, count } = await locals.supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  return json({
    products,
    pagination: {
      page,
      limit,
      total: count,
      hasMore: offset + limit < count
    }
  })
}

// ✅ FAST: Field selection
export const GET: RequestHandler = async ({ url }) => {
  const fields = url.searchParams.get('fields') || 'id,title,price'

  const { data } = await supabase
    .from('products')
    .select(fields)
    .limit(50)

  return json({ products: data })
}
```

## 6. Runtime Performance

### Efficient DOM Updates
```svelte
<script lang="ts">
  let items = $state<Item[]>([])

  // ✅ FAST: Keyed each blocks
  // Svelte can efficiently update the DOM
</script>

{#each items as item (item.id)}
  <div class="item">
    <h3>{item.title}</h3>
    <p>{item.description}</p>
  </div>
{/each}

<!-- ❌ SLOW: Non-keyed each blocks -->
<!-- {#each items as item} -->
```

### Debounced Search
```svelte
<script lang="ts">
  import { debounce } from '$lib/utils/debounce'

  let searchQuery = $state('')
  let searchResults = $state<Product[]>([])
  let isSearching = $state(false)

  // ✅ FAST: Debounced search
  const debouncedSearch = debounce(async (query: string) => {
    if (query.length < 2) {
      searchResults = []
      return
    }

    isSearching = true
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      searchResults = await response.json()
    } finally {
      isSearching = false
    }
  }, 300)

  $effect(() => {
    debouncedSearch(searchQuery)
  })
</script>

<input
  bind:value={searchQuery}
  placeholder="Search products..."
  type="search"
/>

{#if isSearching}
  <p>Searching...</p>
{:else}
  {#each searchResults as product}
    <div class="result">{product.title}</div>
  {/each}
{/if}
```

### Memory Management
```svelte
<script lang="ts">
  let intervalId: number | null = null
  let observerRef: IntersectionObserver | null = null

  // ✅ FAST: Cleanup resources
  $effect(() => {
    // Setup
    intervalId = setInterval(() => {
      // Update logic
    }, 1000)

    observerRef = new IntersectionObserver(
      (entries) => {
        // Observer logic
      }
    )

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
      if (observerRef) {
        observerRef.disconnect()
      }
    }
  })
</script>
```

## Performance Monitoring

### Core Web Vitals Tracking
```ts
// lib/performance.ts
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
    headers: { 'Content-Type': 'application/json' }
  })
}

// ✅ Track all Core Web Vitals
getCLS(sendToAnalytics)
getFCP(sendToAnalytics)
getFID(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### Bundle Analysis
```bash
# ✅ Analyze bundle size
npx vite-bundle-analyzer

# ✅ Check for duplicate dependencies
npx depcheck

# ✅ Lighthouse CI for automated performance testing
npx lighthouse-ci --upload.target=temporary-public-storage
```

## Performance Checklist

### Before Every Deploy
- [ ] **Bundle Size**: ≤ 200KB gzipped for initial chunk
- [ ] **Lighthouse Score**: ≥ 90 performance score
- [ ] **LCP**: ≤ 1.5s on mobile (simulated 3G)
- [ ] **CLS**: ≤ 0.1 cumulative layout shift
- [ ] **Images**: All images optimized (WebP + lazy loading)
- [ ] **Code Splitting**: Heavy components dynamically imported
- [ ] **Caching**: API responses and static assets cached
- [ ] **Preloading**: Critical routes preloaded on hover

### Development Best Practices
- [ ] Use `$state.raw` for large static data
- [ ] Implement virtual scrolling for large lists
- [ ] Debounce expensive operations (search, API calls)
- [ ] Use keyed `{#each}` blocks for efficient updates
- [ ] Clean up event listeners and timers
- [ ] Optimize database queries (joins, indexes)
- [ ] Enable gzip/brotli compression
- [ ] Use CDN for static assets

### Monitoring & Alerts
- [ ] **Core Web Vitals**: Track LCP, CLS, FID
- [ ] **Bundle Monitoring**: Alert on size increases > 10%
- [ ] **Performance Budget**: Fail builds that exceed limits
- [ ] **Real User Monitoring**: Track actual user performance
- [ ] **Synthetic Testing**: Automated Lighthouse checks

**Remember**: Performance is a feature. Optimize for your users' experience, especially on mobile devices!