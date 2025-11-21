<script lang="ts">
  // Accessible, theme-aware Pill component
  // Svelte 5 ($props) - supports button or anchor rendering, toggleable state, optional count and dismiss action

  type Variant = 'solid' | 'soft' | 'outline' | 'ghost';
  // Keep tones conservative to available tokens; "brand" uses brand-primary, "neutral" uses surface/text tokens
  type Tone = 'neutral' | 'brand';
  type Size = 'sm' | 'md' | 'lg';
  type Radius = 'none' | 'sm' | 'md' | 'lg' | 'full';

  interface PillProps {
    label?: string;
    variant?: Variant;
    tone?: Tone;
    size?: Size;
  selected?: boolean; // toggled/pressed state for filter-like usage
    disabled?: boolean;
    loading?: boolean;
  radius?: Radius;

    // link vs button
    href?: string;
    rel?: string;
    target?: string;
    type?: 'button' | 'submit' | 'reset';

    // adornments
    emoji?: string; // quick start icon
    count?: number;
    showCount?: boolean;
    dismissible?: boolean; // shows an inline dismiss (x) button

    // a11y
    ariaLabel?: string;
    ariaCurrent?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;

    // events
    onClick?: (e: MouseEvent) => void;
    onDismiss?: (e: MouseEvent) => void;

    // misc
    id?: string;
    name?: string;
    value?: string;
    title?: string;
    class?: string;
    'data-pill-id'?: string;
    // Svelte 5 children render function
    children?: () => any;
  }

  let {
    label,
  variant = 'soft',
    tone = 'neutral',
    size = 'md',
  selected = false,
    disabled = false,
    loading = false,
  radius = 'sm',
    href,
    rel,
    target,
    type = 'button',
    emoji,
    count,
    showCount = false,
    dismissible = false,
    ariaLabel,
    ariaCurrent,
    onClick,
    onDismiss,
    id,
    name,
    value,
    title,
    class: className = '',
    'data-pill-id': dataPillId,
    children
  }: PillProps = $props();

  const sizeCfg = {
    sm: {
      base: 'px-2.5 py-1 text-xs min-h-[var(--touch-compact)]',
      icon: 'w-3 h-3',
      gap: 'gap-1'
    },
    md: {
      base: 'px-4 py-2 text-sm min-h-[var(--touch-standard)]',
      icon: 'w-4 h-4',
      gap: 'gap-1.5'
    },
    lg: {
      base: 'px-5 py-2.5 text-base min-h-[var(--touch-primary)]',
      icon: 'w-5 h-5',
      gap: 'gap-2'
    }
  } as const;

  // Variant/tone matrix using semantic tokens
  const toneNeutral = {
    solid:
      'bg-[color:var(--surface-emphasis)] text-[color:var(--text-inverse)] border-[color:var(--surface-emphasis)] hover:brightness-95',
    soft:
      'bg-[color:var(--surface-subtle)] text-[color:var(--text-primary)] border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-muted)]',
    outline:
      'bg-transparent text-[color:var(--text-primary)] border-[color:var(--border-default)] hover:bg-[color:var(--surface-subtle)]',
    ghost:
      'bg-transparent text-[color:var(--text-secondary)] border-transparent hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-primary)]'
  } as const;

  const toneBrand = {
    solid:
      'bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)] border-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary)]/90',
    soft:
      'bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)] border-[color:var(--brand-primary)]/30 hover:bg-[color:var(--brand-primary)]/15',
    outline:
      'bg-transparent text-[color:var(--brand-primary)] border-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary)]/10',
    ghost:
      'bg-transparent text-[color:var(--brand-primary)] border-transparent hover:bg-[color:var(--brand-primary)]/10'
  } as const;

  const variantTone = tone === 'brand' ? toneBrand : toneNeutral;
  const currentSize = sizeCfg[size];

  const radiusClassMap: Record<Radius, string> = {
    none: 'rounded-none',
    sm: 'rounded-[var(--radius-sm)]',
    md: 'rounded-[var(--radius-md)]',
    lg: 'rounded-[var(--radius-lg)]',
    full: 'rounded-full'
  };
  const radiusClass = radiusClassMap[radius];

  const base = `
    pill inline-flex items-center ${currentSize.gap} ${radiusClass} border font-medium
    transition-all duration-200 whitespace-nowrap shrink-0
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] focus-visible:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
    ${currentSize.base}
    ${variantTone[variant]}
    ${selected ? (tone === 'brand' ? 'ring-1 ring-[color:var(--brand-primary)] ring-offset-0' : 'ring-1 ring-[color:var(--border-default)] ring-offset-0') : ''}
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const hasLeft = !!emoji || loading;
  const hasCount = showCount && typeof count === 'number';

  const spinnerColor = variant === 'solid' && tone === 'brand' ? 'white' : 'gray';
</script>

{#if dismissible}
  <!-- Wrap in a group when dismissible to avoid nested interactive content -->
  <span class="inline-flex items-center gap-1" role="group" aria-label={ariaLabel ?? label}>
    {#if href}
      <a
        class={base}
        href={href}
        rel={rel}
        target={target}
        aria-current={ariaCurrent}
        aria-label={ariaLabel || (hasCount && typeof count === 'number' ? `${label ?? ''} (${count})` : label)}
        aria-busy={loading}
        data-pill
        data-pill-id={dataPillId}
        id={id}
        title={title}
        onclick={onClick}
      >
        {#if hasLeft}
          <span class={`inline-flex ${currentSize.icon} justify-center items-center`} aria-hidden="true">
            {#if loading}
              <svg viewBox="0 0 24 24" class={`animate-spin ${currentSize.icon}`} fill="none" role="img" aria-label="loading">
                <circle cx="12" cy="12" r="10" stroke="currentColor" class="opacity-20" stroke-width="4" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" class="opacity-60" stroke-width="4" stroke-linecap="round" />
              </svg>
            {:else if emoji}
              <span class="leading-none">{emoji}</span>
            {/if}
          </span>
        {/if}

        {#if children}
          {@render children()}
        {:else}
          <span class="truncate">{label}</span>
        {/if}

        {#if hasCount}
          <span
            class={`inline-flex items-center justify-center rounded-full font-semibold leading-none ml-1
            ${size === 'sm' ? 'text-[10px] px-1 py-0 min-w-4 h-3.5' : size === 'md' ? 'text-xs px-1 py-0 min-w-4 h-4' : 'text-sm px-1.5 py-0 min-w-5 h-5'}
            ${tone === 'brand' ? 'bg-[color:var(--brand-primary)]/15 text-[color:var(--brand-primary)]' : 'bg-[color:var(--surface-accent)] text-[color:var(--text-accent)]'}`}
            aria-hidden="true"
          >
            {count}
          </span>
        {/if}
      </a>
    {:else}
      <button
        class={base}
        type={type}
        name={name}
        value={value}
        aria-current={ariaCurrent}
        aria-label={ariaLabel || (hasCount && typeof count === 'number' ? `${label ?? ''} (${count})` : label)}
        aria-busy={loading}
        aria-pressed={selected}
        {disabled}
        data-pill
        data-pill-id={dataPillId}
        id={id}
        title={title}
        onclick={onClick}
      >
        {#if hasLeft}
          <span class={`inline-flex ${currentSize.icon} justify-center items-center`} aria-hidden="true">
            {#if loading}
              <svg viewBox="0 0 24 24" class={`animate-spin ${currentSize.icon}`} fill="none" role="img" aria-label="loading">
                <circle cx="12" cy="12" r="10" stroke="currentColor" class="opacity-20" stroke-width="4" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" class="opacity-60" stroke-width="4" stroke-linecap="round" />
              </svg>
            {:else if emoji}
              <span class="leading-none">{emoji}</span>
            {/if}
          </span>
        {/if}

        {#if children}
          {@render children()}
        {:else}
          <span class="truncate">{label}</span>
        {/if}

        {#if hasCount}
          <span
            class={`inline-flex items-center justify-center rounded-full font-semibold leading-none ml-1
            ${size === 'sm' ? 'text-[10px] px-1 py-0 min-w-4 h-3.5' : size === 'md' ? 'text-xs px-1 py-0 min-w-4 h-4' : 'text-sm px-1.5 py-0 min-w-5 h-5'}
            ${tone === 'brand' ? 'bg-[color:var(--brand-primary)]/15 text-[color:var(--brand-primary)]' : 'bg-[color:var(--surface-accent)] text-[color:var(--text-accent)]'}`}
            aria-hidden="true"
          >
            {count}
          </span>
        {/if}
      </button>
    {/if}

    <button
      type="button"
      class="inline-flex items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] px-1"
      onclick={(e) => { onDismiss?.(e); }}
      aria-label={`Remove ${label ?? ''}`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" class={`${currentSize.icon}`}>
        <path fill="currentColor" d="M6.3 6.3a1 1 0 0 1 1.4 0L10 8.6l2.3-2.3a1 1 0 1 1 1.4 1.4L11.4 10l2.3 2.3a1 1 0 1 1-1.4 1.4L10 11.4l-2.3 2.3a1 1 0 1 1-1.4-1.4L8.6 10 6.3 7.7a1 1 0 0 1 0-1.4Z" />
      </svg>
    </button>
  </span>
{:else}
  {#if href}
    <a
      class={base}
      href={href}
      rel={rel}
      target={target}
      aria-current={ariaCurrent}
      aria-label={ariaLabel || (hasCount && typeof count === 'number' ? `${label ?? ''} (${count})` : label)}
      aria-busy={loading}
      data-pill
      data-pill-id={dataPillId}
      id={id}
      title={title}
      onclick={onClick}
    >
      {#if hasLeft}
        <span class={`inline-flex ${currentSize.icon} justify-center items-center`} aria-hidden="true">
          {#if loading}
            <!-- simple spinner to avoid extra import weight -->
            <svg viewBox="0 0 24 24" class={`animate-spin ${currentSize.icon}`} fill="none" role="img" aria-label="loading">
              <circle cx="12" cy="12" r="10" stroke="currentColor" class="opacity-20" stroke-width="4" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" class="opacity-60" stroke-width="4" stroke-linecap="round" />
            </svg>
          {:else if emoji}
            <span class="leading-none">{emoji}</span>
          {/if}
        </span>
      {/if}

      {#if children}
        {@render children()}
      {:else}
        <span class="truncate">{label}</span>
      {/if}

      {#if hasCount}
        <span
          class={`inline-flex items-center justify-center rounded-full font-semibold leading-none ml-1
          ${size === 'sm' ? 'text-[10px] px-1 py-0 min-w-4 h-3.5' : size === 'md' ? 'text-xs px-1 py-0 min-w-4 h-4' : 'text-sm px-1.5 py-0 min-w-5 h-5'}
          ${tone === 'brand' ? 'bg-[color:var(--brand-primary)]/15 text-[color:var(--brand-primary)]' : 'bg-[color:var(--surface-accent)] text-[color:var(--text-accent)]'}`}
          aria-hidden="true"
        >
          {count}
        </span>
      {/if}
    </a>
  {:else}
    <button
      class={base}
      type={type}
      name={name}
      value={value}
      aria-current={ariaCurrent}
      aria-label={ariaLabel || (hasCount && typeof count === 'number' ? `${label ?? ''} (${count})` : label)}
      aria-busy={loading}
      aria-pressed={selected}
      {disabled}
      data-pill
      data-pill-id={dataPillId}
      id={id}
      title={title}
      onclick={onClick}
    >
      {#if hasLeft}
        <span class={`inline-flex ${currentSize.icon} justify-center items-center`} aria-hidden="true">
          {#if loading}
            <svg viewBox="0 0 24 24" class={`animate-spin ${currentSize.icon}`} fill="none" role="img" aria-label="loading">
              <circle cx="12" cy="12" r="10" stroke="currentColor" class="opacity-20" stroke-width="4" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" class="opacity-60" stroke-width="4" stroke-linecap="round" />
            </svg>
          {:else if emoji}
            <span class="leading-none">{emoji}</span>
          {/if}
        </span>
      {/if}

      {#if children}
        {@render children()}
      {:else}
        <span class="truncate">{label}</span>
      {/if}

      {#if hasCount}
        <span
          class={`inline-flex items-center justify-center rounded-full font-semibold leading-none ml-1
          ${size === 'sm' ? 'text-[10px] px-1 py-0 min-w-4 h-3.5' : size === 'md' ? 'text-xs px-1 py-0 min-w-4 h-4' : 'text-sm px-1.5 py-0 min-w-5 h-5'}
          ${tone === 'brand' ? 'bg-[color:var(--brand-primary)]/15 text-[color:var(--brand-primary)]' : 'bg-[color:var(--surface-accent)] text-[color:var(--text-accent)]'}`}
          aria-hidden="true"
        >
          {count}
        </span>
      {/if}
    </button>
  {/if}
{/if}

<!-- No component-scoped <style> to avoid inheriting a broken global PostCSS config. All styling via utility classes. -->
