<script lang="ts">
  interface Props {
    heading: string;
    copy?: string;
    cta?: {
      label: string;
      action: () => void;
    };
    itemCount?: number;
    showNavigation?: boolean;
    showToggle?: boolean;
    activeTab?: 'sellers' | 'brands';
    onToggle?: (tab: 'sellers' | 'brands') => void;
    onScrollLeft?: () => void;
    onScrollRight?: () => void;
    class?: string;
  }

  let {
    heading,
    copy,
    cta,
    itemCount,
    showNavigation = false,
    showToggle = false,
    activeTab = 'sellers',
    onToggle,
    onScrollLeft,
    onScrollRight,
    class: className = ''
  }: Props = $props();
</script>

<div
  class="promoted-listings-banner {className}"
>
  <div class="banner-content">
    <!-- Left side: Icon, Title, Subtitle -->
    <div class="banner-info">
      <div class="banner-icon">
        <svg class="icon-glyph" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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

    <!-- Right side: Toggle, CTA and Navigation controls -->
    <div class="banner-actions">
      {#if showToggle}
        <div class="banner-toggle">
          <button
            onclick={() => onToggle?.('sellers')}
            class="toggle-btn {activeTab === 'sellers' ? 'active' : ''}"
            type="button"
            aria-pressed={activeTab === 'sellers'}
          >
            Sellers
          </button>
          <button
            onclick={() => onToggle?.('brands')}
            class="toggle-btn {activeTab === 'brands' ? 'active' : ''}"
            type="button"
            aria-pressed={activeTab === 'brands'}
          >
            Brands
          </button>
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

      {#if showNavigation}
        <div class="banner-nav">
          <button
            onclick={onScrollLeft}
            class="nav-btn"
            type="button"
            aria-label="Scroll left"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onclick={onScrollRight}
            class="nav-btn"
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

<style>
  .promoted-listings-banner {
    background: var(--surface-base);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    margin: 0 0.75rem 1rem;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  }

  @media (min-width: 640px) {
    .promoted-listings-banner {
      padding: 1.75rem 2rem;
      margin: 0 1rem 1.25rem;
    }
  }

  @media (min-width: 1024px) {
    .promoted-listings-banner {
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
    gap: 1rem;
    flex-shrink: 0;
  }

  .banner-toggle {
    display: inline-flex;
    gap: 0.4rem;
    padding: 0.25rem;
    border-radius: var(--radius-full);
    border: 1px solid var(--border-subtle);
    background: var(--surface-subtle);
  }

  .toggle-btn {
    padding: 0.5rem 0.85rem;
    border-radius: var(--radius-full);
    border: none;
    background: transparent;
    color: var(--text-subtle);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .toggle-btn.active,
  .toggle-btn:focus-visible {
    background: var(--surface-base);
    color: var(--text-strong);
    box-shadow: inset 0 0 0 1px var(--border-strong);
    outline: none;
  }

  .toggle-btn:hover {
    background: var(--surface-hover);
    color: var(--text-strong);
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

  .banner-nav {
    display: inline-flex;
    gap: 0.35rem;
  }

  .nav-btn {
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-subtle);
    background: var(--surface-subtle);
    color: var(--text-strong);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .nav-btn:hover {
    background: var(--surface-hover);
  }

  .nav-btn:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .nav-btn svg {
    width: 1rem;
    height: 1rem;
  }

  @media (max-width: 900px) {
    .promoted-listings-banner {
      padding: 1.5rem;
      margin: 0 1rem 1.25rem;
    }

    .banner-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.25rem;
    }

    .banner-actions {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }

    .banner-toggle {
      width: 100%;
      justify-content: center;
    }

    .banner-nav {
      width: 100%;
      justify-content: space-between;
    }

    .banner-cta {
      align-self: flex-start;
    }
  }

  @media (max-width: 520px) {
    .banner-toggle {
      flex-direction: column;
      gap: 0.35rem;
      padding: 0.35rem;
    }

    .toggle-btn,
    .banner-cta,
    .banner-nav {
      width: 100%;
    }

    .banner-cta {
      justify-content: center;
    }

    .banner-nav {
      gap: 0.5rem;
    }

    .nav-btn {
      width: 100%;
      height: 2.5rem;
    }
  }
</style>
