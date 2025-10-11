<script lang="ts">
  interface Props {
    title: string;
    subtitle?: string;
    variant?: 'newest' | 'promoted' | 'sellers' | 'default';
    density?: 'default' | 'compact';
    itemCount?: number;
    showNavigation?: boolean;
    onScrollLeft?: () => void;
    onScrollRight?: () => void;
    onViewAll?: () => void;
    showViewAll?: boolean;
    showToggle?: boolean;
    activeTab?: 'sellers' | 'brands';
    onToggle?: (tab: 'sellers' | 'brands') => void;
    class?: string;
    separator?: boolean;
    colorTheme?: 'subtle' | 'accent' | 'gradient' | 'charcoal' | 'navy' | 'graphite';
  }

  let {
    title,
    subtitle,
    variant = 'default',
    density = 'default',
    itemCount,
    showNavigation = false,
    onScrollLeft,
    onScrollRight,
    onViewAll,
    showViewAll = false,
    showToggle = false,
    activeTab = 'sellers',
    onToggle,
    class: className = '',
    separator = false,
    colorTheme = 'charcoal'
  }: Props = $props();

  const variantClass = $derived(`section-banner-${variant}`);
  const densityClass = $derived(density === 'compact' ? 'section-banner-compact' : '');

  // Clean separator styling with proper color themes
  const separatorClasses = $derived(() => {
    if (!separator) return '';

    const baseClasses = 'py-3 sm:py-4 mx-2 sm:mx-4 lg:mx-6 px-4 sm:px-6 rounded-[var(--radius-sm)] mb-3 sm:mb-4';

    switch (colorTheme) {
      case 'charcoal':
        return `${baseClasses} bg-gray-900 text-white`;
      case 'navy':
        return `${baseClasses} bg-blue-900 text-white`;
      case 'graphite':
        return `${baseClasses} bg-slate-800 text-white`;
      case 'accent':
        return `${baseClasses} bg-blue-50 text-blue-900`;
      case 'gradient':
        return `${baseClasses} bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900`;
      case 'subtle':
      default:
        return `${baseClasses} bg-gray-100 text-gray-900`;
    }
  });

  const iconForVariant = $derived(() => {
    switch (variant) {
      case 'newest':
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>`;
      case 'promoted':
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>`;
      case 'sellers':
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>`;
      default:
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>`;
    }
  });
</script>

<div class="section-banner {variantClass} {densityClass} {separatorClasses} {className}">
  <div class="section-banner-content">
    <!-- Left side: Icon, Title, Subtitle -->
    <div class="section-banner-info">
      <div class="section-banner-icon">
        {@html iconForVariant()}
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

    <!-- Right side: Toggle and Navigation controls -->
    <div class="section-banner-actions">
      {#if showToggle}
        <div class="section-banner-toggle">
          <button
            onclick={() => onToggle?.('sellers')}
            class="section-banner-toggle-btn {activeTab === 'sellers' ? 'active' : ''}"
            type="button"
            aria-pressed={activeTab === 'sellers'}
          >
            Sellers
          </button>
          <button
            onclick={() => onToggle?.('brands')}
            class="section-banner-toggle-btn {activeTab === 'brands' ? 'active' : ''}"
            type="button"
            aria-pressed={activeTab === 'brands'}
          >
            Brands
          </button>
        </div>
      {/if}

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
