<script lang="ts">
  import { ChevronRight, ChevronDown } from 'lucide-svelte';
  import { slide } from 'svelte/transition';

  interface Category {
    id: string;
    name: string;
    slug: string;
    children?: Category[];
  }

  interface Props {
    categories: Category[];
    activeCategory?: string | null;
    onSelect: (slug: string) => void;
  }

  let { categories, activeCategory, onSelect }: Props = $props();

  let expandedCategories = $state<Set<string>>(new Set());

  function toggleExpand(id: string, event: Event) {
    event.stopPropagation();
    const newSet = new Set(expandedCategories);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    expandedCategories = newSet;
  }

  function handleSelect(slug: string) {
    onSelect(slug);
  }

  // Auto-expand active category parent - using Svelte 5 $effect
  $effect(() => {
    if (activeCategory) {
      // Find parent of active category and expand it
      for (const cat of categories) {
        if (cat.children?.some(c => c.slug === activeCategory)) {
          expandedCategories.add(cat.id);
        }
      }
    }
  });
</script>

<aside class="category-sidebar" aria-labelledby="category-sidebar-title">
  <h3 id="category-sidebar-title" class="sidebar-title">Categories</h3>
  
  <nav class="sidebar-nav" aria-label="Category navigation">
    <button
      onclick={() => handleSelect('all')}
      class="category-btn"
      class:active={activeCategory === 'all' || !activeCategory}
      aria-current={activeCategory === 'all' || !activeCategory ? 'page' : undefined}
    >
      All Categories
    </button>

    {#each categories as category (category.id)}
      <div class="category-group">
        <div class="category-row">
          <button
            onclick={() => handleSelect(category.slug)}
            class="category-btn"
            class:active={activeCategory === category.slug}
            aria-current={activeCategory === category.slug ? 'page' : undefined}
          >
            {category.name}
          </button>
          {#if category.children && category.children.length > 0}
            <button
              onclick={(e) => toggleExpand(category.id, e)}
              class="expand-btn"
              aria-expanded={expandedCategories.has(category.id)}
              aria-label={expandedCategories.has(category.id) ? `Collapse ${category.name}` : `Expand ${category.name}`}
            >
              {#if expandedCategories.has(category.id)}
                <ChevronDown size={16} />
              {:else}
                <ChevronRight size={16} />
              {/if}
            </button>
          {/if}
        </div>

        {#if category.children && category.children.length > 0 && expandedCategories.has(category.id)}
          <div transition:slide={{ duration: 200 }} class="subcategory-list" role="group" aria-label="{category.name} subcategories">
            {#each category.children as child (child.id)}
              <button
                onclick={() => handleSelect(child.slug)}
                class="subcategory-btn"
                class:active={activeCategory === child.slug}
                aria-current={activeCategory === child.slug ? 'page' : undefined}
              >
                {child.name}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </nav>
</aside>

<style>
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     CATEGORY SIDEBAR — Desktop Navigation with Design Tokens
     Using Tailwind CSS v4 semantic tokens
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .category-sidebar {
    width: 100%;
    background: var(--surface-base);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
    padding: var(--space-4);
    height: fit-content;
    position: sticky;
    top: calc(var(--nav-height) + 80px);
  }

  .sidebar-title {
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-4);
    padding: 0 var(--space-2);
    font-size: var(--text-base);
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .category-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .category-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Category Button - Touch Target 40px */
  .category-btn {
    flex: 1;
    text-align: left;
    padding: var(--space-1-5) var(--space-2);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    min-height: var(--touch-compact);
    display: flex;
    align-items: center;
  }

  .category-btn:hover {
    background: var(--surface-subtle);
    color: var(--text-primary);
  }

  .category-btn:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .category-btn.active {
    background: var(--surface-subtle);
    color: var(--text-primary);
  }

  /* Expand/Collapse Button */
  .expand-btn {
    padding: var(--space-1-5);
    border-radius: var(--radius-md);
    color: var(--text-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    min-width: var(--touch-minimum);
    min-height: var(--touch-minimum);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .expand-btn:hover {
    color: var(--text-secondary);
    background: var(--surface-subtle);
  }

  .expand-btn:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  /* Subcategory List */
  .subcategory-list {
    padding-left: var(--space-4);
    margin-left: var(--space-2);
    border-left: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .subcategory-btn {
    width: 100%;
    text-align: left;
    padding: var(--space-1-5) var(--space-2);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    min-height: var(--touch-compact);
    display: flex;
    align-items: center;
  }

  .subcategory-btn:hover {
    color: var(--text-primary);
  }

  .subcategory-btn:focus-visible {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  .subcategory-btn.active {
    color: var(--text-primary);
    font-weight: var(--font-medium);
    background: var(--surface-subtle);
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .category-btn,
    .expand-btn,
    .subcategory-btn {
      transition: none;
    }
  }
</style>
