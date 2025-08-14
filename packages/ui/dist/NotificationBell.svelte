<script lang="ts">
  interface Props {
    count?: number;
    show?: boolean;
    onclick?: () => void;
    class?: string;
  }

  let { 
    count = 0,
    show = true,
    onclick,
    class: className = ''
  }: Props = $props();

  const hasNotifications = $derived(count > 0);
</script>

<button 
  onclick={onclick}
  class="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50/80 backdrop-blur-sm {className}"
  aria-label="Notifications"
>
  <!-- Bell Icon -->
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
  
  <!-- Notification Badge with Glass Morphism -->
  {#if hasNotifications && show}
    <div class="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 
      bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full
      ring-2 ring-white/80 backdrop-blur-sm shadow-lg
      animate-pulse">
      {count > 99 ? '99+' : count}
    </div>
  {/if}
  
  <!-- Pulse Animation for New Notifications -->
  {#if hasNotifications && show}
    <div class="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-30"></div>
  {/if}
</button>