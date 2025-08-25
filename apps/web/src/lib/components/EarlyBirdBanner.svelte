<script lang="ts">
  import { onMount } from 'svelte';
  
  interface Listing {
    user: string;
    title: string;
    id: string;
  }
  
  const WEEK_MS = 604800000;
  const ROTATE_DELAY = 5000;
  const FADE_DURATION = 300;
  
  let dismissed = $state(false);
  let idx = $state(0);
  let items = $state<Listing[]>([]);
  let visible = $state(true);
  
  const current = $derived(items[idx]);
  
  onMount(() => {
    const stored = localStorage.getItem('banner-dismissed-time');
    if (stored && Date.now() - +stored < WEEK_MS) {
      dismissed = true;
      return;
    }
    
    fetchListings();
    const interval = setInterval(rotate, ROTATE_DELAY);
    return () => clearInterval(interval);
  });
  
  async function fetchListings() {
    try {
      const res = await fetch('/api/recent-listings');
      if (res.ok) items = await res.json();
    } catch {}
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
    aria-label="Скорошни обяви"
    aria-live="polite"
    aria-atomic="true"
    class="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white border-b border-zinc-800"
  >
    <div class="max-w-7xl mx-auto px-4 py-2.5">
      <div class="flex items-center justify-between gap-4">
        <div 
          class="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 rounded-full"
          role="status"
          aria-label="На живо"
        >
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span class="text-red-500 font-medium text-[11px] uppercase tracking-widest">Live</span>
        </div>
        
        <div class="flex-1 min-w-0">
          <p 
            class="text-sm text-center whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-300 {visible ? 'opacity-100' : 'opacity-0'}"
          >
            <span class="text-white font-medium">{current.user}</span>
            <span class="mx-1.5 text-zinc-500">току-що добави</span>
            <a 
              href="/product/{current.id}"
              class="text-white font-medium hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
              aria-label="Виж {current.title} от {current.user}"
            >
              {current.title}
            </a>
          </p>
        </div>
        
        <button 
          onclick={dismiss}
          class="text-zinc-500 hover:text-zinc-300 p-1.5 hover:bg-zinc-800/50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Затвори банера за скорошни обяви"
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