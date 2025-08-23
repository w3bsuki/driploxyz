# LINK OPTIONS - Navigation & Prefetching

**Reference**: https://svelte.dev/docs/kit/link-options

## PREFETCHING STRATEGIES

### 1. Data Preloading
```svelte
<!-- Preload on hover (default) -->
<a href="/product/{id}" data-sveltekit-preload-data="hover">
  View Product
</a>

<!-- Preload on tap only (mobile-friendly) -->
<a href="/large-page" data-sveltekit-preload-data="tap">
  Large Content
</a>

<!-- Disable preloading -->
<a href="/dynamic" data-sveltekit-preload-data="false">
  Dynamic Content
</a>
```

### 2. Code Preloading
```svelte
<!-- Eager: Load immediately -->
<a href="/critical" data-sveltekit-preload-code="eager">
  Critical Path
</a>

<!-- Viewport: Load when visible -->
<a href="/product" data-sveltekit-preload-code="viewport">
  Product
</a>

<!-- Hover: Load on mouse over -->
<a href="/details" data-sveltekit-preload-code="hover">
  Details
</a>

<!-- Tap: Load on click -->
<a href="/checkout" data-sveltekit-preload-code="tap">
  Checkout
</a>
```

### 3. Combined Strategies
```svelte
<!-- Aggressive prefetching for critical paths -->
<a 
  href="/dashboard"
  data-sveltekit-preload-data="hover"
  data-sveltekit-preload-code="viewport"
>
  Dashboard
</a>

<!-- Conservative for data-heavy pages -->
<a 
  href="/analytics"
  data-sveltekit-preload-data="tap"
  data-sveltekit-preload-code="tap"
>
  Analytics
</a>
```

## NAVIGATION BEHAVIOR

### 1. Full Page Reload
```svelte
<!-- Force full page navigation -->
<a href="/external" data-sveltekit-reload>
  External Integration
</a>

<!-- Conditional reload -->
<a 
  href="/page"
  data-sveltekit-reload={needsReload ? "" : undefined}
>
  Conditional
</a>
```

### 2. History Management
```svelte
<!-- Replace history entry -->
<a href="/step-2" data-sveltekit-replacestate>
  Next Step
</a>

<!-- Use case: Form steps -->
<nav>
  <a href="/form/1" data-sveltekit-replacestate>Step 1</a>
  <a href="/form/2" data-sveltekit-replacestate>Step 2</a>
  <a href="/form/3" data-sveltekit-replacestate>Step 3</a>
</nav>
```

### 3. Scroll Behavior
```svelte
<!-- Prevent scroll to top -->
<a href="/section#comments" data-sveltekit-noscroll>
  View Comments
</a>

<!-- Maintain scroll position -->
<a 
  href="/filter?category=shirts"
  data-sveltekit-noscroll
  data-sveltekit-replacestate
>
  Filter: Shirts
</a>
```

### 4. Focus Management
```svelte
<!-- Keep focus after navigation -->
<a href="/update" data-sveltekit-keepfocus>
  Update
</a>

<!-- Useful for inline edits -->
<button 
  onclick={() => goto('/save', { keepFocus: true })}
>
  Save & Continue
</button>
```

## INHERITANCE & SCOPING

### 1. Parent Element Inheritance
```svelte
<!-- All child links inherit settings -->
<div data-sveltekit-preload-data="hover">
  <a href="/page1">Inherits hover</a>
  <a href="/page2">Also hover</a>
  <a href="/page3" data-sveltekit-preload-data="tap">
    Override to tap
  </a>
</div>
```

### 2. Disable for Section
```svelte
<!-- Disable all preloading in nav -->
<nav data-sveltekit-preload-data="false">
  <a href="/home">No preload</a>
  <a href="/about">No preload</a>
  <a href="/contact" data-sveltekit-preload-data="hover">
    Override - preloads
  </a>
</nav>
```

### 3. Global Configuration
```svelte
<!-- +layout.svelte -->
<div 
  data-sveltekit-preload-data="tap"
  data-sveltekit-preload-code="viewport"
>
  <slot />
</div>
```

## PROGRAMMATIC NAVIGATION

### 1. Using goto()
```typescript
import { goto, preloadData, preloadCode } from '$app/navigation';

// Navigate with options
await goto('/page', {
  replaceState: true,
  noScroll: true,
  keepFocus: true,
  invalidateAll: true
});

// Preload before navigation
await preloadData('/next-page');
await goto('/next-page');
```

### 2. Preload Functions
```typescript
// Preload data only
import { preloadData } from '$app/navigation';

async function warmCache() {
  // Preload critical routes
  await Promise.all([
    preloadData('/dashboard'),
    preloadData('/profile'),
    preloadData('/settings')
  ]);
}

// Preload code modules
import { preloadCode } from '$app/navigation';

onMount(() => {
  // Preload next likely navigation
  preloadCode('/products/*');
});
```

