<script lang="ts">
  interface Props {
    title: string;
    subtitle?: string;
    variant?: 'newest' | 'promoted' | 'sellers' | 'default';
    itemCount?: number;
    showNavigation?: boolean;
    onScrollLeft?: () => void;
    onScrollRight?: () => void;
    onViewAll?: () => void;
    showViewAll?: boolean;
    class?: string;
  }

  let {
    title,
    subtitle,
    variant = 'default',
    itemCount,
    showNavigation = false,
    onScrollLeft,
    onScrollRight,
    onViewAll,
    showViewAll = false,
    class: className = ''
  }: Props = $props();

  const variantClass = $derived(`section-banner-${variant}`);
  const iconForVariant = $derived(() => {
    switch (variant) {
      case 'newest': return '⚡';
      case 'promoted': return '🌟';
      case 'sellers': return '👑';
      default: return '📦';
    }
  });
</script>

<div class="section-banner {variantClass} {className}">
  <div class="section-banner-content">
    <!-- Left side: Icon, Title, Subtitle -->
    <div class="section-banner-info">
      <div class="section-banner-icon">
        {iconForVariant()}
      </div>
      <div class="section-banner-text">
        <h2 class="section-banner-title">
          {title}
          {#if itemCount}
            <span class="section-banner-count">
              {itemCount}
            </span>
          {/if}
        </h2>
        {#if subtitle}
          <p class="section-banner-subtitle">
            {subtitle}
          </p>
        {/if}
      </div>
    </div>

    <!-- Right side: Navigation controls -->
    <div class="section-banner-actions">
      {#if showViewAll}
        <button
          onclick={onViewAll}
          class="section-banner-view-all"
          type="button"
        >
          <span>View All</span>
          <svg class="section-banner-view-all-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      {/if}

      {#if showNavigation}
        <div class="section-banner-nav">
          <button
            onclick={onScrollLeft}
            class="section-banner-nav-btn"
            type="button"
            aria-label="Scroll left"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onclick={onScrollRight}
            class="section-banner-nav-btn"
            type="button"
            aria-label="Scroll right"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>