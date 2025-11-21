<script lang="ts">
  type ToggleTab = 'sellers' | 'brands';

  interface BannerCta {
    label: string;
    action: () => void;
  }

  interface Props {
    heading: string;
    copy?: string;
    cta?: BannerCta;
    itemCount?: number;
    showNavigation?: boolean;
    showToggle?: boolean;
    activeTab?: ToggleTab;
    onToggle?: (tab: ToggleTab) => void;
    onScrollLeft?: () => void;
    onScrollRight?: () => void;
    class?: string;
    translations?: {
      curatedPicks?: string;
      defaultCopy?: string;
      tabSellers?: string;
      tabBrands?: string;
      viewAll?: string;
      ariaPrevious?: string;
      ariaNext?: string;
    };
  }

  const classes = {
    shell: `
      relative isolate w-full overflow-hidden
      rounded-[var(--radius-sm)]
      bg-[color:var(--brand-accent)] text-[color:var(--text-inverse)]
      px-[var(--space-4)] py-[var(--space-3)]
      shadow-[var(--shadow-sm)]
      sm:px-[var(--space-6)] sm:py-[var(--space-4)]
    `.replace(/\s+/g, ' ').trim(),
    layout: `
      mx-auto flex w-full max-w-[min(100%,72rem)] flex-col items-center
      gap-[var(--space-2)] text-center
    `.replace(/\s+/g, ' ').trim(),
    copyStack: 'flex flex-col items-center gap-[var(--space-1)] text-balance',
    meta: `
      inline-flex items-center gap-[var(--space-1)] rounded-full m-0
      bg-[color-mix(in_oklch,var(--text-inverse)_15%,transparent)]
      px-[var(--space-2)] py-[var(--space-1)]
      text-[length:var(--text-xs)] font-[var(--font-semibold)] uppercase tracking-[0.1em]
      text-[color:var(--text-inverse)]
    `.replace(/\s+/g, ' ').trim(),
    heading: `
  text-[length:var(--text-xl)] font-[var(--font-bold)] leading-[var(--leading-tight)] m-0
  text-[color:var(--text-inverse)]
      sm:text-[length:var(--text-2xl)] lg:text-[length:var(--text-3xl)]
    `.replace(/\s+/g, ' ').trim(),
    controls: `
      flex flex-col items-center gap-[var(--space-2)] w-full
      md:flex-row md:flex-wrap md:justify-center md:gap-[var(--space-2)]
    `.replace(/\s+/g, ' ').trim(),
    toggleGroup: `
      grid grid-cols-2 gap-[var(--space-1)] rounded-[var(--radius-md)]
      bg-[color-mix(in_oklch,var(--text-inverse)_10%,transparent)]
      p-[var(--space-1)] text-[length:var(--text-sm)] font-[var(--font-medium)]
    `.replace(/\s+/g, ' ').trim(),
    toggleButton: `
      rounded-[var(--radius-sm)] px-[var(--space-3)] py-[var(--space-2)]
      text-center transition-colors duration-150
      focus-visible:outline-none focus-visible:ring-2
      focus-visible:ring-[color:var(--text-inverse)]
      focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--brand-accent)]
      min-h-[var(--touch-standard)]
    `.replace(/\s+/g, ' ').trim(),
    toggleButtonActive: 'bg-[color:var(--text-inverse)] text-[color:var(--text-elegant)]',
    toggleButtonInactive: 'text-[color:var(--text-inverse)] hover:bg-[color-mix(in_oklch,var(--text-inverse)_20%,transparent)]',
    ctaButton: `
      inline-flex items-center justify-center gap-[var(--space-1)]
      rounded-[var(--radius-md)] bg-[color:var(--text-inverse)]
      px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-sm)]
      font-[var(--font-semibold)] text-[color:var(--text-elegant)] transition-colors duration-150
      hover:bg-[color-mix(in_oklch,var(--text-inverse)_92%,transparent)]
      focus-visible:outline-none focus-visible:ring-2
      focus-visible:ring-[color:var(--text-inverse)]
      focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--brand-accent)]
      sm:px-[var(--space-5)] sm:text-[length:var(--text-base)]
      min-h-[var(--touch-standard)]
    `.replace(/\s+/g, ' ').trim(),
    navButtons: 'hidden md:flex items-center gap-[var(--space-2)]',
    navButton: `
      inline-flex h-[var(--touch-standard)] w-[var(--touch-standard)]
      items-center justify-center rounded-[var(--radius-md)]
      bg-[color-mix(in_oklch,var(--text-inverse)_15%,transparent)]
      text-[color:var(--text-inverse)] transition-colors duration-150
      hover:bg-[color-mix(in_oklch,var(--text-inverse)_25%,transparent)]
      focus-visible:outline-none focus-visible:ring-2
      focus-visible:ring-[color:var(--text-inverse)]
      focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--brand-accent)]
    `.replace(/\s+/g, ' ').trim()
  } as const;

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
    class: className = '',
    translations
  }: Props = $props();

  const tabs = $derived([
    { id: 'sellers' as const, label: translations?.tabSellers ?? 'Sellers' },
    { id: 'brands' as const, label: translations?.tabBrands ?? 'Brands' }
  ]);

  const resolvedCopy = $derived(copy ?? translations?.defaultCopy ?? '');
  const ctaLabel = $derived(cta?.label ?? translations?.viewAll ?? 'View all');

  function handleTabChange(tab: ToggleTab) {
    if (tab !== activeTab) {
      onToggle?.(tab);
    }
  }

  function handleCtaClick() {
    if (cta?.action) {
      cta.action();
      return;
    }

    onScrollRight?.();
  }
</script>

<section class={`${classes.shell} ${className}`} aria-label={heading}>
  <div class={classes.layout}>
    <div class={classes.copyStack}>
      {#if itemCount}
        <p class={classes.meta}>{itemCount} {translations?.curatedPicks ?? 'curated picks'}</p>
      {/if}

      <h2 class={classes.heading}>{heading}</h2>
  <p class="max-w-[60ch] text-[length:var(--text-sm)] leading-[1.5] text-[color:var(--text-inverse)] opacity-90 m-0">{resolvedCopy}</p>
    </div>

    <div class={classes.controls}>
      {#if showToggle}
        <div class="w-full md:w-auto md:justify-self-start">
          <div class={classes.toggleGroup} role="group" aria-label={heading}>
            {#each tabs as tab}
              <button
                type="button"
                class={`${classes.toggleButton} ${activeTab === tab.id ? classes.toggleButtonActive : classes.toggleButtonInactive}`}
                aria-pressed={activeTab === tab.id}
                onclick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if showNavigation}
        <div class={classes.navButtons}>
          <button
            type="button"
            class={classes.navButton}
            onclick={() => onScrollLeft?.()}
            aria-label={translations?.ariaPrevious ?? 'View previous promoted set'}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="h-5 w-5">
              <path
                fill-rule="evenodd"
                d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button
            type="button"
            class={classes.navButton}
            onclick={() => onScrollRight?.()}
            aria-label={translations?.ariaNext ?? 'View next promoted set'}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="h-5 w-5">
              <path
                fill-rule="evenodd"
                d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      {/if}

      <button
        type="button"
        class={classes.ctaButton}
        onclick={handleCtaClick}
      >
        <span>{ctaLabel}</span>
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</section>
