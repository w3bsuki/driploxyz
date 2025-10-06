# Svelte 5 MCP Refactor Plan

## Overview
This document provides a comprehensive refactor plan for optimizing the Svelte 5 implementation, focusing on runes optimization, component architecture improvements, performance patterns, TypeScript integration, and accessibility enhancements.

## Objectives
- Complete Svelte 5 migration verification and optimization
- Optimize runes usage ($state, $derived, $effect)
- Improve component architecture for better reusability
- Implement performance patterns for production readiness
- Enhance TypeScript integration throughout the codebase
- Improve accessibility across all components

## Prerequisites
- Svelte 5.36.12 or later installed
- Svelte MCP server connection established (`svelte` MCP server)
- Node.js 22.12.0 or later
- TypeScript 5.8.2 or later

---

## 1. Complete Svelte 5 Migration Verification

### 1.1 Migration Status Check
```bash
# Use MCP to get Svelte documentation
svelte get-documentation --section="runes"
svelte get-documentation --section="migration"

# Run the effect usage analysis script
node scripts/find-effect-usage.js
```

### 1.2 Configuration Verification
```javascript
// apps/web/svelte.config.js should have:
const config = {
  compilerOptions: {
    runes: true // Ensure this is enabled
  },
  // ... other config
};
```

### 1.3 Migration Audit Tasks
```bash
# Find all components using legacy patterns
find apps/web/src packages/ui/src -name "*.svelte" -exec grep -l "export let" {} \;
find apps/web/src packages/ui/src -name "*.svelte" -exec grep -l "\\$:" {} \;

# Check for remaining Svelte 4 patterns
grep -r "\$: " apps/web/src packages/ui/src --include="*.svelte" --include="*.ts"
grep -r "export let" apps/web/src packages/ui/src --include="*.svelte"
```

### 1.4 Migration Verification Script
```typescript
// scripts/verify-svelte5-migration.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface MigrationIssue {
  file: string;
  line: number;
  issue: string;
  suggestion: string;
}

function verifySvelte5Migration(): MigrationIssue[] {
  const issues: MigrationIssue[] = [];
  const directories = [
    'apps/web/src',
    'packages/ui/src'
  ];

  directories.forEach(dir => {
    const files = findSvelteFiles(dir);
    
    files.forEach(filePath => {
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for legacy patterns
        if (line.includes('export let')) {
          issues.push({
            file: filePath,
            line: index + 1,
            issue: 'Legacy export let pattern',
            suggestion: 'Convert to $props()'
          });
        }
        
        if (line.includes('$:')) {
          issues.push({
            file: filePath,
            line: index + 1,
            issue: 'Legacy reactive statement',
            suggestion: 'Convert to $derived or $effect'
          });
        }
      });
    });
  });

  return issues;
}

function findSvelteFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const items = readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(currentDir, item.name);
      
      if (item.isDirectory()) {
        traverse(fullPath);
      } else if (item.name.endsWith('.svelte')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Run verification
const issues = verifySvelte5Migration();
console.log(`Found ${issues.length} migration issues:`);
issues.forEach(issue => {
  console.log(`${issue.file}:${issue.line} - ${issue.issue}`);
  console.log(`  Suggestion: ${issue.suggestion}`);
});
```

---

## 2. Runes Optimization ($state, $derived, $effect)

### 2.1 $state Optimization
```svelte
<!-- BEFORE: Inefficient state management -->
<script lang="ts">
  let count = 0;
  let name = '';
  let items = [];
</script>

<!-- AFTER: Optimized with $state -->
<script lang="ts">
  let count = $state(0);
  let name = $state('');
  let items = $state([]);
  
  // Use $state for objects that need reactivity
  let formData = $state({
    email: '',
    password: '',
    remember: false
  });
</script>
```

