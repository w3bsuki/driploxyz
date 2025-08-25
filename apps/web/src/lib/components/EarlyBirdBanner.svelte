<script lang="ts">
  import { onMount } from 'svelte';
  
  let dismissed = $state(false);
  let idx = $state(0);
  let items = $state<{user: string, title: string, id: string}[]>([]);
  let visible = $state(true);
  
  onMount(async () => {
    // Check dismissal
    const stored = localStorage.getItem('banner-dismissed-time');
    if (stored && Date.now() - +stored < 604800000) {
      dismissed = true;
      return;
    }
    
    // Fetch recent
    const res = await fetch('/api/recent-listings');
    if (res.ok) items = await res.json();
    
    // Rotate with fade
    const interval = setInterval(() => {
      if (items.length > 1) {
        visible = false;
        setTimeout(() => {
          idx = (idx + 1) % items.length;
          visible = true;
        }, 300);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  });
  
  const current = $derived(items[idx]);
</script>

{#if !dismissed && current}
  <div class="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white border-b border-zinc-800">
    <div class="max-w-7xl mx-auto px-4 py-2.5">
      <div class="flex items-center justify-between">
        <!-- Left: Live indicator -->
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 rounded-full">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span class="text-red-500 font-medium text-[11px] uppercase tracking-widest">Live</span>
          </div>
        </div>
        
        <!-- Center: Activity -->
        <div class="flex-1 flex justify-center px-4">
          <div class="transition-all duration-300 ease-in-out {visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-0.5'}">
            <div class="text-sm text-zinc-300">
              <span class="text-white font-medium">{current.user}</span>
              <span class="mx-1.5 text-zinc-500">току-що добави</span>
              <a 
                href="/product/{current.id}" 
                class="text-white font-medium hover:text-zinc-300 transition-colors"
              >
                {current.title}
              </a>
            </div>
          </div>
        </div>
        
        <!-- Right: Close button -->
        <button 
          onclick={() => {
            dismissed = true;
            localStorage.setItem('banner-dismissed-time', Date.now().toString());
          }}
          class="text-zinc-500 hover:text-zinc-300 p-1.5 hover:bg-zinc-800/50 rounded-lg transition-all"
          aria-label="Затвори"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}