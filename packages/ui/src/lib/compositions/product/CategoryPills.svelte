<script lang="ts">
  /**
   * CategoryPills - Horizontal pill row built on CategoryPill primitive
   * Standardized across pages (main/search/category) with keyboard nav and counts
   */
  import * as CategoryPillMod from '../../primitives/pill/CategoryPill.svelte';
  const CategoryPill = (CategoryPillMod as any).default ?? (CategoryPillMod as any);

  interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    count?: number;
  }

  interface Props {
    categories: Category[];
    activeCategory?: string | null;
    onCategorySelect?: (slug: string | null) => void;
    showAllButton?: boolean;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }

  let {
    categories = [],
    activeCategory = null,
    onCategorySelect,
    showAllButton = true,
    size = 'md',
    class: className = ''
  }: Props = $props();

  function handleCategoryClick(slug: string | null) {
    onCategorySelect?.(slug);
  }

  // Keyboard navigation (Arrow keys/Home/End)
  function handleKeydown(e: KeyboardEvent, index: number) {
    const pills = document.querySelectorAll('[data-role="category-pill-button"]') as NodeListOf<HTMLButtonElement>;
    const total = pills.length;
    let nextIndex = index;
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); nextIndex = Math.min(index + 1, total - 1); break;
      case 'ArrowLeft': e.preventDefault(); nextIndex = Math.max(index - 1, 0); break;
      case 'Home': e.preventDefault(); nextIndex = 0; break;
      case 'End': e.preventDefault(); nextIndex = total - 1; break;
      default: return;
    }
    pills[nextIndex]?.focus();
  }
</script>

<!-- Category Pills Container -->
<div class="w-full {className}">
  <div
    class="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
    style="padding-left: max(16px, env(safe-area-inset-left)); padding-right: max(16px, env(safe-area-inset-right));"
    role="tablist"
    aria-label="Filter by category"
  >
    {#if showAllButton}
      <CategoryPill
        label="All"
        variant={activeCategory === null ? 'primary' : 'muted'}
        size={size}
        emoji="🌐"
        ariaLabel="All"
        ariaCurrent={activeCategory === null ? 'page' : false}
        onclick={() => handleCategoryClick(null)}
        onkeydown={(e: KeyboardEvent) => handleKeydown(e, 0)}
        class="snap-start"
        data-role="category-pill-button"
      />
    {/if}

    {#each categories as category, i (category.id)}
      {@const isActive = activeCategory === category.slug}
      <CategoryPill
        label={category.name}
        variant={isActive ? 'primary' : 'secondary'}
        size={size}
        ariaLabel={`Filter by ${category.name}`}
        ariaCurrent={isActive ? 'page' : false}
        onclick={() => handleCategoryClick(category.slug)}
        onkeydown={(e: KeyboardEvent) => handleKeydown(e, (showAllButton ? 1 : 0) + i)}
        class="snap-start"
        data-role="category-pill-button"
        itemCount={category.count}
        showItemCount={category.count !== undefined && category.count > 0}
      />
    {/each}
  </div>
</div>

<style>
  /* Hide scrollbar but keep functionality */
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .snap-x { scroll-snap-type: x mandatory; }
  .snap-start { scroll-snap-align: start; }
</style>