### 3. Conditional Prefetching
```svelte
<script>
  import { browser } from '$app/environment';
  
  // Check connection type
  $: canPrefetch = browser && 
    navigator.connection?.effectiveType === '4g' &&
    !navigator.connection?.saveData;
</script>

<a 
  href="/heavy-page"
  data-sveltekit-preload-data={canPrefetch ? "hover" : "false"}
>
  Heavy Content
</a>
```

## PERFORMANCE PATTERNS

### 1. Critical Path Optimization
```svelte
<!-- Homepage links - eager loading -->
<nav class="main-nav">
  <a href="/products" data-sveltekit-preload-code="eager">
    Products
  </a>
  <a href="/cart" data-sveltekit-preload-code="eager">
    Cart
  </a>
</nav>

<!-- Footer links - viewport loading -->
<footer data-sveltekit-preload-code="viewport">
  <a href="/privacy">Privacy</a>
  <a href="/terms">Terms</a>
</footer>
```

### 2. Mobile Optimization
```svelte
<script>
  import { browser } from '$app/environment';
  
  $: isMobile = browser && window.innerWidth < 768;
  $: preloadStrategy = isMobile ? "tap" : "hover";
</script>

<a 
  href="/product"
  data-sveltekit-preload-data={preloadStrategy}
>
  Product
</a>
```

### 3. List Optimization
```svelte
<!-- Product grid - viewport preloading -->
<div class="product-grid" data-sveltekit-preload-code="viewport">
  {#each products as product}
    <a 
      href="/product/{product.id}"
      data-sveltekit-preload-data="tap"
    >
      <img src={product.image} alt={product.name}>
      <h3>{product.name}</h3>
    </a>
  {/each}
</div>
```

## LOADING STATES

### 1. Navigation Progress
```svelte
<script>
  import { navigating } from '$app/stores';
</script>

{#if $navigating}
  <div class="loading-bar" />
{/if}
```

### 2. Prefetch Indicators
```css
/* Visual feedback for prefetching */
a[data-sveltekit-preload-data]:hover {
  cursor: progress;
}

/* Indicate preloaded links */
a:visited[data-sveltekit-preload-data="eager"] {
  text-decoration-style: dotted;
}
```

## ACCESSIBILITY CONSIDERATIONS

### 1. Screen Reader Announcements
```svelte
<script>
  import { navigating } from '$app/stores';
</script>

{#if $navigating}
  <div aria-live="polite" aria-busy="true">
    Loading {$navigating.to?.url.pathname}...
  </div>
{/if}
```

### 2. Keyboard Navigation
```svelte
<!-- Ensure keyboard users can trigger prefetch -->
<a 
  href="/page"
  data-sveltekit-preload-data="hover"
  onfocus={(e) => preloadData(e.currentTarget.href)}
>
  Keyboard Accessible
</a>
```

## ANTI-PATTERNS

### ❌ DON'T
```svelte
<!-- Don't prefetch everything -->
<body data-sveltekit-preload-code="eager">

<!-- Don't prefetch large assets -->
<a href="/video" data-sveltekit-preload-data="hover">
  10GB Video
</a>

<!-- Don't ignore user preferences -->
<a href="/page" data-sveltekit-preload-data="hover">
  <!-- Ignores data-saver mode -->
</a>

<!-- Don't prefetch external links -->
<a href="https://external.com" data-sveltekit-preload-data="hover">
  External
</a>
```

### ✅ DO
```svelte
<!-- Respect data saving -->
{#if !navigator.connection?.saveData}
  <a href="/page" data-sveltekit-preload-data="hover">
    Page
  </a>
{/if}

<!-- Prefetch visible content first -->
<div data-sveltekit-preload-code="viewport">
  <!-- Links -->
</div>

<!-- Use appropriate strategies -->
<a href="/checkout" data-sveltekit-preload-data="tap">
  Checkout (loads on intent)
</a>
```

## CONFIGURATION RULES

- Use `hover` for desktop navigation menus
- Use `tap` for mobile or data-heavy content
- Use `eager` sparingly for critical paths
- Use `viewport` for long lists
- Disable prefetching for:
  - External links
  - Large downloads
  - Dynamic/personalized content
  - Rate-limited APIs
- Always respect `navigator.connection.saveData`
- Test with slow 3G throttling
- Monitor prefetch impact on server load

## AUDIT COMMANDS

```bash
# Check prefetch behavior
# Chrome DevTools > Network > Filter: Fetch/XHR

# Monitor performance impact
# Lighthouse > Performance > Unused JavaScript

# Test with slow connection
# Chrome DevTools > Network > Slow 3G

# Check accessibility
# Navigate with keyboard only
```