### 2.2 $derived Optimization
```svelte
<!-- BEFORE: Using $effect for derived values -->
<script lang="ts">
  let items = $state([]);
  let totalPrice = 0;
  
  $effect(() => {
    totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  });
</script>

<!-- AFTER: Using $derived for computed values -->
<script lang="ts">
  let items = $state([]);
  
  // Use $derived for computed values
  let totalPrice = $derived(() => 
    items.reduce((sum, item) => sum + item.price, 0)
  );
  
  // Complex derived logic with $derived.by
  let filteredItems = $derived.by(() => 
    items.filter(item => item.active && item.price > 0)
  );
</script>
```

### 2.3 $effect Optimization
```svelte
<!-- BEFORE: Overusing $effect -->
<script lang="ts">
  let user = $state(null);
  let theme = $state('light');
  
  $effect(() => {
    // This should be a derived value
    document.title = `Welcome ${user?.name || 'Guest'}`;
  });
  
  $effect(() => {
    // This should be a derived value
    const themeClass = theme === 'dark' ? 'dark-theme' : 'light-theme';
    document.body.className = themeClass;
  });
</script>

<!-- AFTER: Proper $effect usage -->
<script lang="ts">
  let user = $state(null);
  let theme = $state('light');
  
  // Use $derived for computed values
  let pageTitle = $derived(() => `Welcome ${user?.name || 'Guest'}`);
  let themeClass = $derived(() => theme === 'dark' ? 'dark-theme' : 'light-theme');
  
  // Use $effect only for side effects
  $effect(() => {
    document.title = pageTitle();
  });
  
  $effect(() => {
    document.body.className = themeClass();
  });
</script>
```

### 2.4 Runes Performance Analysis
```typescript
// scripts/analyze-runes-performance.ts
import { readFileSync } from 'fs';
import { join } from 'path';

interface RunesUsage {
  file: string;
  state: number;
  derived: number;
  effect: number;
  effectComplexity: number[];
  derivedComplexity: number[];
}

function analyzeRunesPerformance(): RunesUsage[] {
  const results: RunesUsage[] = [];
  
  // Implementation details for analyzing runes usage
  // and identifying performance bottlenecks
  
  return results;
}
```

---

## 3. Component Architecture Improvements

### 3.1 Component Composition Patterns
```svelte
<!-- BEFORE: Monolithic component -->
<script lang="ts">
  let { products, filters, onFilterChange } = $props();
  
  // Lots of complex logic here
</script>

<div class="product-list">
  <!-- Complex template -->
</div>

<!-- AFTER: Composed components -->
<script lang="ts">
  import ProductGrid from './ProductGrid.svelte';
  import FilterPanel from './FilterPanel.svelte';
  import ProductCard from './ProductCard.svelte';
  
  let { products, filters, onFilterChange } = $props();
</script>

<div class="product-list">
  <FilterPanel {filters} onFilterChange={onFilterChange} />
  <ProductGrid {products}>
    {#each products as product}
      <ProductCard {product} />
    {/each}
  </ProductGrid>
</div>
```

### 3.2 Generic Component Patterns
```svelte
<!-- Generic List Component -->
<script lang="ts" generics="T">
  interface Props<T> {
    items: T[];
    renderItem: (item: T) => import('svelte').Snippet;
    emptyState?: import('svelte').Snippet;
    loading?: boolean;
    className?: string;
  }
  
  let { 
    items, 
    renderItem, 
    emptyState, 
    loading = false, 
    className = '' 
  }: Props<T> = $props();
</script>

<div class="list {className}">
  {#if loading}
    <slot name="loading">
      <div class="loading">Loading...</div>
    </slot>
  {:else if items.length === 0 && emptyState}
    {@render emptyState()}
  {:else}
    {#each items as item}
      {@render renderItem(item)}
    {/each}
  {/if}
</div>
```

