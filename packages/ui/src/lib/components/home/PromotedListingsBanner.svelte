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
  }

  const classes = {
    shell: 'relative isolate w-full overflow-hidden rounded-lg border border-white/12 bg-sky-600/95 px-4 py-5 text-white shadow-md shadow-sky-950/10 sm:px-6 sm:py-6 lg:px-8 lg:py-7',
    layout: 'mx-auto flex w-full max-w-screen-xl flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between md:gap-8',
    copyStack: 'mx-auto flex w-full max-w-sm flex-col items-center gap-2.5 text-center sm:max-w-md md:mx-0 md:items-start md:text-left',
    meta: 'inline-flex items-center gap-1 rounded-full bg-white/16 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85 backdrop-blur',
    heading: 'text-[clamp(1.5rem,4vw,2.2rem)] font-semibold leading-tight',
    description: 'text-sm text-white/75 sm:text-base',
    controls: 'grid w-full gap-3 justify-items-stretch sm:max-w-md md:max-w-lg md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4',
    toggleGroup: 'grid w-full grid-cols-2 gap-1 rounded-full border border-white/18 bg-white/10 p-1 text-sm font-semibold text-white/80 backdrop-blur md:w-auto',
    toggleButton: 'w-full rounded-full px-3 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    toggleButtonActive: 'bg-white text-sky-600 shadow-sm',
    toggleButtonInactive: 'text-white/80 hover:bg-white/15',
    navButtons: 'flex w-full items-center justify-center gap-2 md:w-auto md:justify-self-end',
    navButton: 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    ctaButton: 'inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-sky-600 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-500 md:w-auto md:justify-self-end md:text-base'
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

  const resolvedCopy = $derived(copy ?? 'Signal-boosted drops from our top sellers and standout brands.');
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

      <h2 class={classes.heading}>{heading}</h2>

      {#if resolvedCopy}
        <p class={`${classes.description} line-clamp-2`}>{resolvedCopy}</p>
      {/if}
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
  </div>
</section>
