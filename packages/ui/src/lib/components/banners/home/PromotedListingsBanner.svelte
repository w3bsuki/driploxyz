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
    // Optional tiny preview thumbnails to add visual interest
    previews?: Array<{ src: string; alt?: string }>;
  }

  const classes = {
    // Professional white card shell
    shell: 'relative isolate w-full overflow-hidden rounded-[var(--radius-sm)] border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm sm:px-6 sm:py-4 lg:px-8 lg:py-5 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-indigo-600/80 before:content-[""]',
    layout: 'mx-auto flex w-full max-w-screen-xl flex-col items-center gap-2 sm:gap-3 text-center',
    copyStack: 'flex flex-col items-center gap-1',
    meta: 'inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600 border border-slate-200',
    heading: 'text-xl font-semibold leading-tight sm:text-2xl lg:text-2xl text-slate-900',
    controls: 'flex flex-col items-center gap-2 sm:gap-3 w-full md:flex-row md:flex-wrap md:justify-center',
    // Neutral segmented control with indigo accent for active
    toggleGroup: 'grid grid-cols-2 gap-1 rounded-[var(--radius-sm)] border border-slate-300 bg-white p-1 text-sm font-medium text-slate-700',
    toggleButton: 'rounded-[var(--radius-sm)] px-3.5 py-2.5 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white min-h-[40px]',
    toggleButtonActive: 'bg-indigo-600 text-white',
    toggleButtonInactive: 'text-slate-700 hover:bg-slate-50',
    // Indigo accent CTA
    ctaButton: 'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-5 sm:py-3 sm:text-base min-h-[40px]',
    // Optional navigation buttons (if enabled by consumer)
    navButtons: 'hidden md:flex items-center gap-2',
    navButton: 'inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 h-10 w-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
    ,
    // Optional preview strip
    previewsRow: 'mt-1 flex items-center justify-center gap-2',
    previewImg: 'h-8 w-8 rounded-[calc(var(--radius-sm)-2px)] object-cover border border-slate-200'
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
    class: className = ''
  }: Props = $props();

  const tabs = [
    { id: 'sellers', label: 'Sellers' },
    { id: 'brands', label: 'Brands' }
  ] as const;

  const resolvedCopy = $derived(copy ?? 'Trending now from trusted sellers and standout brands.');
  const ctaLabel = $derived(cta?.label ?? 'View all');

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
        <p class={classes.meta}>{itemCount} curated picks</p>
      {/if}

      <h2 class={classes.heading}>
        <span class="inline-flex items-center gap-2">
          <svg aria-hidden="true" viewBox="0 0 20 20" class="h-5 w-5 text-indigo-600"><path fill="currentColor" d="M11.3 1.05a.75.75 0 0 1 .61.43l2.2 4.45 4.9.71a.75.75 0 0 1 .41 1.28l-3.55 3.46.84 4.88a.75.75 0 0 1-1.09.79L10 15.88l-4.62 2.43a.75.75 0 0 1-1.09-.79l.84-4.88L1.58 7.92a.75.75 0 0 1 .41-1.28l4.9-.71 2.2-4.45a.75.75 0 0 1 1.21-.43Z"/></svg>
          <span>{heading}</span>
        </span>
      </h2>
      <p class="max-w-[60ch] text-xs sm:text-sm text-slate-600">{resolvedCopy}</p>
    </div>

    <div class={classes.controls}>
      {#if showToggle}
        <div class="w-full md:w-auto md:justify-self-start">
          <div class={classes.toggleGroup} role="group" aria-label="Promoted listings filter">
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
            aria-label="View previous promoted set"
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
            aria-label="View next promoted set"
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

    {#if previews && previews.length}
      <div class={classes.previewsRow}>
        {#each previews.slice(0, 6) as img}
          <img src={img.src} alt={img.alt ?? ''} class={classes.previewImg} loading="lazy" />
        {/each}
      </div>
    {/if}
  </div>
</section>