### 3.3 Compound Components
```svelte
<!-- Modal Compound Component -->
<script lang="ts">
  import { createContext, useContext } from 'svelte';
  
  // Context for modal state management
  const ModalContext = createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
    size: 'sm' | 'md' | 'lg' | 'xl';
    setSize: (size: string) => void;
  }>();
  
  interface ModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    children: import('svelte').Snippet;
  }
  
  let { 
    open = false, 
    onOpenChange, 
    size = 'md', 
    children 
  }: ModalProps = $props();
  
  let modalOpen = $state(open);
  let modalSize = $state(size);
  
  // Sync with props
  $effect(() => {
    modalOpen = open;
  });
  
  $effect(() => {
    onOpenChange?.(modalOpen);
  });
  
  const context = {
    get open() { return modalOpen; },
    setOpen: (value: boolean) => { modalOpen = value; },
    get size() { return modalSize; },
    setSize: (value: string) => { modalSize = value as any; }
  };
</script>

<ModalContext value={context}>
  {@render children()}
</ModalContext>
```

### 3.4 Component Performance Optimization
```svelte
<!-- Optimized ProductCard Component -->
<script lang="ts">
  interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
  }
  
  interface Props {
    product: Product;
    onAddToCart?: (product: Product) => void;
    lazy?: boolean;
  }
  
  let { 
    product, 
    onAddToCart, 
    lazy = false 
  }: Props = $props();
  
  // Optimize re-renders with stable references
  let handleClick = $derived(() => () => {
    onAddToCart?.(product);
  });
  
  // Use $derived for computed values
  let formattedPrice = $derived(() => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(product.price)
  );
</script>

<div class="product-card">
  <img 
    src={product.image} 
    alt={product.title}
    loading={lazy ? 'lazy' : 'eager'}
  />
  <h3>{product.title}</h3>
  <p>{formattedPrice()}</p>
  <button onclick={handleClick()}>
    Add to Cart
  </button>
</div>
```

---

## 4. Performance Patterns

### 4.1 Lazy Loading Patterns
```svelte
<!-- LazyLoad Component -->
<script lang="ts">
  interface Props {
    children: import('svelte').Snippet;
    fallback?: import('svelte').Snippet;
    rootMargin?: string;
    threshold?: number;
  }
  
  let { 
    children, 
    fallback, 
    rootMargin = '0px', 
    threshold = 0.1 
  }: Props = $props();
  
  let element: HTMLElement | null = $state(null);
  let isVisible = $state(false);
  
  $effect(() => {
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { rootMargin, threshold }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  });
</script>

<div bind:this={element}>
  {#if isVisible}
    {@render children()}
  {:else if fallback}
    {@render fallback()}
  {:else}
    <div class="loading-placeholder">Loading...</div>
  {/if}
</div>
```

### 4.2 Virtual Scrolling
```svelte
<!-- VirtualList Component -->
<script lang="ts" generics="T">
  interface Props<T> {
    items: T[];
    itemHeight: number;
    containerHeight: number;
    renderItem: (item: T, index: number) => import('svelte').Snippet;
    overscan?: number;
  }
  
  let { 
    items, 
    itemHeight, 
    containerHeight, 
    renderItem,
    overscan = 5 
  }: Props<T> = $props();
  
  let scrollTop = $state(0);
  let container: HTMLElement | null = $state(null);
  
  let visibleStart = $derived(() => 
    Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  );
  
  let visibleEnd = $derived(() => 
    Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
  );
  
  let visibleItems = $derived(() => 
    items.slice(visibleStart, visibleEnd + 1)
  );
  
  let totalHeight = $derived(() => items.length * itemHeight);
  let offsetY = $derived(() => visibleStart * itemHeight);
  
  function handleScroll(event: Event) {
    scrollTop = (event.target as HTMLElement).scrollTop;
  }
</script>

<div 
  bind:this={container}
  class="virtual-list"
  style="height: {containerHeight}px; overflow-y: auto;"
  onscroll={handleScroll}
>
  <div style="height: {totalHeight}px; position: relative;">
    <div style="transform: translateY({offsetY}px);">
      {#each visibleItems as item, index (visibleStart + index)}
        {@render renderItem(item, visibleStart + index)}
      {/each}
    </div>
  </div>
</div>
```

