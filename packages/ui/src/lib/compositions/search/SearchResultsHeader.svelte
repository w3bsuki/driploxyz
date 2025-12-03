<script lang="ts">
  import { X } from 'lucide-svelte';

  interface Category {
    label: string;
    slug: string;
  }

  interface Props {
    count: number;
    searchQuery?: string;
    onClearSearch?: () => void;
    categories?: Category[];
    onCategoryClick?: (slug: string) => void;
    activeCategory?: string | null;
  }

  let { 
    count, 
    searchQuery = '', 
    onClearSearch, 
    categories = [], 
    onCategoryClick,
    activeCategory = null
  }: Props = $props();

  function formatCount(n: number): string {
    if (n >= 10000) return `${Math.floor(n / 1000)}K+`;
    if (n >= 1000) return `${Math.floor(n / 100) / 10}K+`;
    if (n >= 500) return '500+';
    return n.toLocaleString();
  }

  const formattedCount = $derived(formatCount(count));
</script>

<div class="results-header">
  <div class="results-header__container">
    <!-- Result Count -->
    <h1 class="results-count">
      {formattedCount} {count === 1 ? 'result' : 'results'}
    </h1>
    
    <!-- Search Query Chip -->
    {#if searchQuery && onClearSearch}
      <button 
        class="search-chip"
        onclick={onClearSearch}
        type="button"
        aria-label="Clear search: {searchQuery}"
      >
        <span class="search-chip__text">{searchQuery}</span>
        <X class="search-chip__icon" size={14} strokeWidth={2.5} />
      </button>
    {/if}
    
    <!-- Category Quick Links -->
    {#if categories.length > 0 && onCategoryClick}
      <nav class="category-links" aria-label="Quick category filters">
        {#each categories as category}
          <button
            type="button"
            class="category-link"
            class:active={activeCategory === category.slug}
            onclick={() => onCategoryClick?.(category.slug)}
          >
            {category.label}
          </button>
        {/each}
      </nav>
    {/if}
  </div>
</div>

<style>
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     SEARCH RESULTS HEADER — Mobile-First with Design Tokens
     Using Tailwind CSS v4 semantic tokens
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .results-header {
    background: var(--surface-base);
    border-bottom: 1px solid var(--border-subtle);
  }

  .results-header__container {
    max-width: 1280px;
    margin: 0 auto;
    padding: var(--space-4);
  }

  .results-count {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin: 0 0 var(--space-3) 0;
    line-height: var(--leading-tight);
  }

  /* Search Query Chip - Touch-Friendly */
  .search-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3-5);
    background: var(--surface-subtle);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
    cursor: pointer;
    margin-bottom: var(--space-3-5);
    transition: all var(--duration-fast) var(--ease-out);
    max-width: 100%;
    min-height: var(--touch-standard);
  }

  .search-chip:hover {
    background: var(--surface-muted);
    border-color: var(--border-emphasis);
  }

  .search-chip:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .search-chip:active {
    transform: scale(0.98);
  }

  .search-chip__text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }

  .search-chip :global(svg) {
    flex-shrink: 0;
    opacity: 0.7;
  }

  /* Category Quick Links - Horizontal Scroll */
  .category-links {
    display: flex;
    gap: var(--space-3);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    margin: 0 calc(-1 * var(--space-4));
    padding: 0 var(--space-4);
  }

  .category-links::-webkit-scrollbar {
    display: none;
  }

  .category-link {
    flex-shrink: 0;
    color: var(--text-tertiary);
    text-decoration: none;
    white-space: nowrap;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    padding: var(--space-2) var(--space-3-5);
    border-radius: var(--radius-full);
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    min-height: var(--touch-compact);
    display: inline-flex;
    align-items: center;
  }

  .category-link:hover {
    background: var(--surface-subtle);
    color: var(--text-primary);
  }

  .category-link:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .category-link.active {
    background: var(--surface-brand-subtle);
    color: var(--text-primary);
    font-weight: var(--font-semibold);
  }

  /* Responsive Enhancements */
  @media (min-width: 640px) {
    .results-count {
      font-size: var(--text-3xl);
    }

    .search-chip__text {
      max-width: 400px;
    }
  }

  @media (min-width: 768px) {
    .results-header__container {
      padding: var(--space-5) var(--space-4);
    }

    .results-count {
      font-size: var(--text-4xl);
      margin-bottom: var(--space-4);
    }

    .search-chip {
      font-size: var(--text-base);
      padding: var(--space-2-5) var(--space-4);
      margin-bottom: var(--space-4);
    }

    .category-link {
      font-size: var(--text-base);
      padding: var(--space-2-5) var(--space-4);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .search-chip,
    .category-link {
      transition: none;
    }
  }
</style>
