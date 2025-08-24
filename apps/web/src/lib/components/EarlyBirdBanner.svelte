<script lang="ts">
  import { onMount } from 'svelte';
  
  let dismissed = $state(false);
  let idx = $state(0);
  let items = $state<{user: string, title: string, id: string}[]>([]);
  
  onMount(async () => {
    // Check dismissal
    const stored = localStorage.getItem('banner-dismissed-time');
    if (stored && Date.now() - +stored < 604800000) { // 7 days
      dismissed = true;
      return;
    }
    
    // Fetch recent
    const res = await fetch('/api/recent-listings');
    if (res.ok) items = await res.json();
    
    // Rotate
    const interval = setInterval(() => {
      if (items.length) idx = (idx + 1) % items.length;
    }, 3000);
    
    return () => clearInterval(interval);
  });
  
  const current = $derived(items[idx]);
</script>

{#if !dismissed && current}
  <div class="bg-black text-white px-3 py-2 flex items-center justify-between text-xs">
    <div class="flex items-center gap-2 min-w-0">
      <span class="flex items-center gap-1">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span class="text-red-500 font-bold">LIVE</span>
      </span>
      <span class="truncate">
        <span class="text-green-400 font-medium">{current.user}</span>
        <span class="text-gray-400 mx-1">добави</span>
        <a href="/product/{current.id}" class="underline">{current.title}</a>
      </span>
    </div>
    <button 
      onclick={() => {
        dismissed = true;
        localStorage.setItem('banner-dismissed-time', Date.now().toString());
      }}
      class="p-1 hover:bg-white/10 rounded"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>
{/if}