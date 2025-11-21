<script lang="ts">
  type Category = 'fresh' | 'recent';

  interface BannerCta {
    label: string;
    action: () => void;
  }

  interface Props {
    heading: string;
    copy?: string;
    cta?: BannerCta;
    itemCount?: number;
    itemCountText?: string;
    showCategoryTabs?: boolean;
    activeCategory?: Category;
    onCategoryChange?: (category: Category) => void;
    class?: string;
  }

  const classes = {
    shell: `
      relative isolate w-full overflow-hidden
      rounded-[var(--radius-sm)]
      bg-[color:var(--brand-primary-strong)] text-[color:var(--text-inverse)]
      px-[var(--space-4)] py-[var(--space-3)]
      shadow-[var(--shadow-sm)]
      sm:px-[var(--space-6)] sm:py-[var(--space-4)]
    `.replace(/\s+/g, ' ').trim(),
    layout: `
      mx-auto flex w-full max-w-[min(100%,72rem)] flex-col items-center
      gap-[var(--space-2)] text-center
    `.replace(/\s+/g, ' ').trim(),
    copyStack: 'flex flex-col items-center gap-[var(--space-1)]',
    meta: `
      inline-flex items-center gap-[var(--space-1)] rounded-full m-0
      bg-[color-mix(in_oklch,var(--text-inverse)_15%,transparent)]
      px-[var(--space-2)] py-[var(--space-1)]
      text-[length:var(--text-xs)] font-[var(--font-semibold)] uppercase tracking-[0.1em]
      text-[color:var(--text-inverse)]
    `.replace(/\s+/g, ' ').trim(),
    heading: `
  text-[length:var(--text-xl)] font-[var(--font-bold)] leading-[var(--leading-tight)] tracking-tight m-0
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
      focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--brand-primary-strong)]
      min-h-[var(--touch-standard)]
    `.replace(/\s+/g, ' ').trim(),
    toggleButtonActive: 'bg-[color:var(--text-inverse)] text-[color:var(--text-brand)]',
    toggleButtonInactive: 'text-[color:var(--text-inverse)] hover:bg-[color-mix(in_oklch,var(--text-inverse)_20%,transparent)]',
    ctaButton: `
      inline-flex items-center justify-center gap-[var(--space-1)]
      rounded-[var(--radius-md)] bg-[color:var(--text-inverse)]
      px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-sm)]
      font-[var(--font-semibold)] text-[color:var(--text-brand)] transition-colors duration-150
      hover:bg-[color-mix(in_oklch,var(--text-inverse)_92%,transparent)]
      focus-visible:outline-none focus-visible:ring-2
      focus-visible:ring-[color:var(--text-inverse)]
      focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--brand-primary-strong)]
      sm:px-[var(--space-5)] sm:text-[length:var(--text-base)]
      min-h-[var(--touch-standard)]
    `.replace(/\s+/g, ' ').trim()
  } as const;

  let {
    heading,
    copy,
    cta,
    itemCount,
    itemCountText,
    showCategoryTabs = true,
    activeCategory = 'fresh',
    onCategoryChange,
    class: className = ''
  }: Props = $props();

  const categoryTabs = [
    { id: 'fresh', label: 'Fresh arrivals' },
    { id: 'recent', label: 'Recently added' }
  ] as const;

  const resolvedCopy = $derived(copy ?? 'Fresh arrivals hitting the marketplace every day.');
  const ctaLabel = $derived(cta?.label ?? 'View all');

  function handleCategoryChange(category: Category) {
    if (category !== activeCategory) {
      onCategoryChange?.(category);
    }
  }

  function handleCtaClick() {
    cta?.action?.();
  }
</script>

<section class={`${classes.shell} ${className}`} aria-label={heading}>
  <div class={classes.layout}>
    <div class={classes.copyStack}>
      {#if itemCount}
        <p class={classes.meta}>{itemCountText || `${itemCount} new listings`}</p>
      {/if}

      <h2 class={classes.heading}>{heading}</h2>
  <p class="max-w-[60ch] text-[length:var(--text-sm)] leading-[1.5] text-[color:var(--text-inverse)] opacity-90 m-0">{resolvedCopy}</p>
    </div>

    <div class={classes.controls}>
      {#if showCategoryTabs}
        <div class="w-full md:w-auto md:justify-self-start">
          <div class={classes.toggleGroup} role="group" aria-label="Newest listings filters">
            {#each categoryTabs as tab}
              <button
                type="button"
                class={`${classes.toggleButton} ${activeCategory === tab.id ? classes.toggleButtonActive : classes.toggleButtonInactive}`}
                aria-pressed={activeCategory === tab.id}
                onclick={() => handleCategoryChange(tab.id)}
              >
                {tab.label}
              </button>
            {/each}
          </div>
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
