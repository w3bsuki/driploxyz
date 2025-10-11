<script lang="ts">
  interface Props {
    status: 'connected' | 'connecting' | 'error' | 'disconnected';
    message?: string;
    canRetry?: boolean;
    onRetry?: () => void;
  }

  let { status, message = '', canRetry = false, onRetry }: Props = $props();

  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      icon: '✓',
      text: 'Connected',
      show: false // Don't show when connected
    },
    connecting: {
      color: 'bg-yellow-500',
      icon: '⟳',
      text: 'Connecting...',
      show: true
    },
    error: {
      color: 'bg-red-500',
      icon: '⚠',
      text: 'Connection lost',
      show: true
    },
    disconnected: {
      color: 'bg-gray-500',
      icon: '○',
      text: 'Offline',
      show: true
    }
  };

  const config = $derived(statusConfig[status]);
</script>

{#if config.show}
  <!-- Instagram-style connection status bar -->
  <div class="fixed top-0 left-0 right-0 z-50 {config.color} text-white px-4 py-2 text-center text-sm font-semibold shadow-lg">
    <div class="flex items-center justify-center space-x-2">
      <span class="text-base {status === 'connecting' ? 'animate-spin' : ''}">{config.icon}</span>
      <span>{message || config.text}</span>
      {#if canRetry && onRetry}
        <button 
          onclick={onRetry}
          class="ml-3 px-3 py-1 bg-white/20 rounded-full text-xs font-bold hover:bg-white/30 transition-colors"
        >
          Retry
        </button>
      {/if}
    </div>
  </div>
{/if}