### 4.3 Memoization Patterns
```svelte
<!-- MemoizedExpensiveComponent -->
<script lang="ts">
  interface Props {
    data: any[];
    filter: string;
    sortBy: string;
  }
  
  let { data, filter, sortBy }: Props = $props();
  
  // Memoize expensive computations
  let filteredData = $derived.by(() => {
    if (!filter) return data;
    
    return data.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  });
  
  let sortedData = $derived.by(() => {
    const result = [...filteredData()];
    
    return result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return a.price - b.price;
      }
      return 0;
    });
  });
</script>

<div>
  {#each sortedData() as item}
    <div>{item.name}</div>
  {/each}
</div>
```

---

## 5. TypeScript Integration

### 5.1 Strict Type Safety
```typescript
// types/components.ts
export interface BaseComponentProps {
  class?: string;
  id?: string;
  'data-testid'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onclick?: () => void;
  children?: import('svelte').Snippet;
}

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  description?: string;
}
```

### 5.2 Generic Components
```svelte
<!-- GenericDataTable.svelte -->
<script lang="ts" generics="T">
  interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], item: T) => string;
    sortable?: boolean;
  }
  
  interface Props<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    loading?: boolean;
    emptyMessage?: string;
  }
  
  let { 
    data, 
    columns, 
    onRowClick, 
    loading = false, 
    emptyMessage = 'No data available' 
  }: Props<T> = $props();
  
  let sortColumn = $state<keyof T | null>(null);
  let sortDirection = $state<'asc' | 'desc'>('asc');
  
  let sortedData = $derived.by(() => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  });
  
  function handleSort(column: Column<T>) {
    if (!column.sortable) return;
    
    if (sortColumn === column.key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column.key;
      sortDirection = 'asc';
    }
  }
</script>

<div class="data-table">
  <table>
    <thead>
      <tr>
        {#each columns as column}
          <th 
            class:sortable={column.sortable}
            onclick={() => handleSort(column)}
          >
            {column.label}
            {#if sortColumn === column.key}
              <span class="sort-indicator">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#if loading}
        <tr>
          <td colspan={columns.length}>Loading...</td>
        </tr>
      {:else if sortedData().length === 0}
        <tr>
          <td colspan={columns.length}>{emptyMessage}</td>
        </tr>
      {:else}
        {#each sortedData() as item}
          <tr onclick={() => onRowClick?.(item)}>
            {#each columns as column}
              <td>
                {#if column.render}
                  {column.render(item[column.key], item)}
                {:else}
                  {item[column.key]}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
```

### 5.3 Type-Safe Event Handling
```svelte
<!-- TypeSafeForm.svelte -->
<script lang="ts">
  interface FormData {
    email: string;
    password: string;
    remember: boolean;
  }
  
  interface FormErrors {
    email?: string;
    password?: string;
  }
  
  interface Props {
    onSubmit: (data: FormData) => Promise<void>;
    initialValues?: Partial<FormData>;
  }
  
  let { onSubmit, initialValues = {} }: Props = $props();
  
  let formData = $state<FormData>({
    email: initialValues.email || '',
    password: initialValues.password || '',
    remember: initialValues.remember || false
  });
  
  let errors = $state<FormErrors>({});
  let isSubmitting = $state(false);
  
  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    // Validate form
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    errors = newErrors;
    
    if (Object.keys(errors).length > 0) return;
    
    isSubmitting = true;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <div class="form-field">
    <label for="email">Email</label>
    <input
      id="email"
      type="email"
      bind:value={formData.email}
      class:error={errors.email}
      disabled={isSubmitting}
    />
    {#if errors.email}
      <span class="error">{errors.email}</span>
    {/if}
  </div>
  
  <div class="form-field">
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      bind:value={formData.password}
      class:error={errors.password}
      disabled={isSubmitting}
    />
    {#if errors.password}
      <span class="error">{errors.password}</span>
    {/if}
  </div>
  
  <div class="form-field">
    <label>
      <input
        type="checkbox"
        bind:checked={formData.remember}
        disabled={isSubmitting}
      />
      Remember me
    </label>
  </div>
  
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
</form>
```

