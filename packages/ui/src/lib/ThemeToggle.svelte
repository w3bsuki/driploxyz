<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    class?: string;
    size?: 'sm' | 'md';
    tooltip?: string;
  }

  let { class: className = '', size = 'md', tooltip = 'Toggle theme' }: Props = $props();

  let isDark = $state(false);

  function applyTheme(dark: boolean) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (dark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  function toggle() {
    isDark = !isDark;
    applyTheme(isDark);
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        isDark = true;
      } else {
        isDark = false;
      }
      applyTheme(isDark);
    } catch {
      // no-op
    }
  });

  const btnSize = $derived(size === 'sm' ? 'min-h-[32px] min-w-[32px] p-1.5 text-sm' : 'min-h-[36px] min-w-[36px] p-2 text-base');
</script>

<button
  type="button"
  title={tooltip}
  aria-label={tooltip}
  class="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--border-subtle)] bg-[color:var(--surface-base)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] transition-colors {btnSize} {className}"
  onclick={toggle}
>
  {#if isDark}
    <!-- Sun icon -->
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364 6.364-1.414-1.414M6.05 6.05 4.636 4.636m12.728 0-1.414 1.414M6.05 17.95l-1.414 1.414"/>
    </svg>
  {:else}
    <!-- Moon icon -->
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  {/if}
</button>
