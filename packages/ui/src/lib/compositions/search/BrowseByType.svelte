<script lang="ts">
  import { 
    Shirt, 
    Footprints, 
    ShoppingBag, 
    Watch, 
    Baby, 
    User,
    Search
  } from 'lucide-svelte';

  interface Props {
    onCategorySelect: (slug: string) => void;
  }

  let { onCategorySelect }: Props = $props();

  const categories = [
    { name: 'Women', slug: 'women', icon: User },
    { name: 'Men', slug: 'men', icon: User },
    { name: 'Kids', slug: 'kids', icon: Baby },
    { name: 'Clothing', slug: 'clothing', icon: Shirt },
    { name: 'Shoes', slug: 'shoes', icon: Footprints },
    { name: 'Bags', slug: 'bags', icon: ShoppingBag },
    { name: 'Accessories', slug: 'accessories', icon: Watch },
  ];
</script>

<div class="browse-by-type">
  <div class="browse-header">
    <h2 class="browse-title">Browse by type</h2>
    <button onclick={() => onCategorySelect('all')} class="browse-view-all">
      View all
    </button>
  </div>
  
  <div class="browse-grid">
    {#each categories as cat}
      <button
        onclick={() => onCategorySelect(cat.slug)}
        class="category-card"
        aria-label="Browse {cat.name}"
      >
        <div class="category-icon">
          <cat.icon size={24} strokeWidth={1.5} />
        </div>
        <span class="category-name">{cat.name}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BROWSE BY TYPE — Mobile-First with Design Tokens
     Using Tailwind CSS v4 semantic tokens (correct syntax)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .browse-by-type {
    padding: var(--space-6) 0;
  }

  .browse-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-4);
    padding: 0 var(--space-1);
  }

  .browse-title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }

  .browse-view-all {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-weight: var(--font-medium);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    transition: color var(--duration-fast) var(--ease-out);
  }

  .browse-view-all:hover {
    color: var(--text-primary);
  }

  .browse-view-all:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  /* Mobile: Horizontal scroll */
  .browse-grid {
    display: flex;
    gap: var(--space-3);
    overflow-x: auto;
    padding-bottom: var(--space-4);
    margin: 0 calc(-1 * var(--space-4));
    padding-left: var(--space-4);
    padding-right: var(--space-4);
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
  }

  .browse-grid::-webkit-scrollbar {
    display: none;
  }

  /* Category Card - Touch-Friendly */
  .category-card {
    scroll-snap-align: start;
    flex-shrink: 0;
    width: 7rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    border-radius: var(--radius-xl);
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    cursor: pointer;
    aspect-ratio: 1;
    transition: all var(--duration-fast) var(--ease-out);
  }

  .category-card:hover {
    border-color: var(--text-primary);
  }

  .category-card:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .category-icon {
    padding: var(--space-3);
    border-radius: var(--radius-full);
    margin-bottom: var(--space-3);
    background: var(--surface-subtle);
    color: var(--text-primary);
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .category-card:hover .category-icon {
    transform: scale(1.1);
  }

  .category-name {
    font-weight: var(--font-medium);
    font-size: var(--text-sm);
    color: var(--text-primary);
  }

  /* Tablet/Desktop: Grid layout */
  @media (min-width: 640px) {
    .browse-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding-bottom: 0;
      margin: 0;
      padding: 0;
      overflow: visible;
    }

    .category-card {
      width: auto;
      aspect-ratio: 4/3;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .browse-view-all,
    .category-card,
    .category-icon {
      transition: none;
    }
  }
</style>