---

## 6. Accessibility Improvements

### 6.1 Focus Management
```svelte
<!-- FocusTrap.svelte -->
<script lang="ts">
  interface Props {
    active: boolean;
    children: import('svelte').Snippet;
  }
  
  let { active, children }: Props = $props();
  
  let container: HTMLElement | null = $state(null);
  let previouslyFocused: HTMLElement | null = null;
  
  $effect(() => {
    if (!active || !container) return;
    
    // Save current focus
    previouslyFocused = document.activeElement as HTMLElement;
    
    // Focus first element
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    firstElement?.focus();
    
    // Handle tab key
    function handleKeydown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;
      
      const elements = Array.from(focusableElements) as HTMLElement[];
      const first = elements[0];
      const last = elements[elements.length - 1];
      
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    
    container.addEventListener('keydown', handleKeydown);
    
    return () => {
      container.removeEventListener('keydown', handleKeydown);
      previouslyFocused?.focus();
    };
  });
</script>

<div bind:this={container}>
  {@render children()}
</div>
```

### 6.2 Screen Reader Support
```svelte
<!-- AccessibleButton.svelte -->
<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    'aria-label'?: string;
    'aria-describedby'?: string;
    onclick?: () => void;
    children: import('svelte').Snippet;
  }
  
  let { 
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    onclick,
    children
  }: Props = $props();
  
  let button: HTMLButtonElement | null = $state(null);
  
  // Announce loading state to screen readers
  $effect(() => {
    if (loading && button) {
      button.setAttribute('aria-busy', 'true');
    } else if (button) {
      button.removeAttribute('aria-busy');
    }
  });
</script>

<button
  bind:this={button}
  class="btn {variant} {size}"
  {disabled}
  {ariaLabel}
  {ariaDescribedBy}
  onclick={onclick}
>
  {#if loading}
    <span class="sr-only">Loading</span>
    <div class="spinner" aria-hidden="true"></div>
  {/if}
  {@render children()}
</button>
```

### 6.3 ARIA Live Regions
```svelte
<!-- LiveRegion.svelte -->
<script lang="ts">
  interface Props {
    politeness?: 'polite' | 'assertive' | 'off';
    atomic?: boolean;
    relevant?: 'additions' | 'removals' | 'text' | 'all';
  }
  
  let { 
    politeness = 'polite',
    atomic = false,
    relevant = 'additions text'
  }: Props = $props();
  
  let announcements = $state<string[]>([]);
  
  function announce(message: string) {
    announcements = [...announcements, message];
    
    // Clear announcement after it's read
    setTimeout(() => {
      announcements = announcements.filter(a => a !== message);
    }, 1000);
  }
  
  // Expose announce function to parent
  defineExpose({ announce });
</script>

<div
  aria-live={politeness}
  aria-atomic={atomic}
  aria-relevant={relevant}
  class="sr-only"
>
  {#each announcements as announcement}
    {announcement}
  {/each}
</div>
```

---

## 7. Performance Monitoring

### 7.1 Component Performance Tracking
```svelte
<!-- PerformanceTracker.svelte -->
<script lang="ts">
  interface Props {
    componentName: string;
    trackRerenders?: boolean;
    trackRenderTime?: boolean;
  }
  
  let { 
    componentName, 
    trackRerenders = true, 
    trackRenderTime = true 
  }: Props = $props();
  
  let renderCount = $state(0);
  let lastRenderTime = $state(0);
  
  if (trackRerenders) {
    $effect(() => {
      renderCount++;
      console.log(`[Performance] ${componentName} rendered ${renderCount} times`);
    });
  }
  
  if (trackRenderTime) {
    const startTime = performance.now();
    
    $effect(() => {
      lastRenderTime = performance.now() - startTime;
      console.log(`[Performance] ${componentName} render time: ${lastRenderTime.toFixed(2)}ms`);
    });
  }
</script>
```

