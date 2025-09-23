<script lang="ts">
  import { browser } from '$app/environment';
  import * as i18n from '@repo/i18n';
  import { getProductUrl } from '$lib/utils/seo-urls';
  
  interface Listing {
    user: string;
    title: string;
    id: string;
    slug?: string;
  }
  
  const DISMISS_DURATION = 43200000; // 12 hours
  const ROTATE_DELAY = 5000;
  const FADE_DURATION = 300;
  
  let dismissed = $state(false);
  let idx = $state(0);
  let items = $state<Listing[]>([]);
  let visible = $state(true);
  
  const current = $derived(items[idx]);
  
  // Initialize banner and check dismissal
  $effect(() => {
    if (!browser) return;
    
    // Check if banner was dismissed recently (within 12 hours)
    const stored = localStorage.getItem('banner-dismissed-time');
    if (stored && Date.now() - +stored < DISMISS_DURATION) {
      dismissed = true;
      return; // Don't fetch if dismissed
    }
    
    // Reset dismissed state if it's been more than 12 hours
    if (stored && Date.now() - +stored >= DISMISS_DURATION) {
      localStorage.removeItem('banner-dismissed-time');
    }
    
    // Check cache first (5 minute TTL to avoid hammering API)
    const cached = sessionStorage.getItem('banner-listings');
    const cacheTime = sessionStorage.getItem('banner-listings-time');
    if (cached && cacheTime && Date.now() - +cacheTime < 300000) { // 5 minutes
      try {
        items = JSON.parse(cached);
        return;
      } catch {
        // Invalid cache, fetch fresh
      }
    }
    
    // Only fetch if not dismissed and no valid cache
    if (!dismissed) {
      fetchListings();
    }
  });
  
  // Rotation effect
  $effect(() => {
    if (!browser || dismissed || items.length <= 1) return;
    
    const interval = setInterval(rotate, ROTATE_DELAY);
    return () => clearInterval(interval);
  });
  
  async function fetchListings() {
    try {
      const res = await fetch('/api/recent-listings');
      if (res.ok) {
        const data: Listing[] = await res.json();
        if (data && data.length > 0) {
          items = data;
          // Cache for 5 minutes
          sessionStorage.setItem('banner-listings', JSON.stringify(data));
          sessionStorage.setItem('banner-listings-time', String(Date.now()));
        }
      }
    } catch {
      // Recent listings fetch failed - banner will remain hidden
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
    class="bg-black text-white border-b border-gray-800"
  >
    <div class="max-w-7xl mx-auto px-4 py-2">
      <div class="flex items-center justify-between gap-3">
        <div 
          class="flex items-center gap-1 px-1.5 py-0.5 bg-white text-black rounded-full"
          role="status"
          aria-label={i18n.banner_live()}
        >
          <span class="relative flex h-1.5 w-1.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
          <span class="font-medium text-xs uppercase tracking-wider">{i18n.banner_live()}</span>
        </div>
        
        <div class="flex-1 min-w-0">
          <p 
            class="text-sm text-center whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-300 {visible ? 'opacity-100' : 'opacity-0'}"
          >
            <span class="text-white font-medium">{current.user}</span>
            <span class="mx-1.5 text-gray-400">{i18n.banner_justAdded()}</span>
            <a 
              href={getProductUrl(current)}
              class="text-white font-medium underline decoration-dotted underline-offset-4 decoration-gray-500 hover:decoration-solid hover:decoration-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
              aria-label="{i18n.banner_viewProduct()} {current.title} {i18n.banner_by()} {current.user}"
            >
              {current.title}
            </a>
          </p>
        </div>
        
        <button 
          onclick={dismiss}
          class="text-gray-400 hover:text-white p-1.5 hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
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