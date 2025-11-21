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
  class="relative p-1.5 text-gray-500 hover:text-gray-900 transition-colors duration-200 rounded-full hover:bg-gray-100 {className}"
  aria-label="Notifications"
>
  <!-- Super Simple Bell Icon -->
  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="currentColor"/>
    <path d="M18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor"/>
  </svg>
  
  <!-- Clean Notification Badge -->
  {#if hasNotifications && show}
    <div class="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1
      bg-[var(--status-error-solid)] text-[var(--text-inverse)] text-xs font-semibold rounded-full
      ring-2 ring-white shadow-xs">
      {count > 99 ? '99+' : count > 9 ? count : count}
    </div>
  {/if}
  
  <!-- Subtle Pulse for Active Notifications -->
  {#if hasNotifications && show}
    <div class="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-red-400 rounded-full animate-ping opacity-20"></div>
  {/if}
</button>