### 7.2 Bundle Size Optimization
```typescript
// vite.config.ts optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'svelte-core': ['svelte'],
          'svelte-kit': ['@sveltejs/kit'],
          'vendor': ['@supabase/supabase-js', '@stripe/stripe-js']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['svelte', '@sveltejs/kit']
  }
});
```

---

## 8. Testing Strategy

### 8.1 Component Testing
```typescript
// tests/components/Button.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Button from '$lib/components/Button.svelte';

describe('Button', () => {
  it('renders with correct text', () => {
    const { getByText } = render(Button, {
      props: { children: 'Click me' }
    });
    
    expect(getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', async () => {
    const handleClick = vi.fn();
    const { getByRole } = render(Button, {
      props: { 
        children: 'Click me',
        onclick: handleClick
      }
    });
    
    await fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
  
  it('is accessible', async () => {
    const { getByRole } = render(Button, {
      props: { 
        children: 'Click me',
        'aria-label': 'Submit form'
      }
    });
    
    const button = getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Submit form');
  });
});
```

### 8.2 Runes Testing
```typescript
// tests/runes/state.test.ts
import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Counter from './Counter.svelte';

describe('State Management', () => {
  it('updates state correctly', async () => {
    const { getByRole } = render(Counter);
    
    const button = getByRole('button', { name: 'Increment' });
    const display = getByRole('status');
    
    expect(display).toHaveTextContent('Count: 0');
    
    await fireEvent.click(button);
    expect(display).toHaveTextContent('Count: 1');
  });
  
  it('computes derived values correctly', async () => {
    const { getByRole } = render(Counter);
    
    const doubled = getByRole('status', { name: 'Doubled' });
    expect(doubled).toHaveTextContent('Doubled: 0');
    
    const button = getByRole('button', { name: 'Increment' });
    await fireEvent.click(button);
    
    expect(doubled).toHaveTextContent('Doubled: 2');
  });
});
```

---

## 9. Migration Checklist

### 9.1 Pre-Migration
- [ ] Run `node scripts/find-effect-usage.js` to identify legacy patterns
- [ ] Update all dependencies to latest Svelte 5 compatible versions
- [ ] Enable `runes: true` in svelte.config.js
- [ ] Set up TypeScript strict mode

### 9.2 Migration Tasks
- [ ] Convert all `export let` to `$props()`
- [ ] Replace `$:` reactive statements with `$derived` or `$effect`
- [ ] Optimize `$effect` usage for side effects only
- [ ] Implement proper component composition patterns
- [ ] Add TypeScript types for all components
- [ ] Implement accessibility improvements

### 9.3 Post-Migration
- [ ] Run performance benchmarks
- [ ] Test all components with screen readers
- [ ] Verify bundle size optimization
- [ ] Update documentation
- [ ] Train team on Svelte 5 patterns

---

## 10. MCP Commands Summary

```bash
# Get Svelte documentation
svelte get-documentation --section="runes"
svelte get-documentation --section="migration"
svelte get-documentation --section="component-architecture"

# Fix component issues
svelte svelte-autofixer --code="<component code>" --desired_svelte_version=5

# Generate playground links for testing
svelte playground-link --name="Test Component" --tailwind=false --files="{'Component.svelte': '<component code>'}"
```

---

## 11. Success Criteria

### 11.1 Performance Metrics
- Component render time under 16ms (60fps)
- Bundle size reduced by at least 20%
- Memory usage stable during long-running sessions
- No memory leaks from $effect cleanup

### 11.2 Code Quality Metrics
- 100% TypeScript coverage for components
- All components pass accessibility tests
- Zero Svelte 4 legacy patterns
- 90%+ test coverage for critical components

### 11.3 Developer Experience
- Clear component documentation
- Consistent patterns across codebase
- Easy-to-reuse generic components
- Comprehensive error handling

---

## 12. Next Steps

1. Execute migration in phases, starting with utility components
2. Establish performance monitoring baseline
3. Create component library documentation
4. Set up automated testing for accessibility
5. Schedule regular performance reviews