<script lang="ts">
  import { onMount } from 'svelte';
  import * as i18n from '@repo/i18n';
  
  interface Listing {
    user: string;
    title: string;
    id: string;
  }
  
  const DISMISS_DURATION = 43200000; // 12 hours (was 1 week)
  const ROTATE_DELAY = 5000;
  const FADE_DURATION = 300;
  
  let dismissed = $state(false);
  let idx = $state(0);
  let items = $state<Listing[]>([]);
  let visible = $state(true);
  
  const current = $derived(items[idx]);
  
  onMount(() => {
    // Check if banner was dismissed recently (within 12 hours)
    const stored = localStorage.getItem('banner-dismissed-time');
    if (stored && Date.now() - +stored < DISMISS_DURATION) {
      dismissed = true;
      return;
    }
    
    // Reset dismissed state if it's been more than 12 hours
    if (stored && Date.now() - +stored >= DISMISS_DURATION) {
      localStorage.removeItem('banner-dismissed-time');
    }
    
    fetchListings();
    const interval = setInterval(rotate, ROTATE_DELAY);
    return () => clearInterval(interval);
  });
  
  async function fetchListings() {
    try {
      const res = await fetch('/api/recent-listings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          items = data;
        }
      }
    } catch (err) {
      console.error('Failed to fetch recent listings:', err);
    }
  }
  
  function rotate() {
    if (items.length <= 1) return;
    visible = false;
    setTimeout(() => {
      idx = (idx + 1) % items.length;
      visible = true;
    }, FADE_DURATION);
  }
  
  function dismiss() {
    dismissed = true;
    localStorage.setItem('banner-dismissed-time', String(Date.now()));
  }
</script>

{#if !dismissed && current}
  <aside 
    role="banner"
    aria-label={i18n.banner_recentListings()}
    aria-live="polite"
    aria-atomic="true"
    class="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white border-b border-zinc-800"
  >
    <div class="max-w-7xl mx-auto px-4 py-2">
      <div class="flex items-center justify-between gap-3">
        <div 
          class="flex items-center gap-1 px-1.5 py-0.5 bg-white text-black rounded-full"
          role="status"
          aria-label={i18n.banner_live()}
        >
          <span class="relative flex h-1.5 w-1.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span class="font-medium text-[10px] uppercase tracking-wider">{i18n.banner_live()}</span>
        </div>
        
        <div class="flex-1 min-w-0">
          <p 
            class="text-sm text-center whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-300 {visible ? 'opacity-100' : 'opacity-0'}"
          >
            <span class="text-white font-medium">{current.user}</span>
            <span class="mx-1.5 text-zinc-500">{i18n.banner_justAdded()}</span>
            <a 
              href="/product/{current.id}"
              class="text-white font-medium underline decoration-dotted underline-offset-4 decoration-zinc-400 hover:decoration-solid hover:decoration-white hover:text-zinc-100 transition-all focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
              aria-label="{i18n.banner_viewProduct()} {current.title} {i18n.banner_by()} {current.user}"
            >
              {current.title}
            </a>
          </p>
        </div>
        
        <button 
          onclick={dismiss}
          class="text-zinc-500 hover:text-zinc-300 p-1.5 hover:bg-zinc-800/50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label={i18n.banner_close()}
          type="button"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </aside>
{/if}