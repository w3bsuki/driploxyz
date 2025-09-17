<script lang="ts">
  interface Props {
    heading: string;
    copy?: string;
    cta?: {
      label: string;
      action: () => void;
    };
    itemCount?: number;
    showCategoryTabs?: boolean;
    activeCategory?: 'fresh' | 'recent';
    onCategoryChange?: (category: 'fresh' | 'recent') => void;
    class?: string;
  }

  let {
    heading,
    copy,
    cta,
    itemCount,
    showCategoryTabs = false,
    activeCategory = 'fresh',
    onCategoryChange,
    class: className = ''
  }: Props = $props();

  // Category options for newest listings
  const categoryTabs = [
    { key: 'fresh' as const, label: 'Fresh Arrivals', subtitle: 'Last 24 hours' },
    { key: 'recent' as const, label: 'Recently Added', subtitle: 'This week' }
  ];
</script>

<div
  class="newest-listings-banner {className}"
>
  <div class="banner-content">
    <!-- Left side: Icon, Title, Subtitle -->
    <div class="banner-info">
      <div class="banner-icon">
        <svg class="icon-glyph" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div class="banner-text">
        <h2 class="banner-heading">
          {heading}
          {#if itemCount}
            <span class="item-count">
              {itemCount}
            </span>
          {/if}
        </h2>
        {#if copy}
          <p class="banner-copy">
            {copy}
          </p>
        {/if}
      </div>
    </div>

    <!-- Right side: Category Tabs and CTA controls -->
    <div class="banner-actions">
      {#if showCategoryTabs}
        <div class="category-tabs">
          {#each categoryTabs as tab}
            <button
              onclick={() => onCategoryChange?.(tab.key)}
              class="category-tab {activeCategory === tab.key ? 'active' : ''}"
              type="button"
              aria-pressed={activeCategory === tab.key}
            >
              <span class="tab-label">{tab.label}</span>
              <span class="tab-subtitle">{tab.subtitle}</span>
            </button>
          {/each}
        </div>
      {/if}

      {#if cta}
        <button
          onclick={cta.action}
          class="banner-cta"
          type="button"
        >
          <span>{cta.label}</span>
          <svg class="cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .newest-listings-banner {
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    margin: 0 0.75rem 1rem;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  }

  @media (min-width: 640px) {
    .newest-listings-banner {
      padding: 1.75rem 2rem;
      margin: 0 1rem 1.25rem;
    }
  }

  @media (min-width: 1024px) {
    .newest-listings-banner {
      padding: 2rem 2.5rem;
      margin: 0 1.5rem 1.5rem;
    }
  }

  .banner-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .banner-info {
    display: flex;
    align-items: center;
    gap: 1.1rem;
    flex: 1;
    min-width: 0;
  }

  .banner-icon {
    width: 3rem;
    height: 3rem;
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-strong);
  }

  .icon-glyph {
    width: 1.25rem;
    height: 1.25rem;
  }

  .banner-text {
    flex: 1;
    min-width: 0;
  }

  .banner-heading {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    line-height: var(--leading-snug);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-strong);
    flex-wrap: wrap;
  }

  .item-count {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-full);
    color: var(--text-strong);
    padding: 0.125rem 0.75rem;
  }

  .banner-copy {
    font-size: var(--text-sm);
    color: var(--text-subtle);
    margin: 0.5rem 0 0;
    line-height: var(--leading-snug);
  }

  .banner-actions {
    display: flex;
    align-items: center;
    gap: 1.125rem;
    flex-shrink: 0;
  }

  .category-tabs {
    display: flex;
    gap: 0.5rem;
    padding: 0.25rem;
    border-radius: var(--radius-full);
    border: 1px solid var(--border-subtle);
    background: var(--surface-subtle);
  }

  .category-tab {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
    padding: 0.5rem 0.85rem;
    border: none;
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--text-subtle);
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
    min-width: 96px;
  }

  .category-tab.active,
  .category-tab:focus-visible {
    background: var(--surface-base);
    color: var(--text-strong);
    box-shadow: inset 0 0 0 1px var(--border-strong);
    outline: none;
  }

  .category-tab:hover {
    background: var(--surface-hover);
    color: var(--text-strong);
  }

  .tab-label {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    white-space: nowrap;
  }

  .tab-subtitle {
    font-size: var(--text-xs);
    font-weight: var(--font-normal);
    color: var(--text-subtle);
    white-space: nowrap;
  }

  .banner-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1rem;
    background: var(--surface-base);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
    color: var(--text-strong);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .banner-cta:hover {
    background: var(--surface-hover);
  }

  .banner-cta:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .banner-cta:active {
    background: var(--surface-subtle);
  }

  .cta-icon {
    width: 1rem;
    height: 1rem;
  }

  @media (max-width: 900px) {
    .newest-listings-banner {
      padding: 1.5rem;
      margin: 0 1rem 1.25rem;
    }

    .banner-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.25rem;
    }

    .banner-actions {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      gap: 0.75rem;
    }

    .category-tabs {
      justify-content: flex-start;
      width: 100%;
      flex-wrap: wrap;
    }

    .banner-cta {
      align-self: flex-start;
    }
  }

  @media (max-width: 520px) {
    .category-tabs {
      flex-direction: column;
      gap: 0.4rem;
      padding: 0.35rem;
    }

    .category-tab {
      width: 100%;
      min-width: 0;
      align-items: center;
    }

    .banner-cta {
      width: 100%;
      justify-content: center;
    }
  }
</style>
