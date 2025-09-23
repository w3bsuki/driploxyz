<script lang="ts">
  interface BadgeConfig {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    color: string;
    clickable: boolean;
    onClick?: () => void;
  }

  interface Props {
    showProtection?: boolean;
    showSecurePayment?: boolean;
    showReturnPolicy?: boolean;
    showAuthenticity?: boolean;
    layout?: 'horizontal' | 'vertical' | 'grid';
    size?: 'sm' | 'md';
    className?: string;
    onProtectionClick?: () => void;
    onReturnPolicyClick?: () => void;
  }

  let { 
    showProtection = true,
    showSecurePayment = true,
    showReturnPolicy = true,
    showAuthenticity = false,
    layout = 'horizontal',
    size = 'md',
    className = '',
    onProtectionClick,
    onReturnPolicyClick
  }: Props = $props();

  const badges = $derived((): BadgeConfig[] => {
    const badgeList: BadgeConfig[] = [];

    if (showProtection) {
      badgeList.push({
        id: 'protection',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>`,
        title: 'Driplo Protection',
        subtitle: 'Secure purchase guarantee',
        color: 'text-[color:var(--status-success-solid)]',
        clickable: !!onProtectionClick,
        onClick: onProtectionClick
      });
    }

    if (showSecurePayment) {
      badgeList.push({
        id: 'payment',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>`,
        title: 'Secure Payment',
        subtitle: 'Encrypted transactions',
        color: 'text-[color:var(--status-info-solid)]',
        clickable: false
      });
    }

    if (showReturnPolicy) {
      badgeList.push({
        id: 'returns',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>`,
        title: 'Easy Returns',
        subtitle: '3-day return policy',
        color: 'text-[color:var(--brand-primary)]',
        clickable: !!onReturnPolicyClick,
        onClick: onReturnPolicyClick
      });
    }

    if (showAuthenticity) {
      badgeList.push({
        id: 'authenticity',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
        </svg>`,
        title: 'Verified Authentic',
        subtitle: 'Quality guaranteed',
        color: 'text-[color:var(--status-warning-solid)]',
        clickable: false
      });
    }

    return badgeList;
  });

  const containerClasses = $derived(() => {
    const base = 'trust-badges';
    const layoutClass = layout === 'horizontal' ? 'flex flex-wrap gap-3' : 
                       layout === 'vertical' ? 'flex flex-col gap-2' : 
                       'grid grid-cols-2 gap-2';
    return `${base} ${layoutClass} ${className}`;
  });

  const badgeClasses = $derived(() => {
    const sizeClasses = size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm';
    return `flex items-center gap-2 bg-[color:var(--surface-subtle)] border border-[color:var(--border-subtle)] rounded-[--radius-md] transition-colors ${sizeClasses}`;
  });

  const iconClasses = $derived(() => {
    return size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  });
</script>

<div class={containerClasses}>
  {#each badges() as badge}
    {#if badge.clickable}
      <button
        onclick={badge.onClick}
        class="{badgeClasses} hover:bg-[color:var(--surface-emphasis)] cursor-pointer"
      >
        <span class="{badge.color} {iconClasses}">
          {@html badge.icon}
        </span>
        <div class="flex-1 text-left">
          <div class="font-medium text-[color:var(--text-primary)]">
            {badge.title}
          </div>
          {#if size === 'md'}
            <div class="text-xs text-[color:var(--text-tertiary)]">
              {badge.subtitle}
            </div>
          {/if}
        </div>
        {#if badge.clickable}
          <svg class="w-3 h-3 text-[color:var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        {/if}
      </button>
    {:else}
      <div class={badgeClasses}>
        <span class="{badge.color} {iconClasses}">
          {@html badge.icon}
        </span>
        <div class="flex-1">
          <div class="font-medium text-[color:var(--text-primary)]">
            {badge.title}
          </div>
          {#if size === 'md'}
            <div class="text-xs text-[color:var(--text-tertiary)]">
              {badge.subtitle}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  {/each}
</div>

<style>
  button:focus-visible {
    outline: 2px solid var(--brand-primary);
    outline-offset: 2px;
  }
</style>