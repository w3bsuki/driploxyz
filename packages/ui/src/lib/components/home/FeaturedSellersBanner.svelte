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

  const styles = {
    wrapper: 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 text-white',
    meta: 'inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur',
    heading: 'text-2xl font-semibold tracking-tight sm:text-3xl',
    description: 'text-sm text-white/80 sm:text-base',
    toggleGroup: 'inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 text-sm font-semibold text-white/80 backdrop-blur',
    toggleButton: 'rounded-full px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    toggleButtonActive: 'bg-white text-emerald-600 shadow-sm',
    toggleButtonInactive: 'text-white/80 hover:bg-white/10',
    primaryButton: 'inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-500 sm:text-base'
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

  const resolvedCopy = $derived(copy ?? 'Spotlighted sellers with stellar reviews and fast shipping.');

  function handleTabChange(tab: SellerTab) {
    if (tab !== activeTab) {
      onToggle?.(tab);
    }
  }
</script>

<section
  class={`relative overflow-hidden rounded-3xl border border-white/20 px-5 py-6 shadow-lg sm:px-8 sm:py-8 lg:px-12 lg:py-10 ${styles.wrapper} ${className}`}
  aria-label={heading}
>
  <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
    <div class="space-y-3 md:max-w-xl">
      {#if itemCount}
        <p class={styles.meta}>{itemCount} profiles</p>
      {/if}

      <h2 class={styles.heading}>{heading}</h2>

      {#if resolvedCopy}
        <p class={styles.description}>{resolvedCopy}</p>
      {/if}
    </div>

    <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      {#if showToggle}
        <div class={styles.toggleGroup} role="group" aria-label="Featured sellers toggle">
          {#each tabs as tab}
            <button
              type="button"
              class={`${styles.toggleButton} ${activeTab === tab.id ? styles.toggleButtonActive : styles.toggleButtonInactive}`}
              aria-pressed={activeTab === tab.id}
              onclick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          {/each}
        </div>
      {/if}

      {#if cta}
        <button
          type="button"
          class={`${styles.primaryButton} w-full sm:w-auto`}
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
