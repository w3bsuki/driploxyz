<script lang="ts">
  import { onMount } from 'svelte';
  
  let dismissed = $state(false);
  let idx = $state(0);
  let items = $state<{user: string, title: string, id: string, time?: string}[]>([]);
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
        }, 200);
      }
    }, 4000);
    
    return () => clearInterval(interval);
  });
  
  const current = $derived(items[idx]);
</script>

{#if !dismissed && current}
  <div class="bg-gradient-to-r from-black via-gray-900 to-black text-white overflow-hidden">
    <div class="px-3 py-2.5 flex items-center justify-between">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <!-- Live indicator -->
        <div class="flex items-center gap-1.5">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span class="text-red-400 font-semibold text-[11px] uppercase tracking-wide">Live</span>
        </div>
        
        <!-- Activity -->
        <div class="min-w-0 flex-1 transition-all duration-200 {visible ? 'opacity-100' : 'opacity-0'}">
          <span class="text-xs flex items-center gap-1.5">
            <span class="text-emerald-400 font-medium">{current.user}</span>
            <span class="text-gray-500">добави</span>
            <a 
              href="/product/{current.id}" 
              class="text-white/90 hover:text-white underline decoration-gray-600 hover:decoration-white transition-colors truncate"
            >
              {current.title}
            </a>
            {#if current.time}
              <span class="text-gray-600 text-[10px] hidden sm:inline">• {current.time}</span>
            {/if}
          </span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center gap-2 ml-3">
        <a 
          href="/search" 
          class="text-[10px] text-gray-500 hover:text-white transition-colors hidden sm:block"
        >
          Виж всички
        </a>
        <button 
          onclick={() => {
            dismissed = true;
            localStorage.setItem('banner-dismissed-time', Date.now().toString());
          }}
          class="p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Затвори"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Subtle animated border -->
    <div class="h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
  </div>
{/if}