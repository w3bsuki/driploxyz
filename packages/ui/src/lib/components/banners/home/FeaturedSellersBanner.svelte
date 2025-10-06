<script lang="ts">
  type SellerTab = 'sellers' | 'brands';

  interface BannerCta {
    label: string;
    action: () => void;
  }

  interface Props {
    heading: string;
    copy?: string;
    cta?: BannerCta;
    itemCount?: number;
    showToggle?: boolean;
    activeTab?: SellerTab;
    onToggle?: (tab: SellerTab) => void;
    class?: string;
  }

  const classes = {
    // Professional white card shell
  shell: 'relative isolate w-full overflow-hidden rounded-[var(--radius-sm)] border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm sm:px-5 sm:py-4 lg:px-7 lg:py-[18px]',
    layout: 'mx-auto flex w-full max-w-screen-xl flex-col items-center gap-1 sm:gap-1.5 text-center',
    copyStack: 'flex flex-col items-center gap-0.5',
    meta: 'inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600 border border-slate-200',
    heading: 'text-[1.4rem] font-semibold leading-tight text-slate-900 sm:text-[1.675rem] lg:text-[1.75rem]',
    controls: 'flex flex-col items-center gap-1 sm:gap-1.5 w-full md:flex-row md:flex-wrap md:justify-center md:gap-1.5',
    // Neutral segmented control with emerald accent for active
  toggleGroup: 'grid grid-cols-2 gap-1 rounded-[var(--radius-sm)] border border-slate-300 bg-white p-1 text-sm font-medium text-slate-700',
    toggleButton: 'rounded-[var(--radius-sm)] px-3.5 py-2.5 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white min-h-[44px]',
    toggleButtonActive: 'bg-emerald-600 text-white',
    toggleButtonInactive: 'text-slate-700 hover:bg-slate-50',
    // Emerald accent CTA
  ctaButton: 'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-5 sm:py-3 sm:text-base min-h-[44px]'
  } as const;

  let {
    heading,
    copy,
    cta,
    itemCount,
    showToggle = true,
    activeTab = 'sellers',
    onToggle,
    class: className = ''
  }: Props = $props();

  const tabs = [
    { id: 'sellers', label: 'Sellers' },
    { id: 'brands', label: 'Brands' }
  ] as const;

  const resolvedCopy = $derived(copy ?? 'Standout sellers with great ratings and fast shipping.');

  function handleTabChange(tab: SellerTab) {
    if (tab !== activeTab) {
      onToggle?.(tab);
    }
  }
</script>

<section class={`${classes.shell} ${className}`} aria-label={heading}>
  <div class={classes.layout}>
    <div class={classes.copyStack}>
      {#if itemCount}
        <p class={classes.meta}>{itemCount} profiles</p>
      {/if}

      <h2 class={classes.heading}>{heading}</h2>
  <p class="max-w-[60ch] text-[13px] leading-snug text-slate-600 sm:text-sm">{resolvedCopy}</p>
    </div>

    <div class={classes.controls}>
      {#if showToggle}
        <div class="w-full md:w-auto md:justify-self-start">
          <div class={classes.toggleGroup} role="group" aria-label="Featured sellers toggle">
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

      {#if cta}
        <button
          type="button"
          class={classes.ctaButton}
          onclick={() => cta.action?.()}
        >
          <span>{cta.label}</span>
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      {/if}
    </div>

  </div>
</section>
