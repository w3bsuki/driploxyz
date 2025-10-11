<script lang="ts">
  interface Props {
    status: 'connected' | 'connecting' | 'error' | 'disconnected';
    message: string;
    canRetry: boolean;
    onRetry: () => void;
  }

  let { status, message, canRetry, onRetry }: Props = $props();

  function getStatusColor() {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'disconnected':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }

  function getStatusText() {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown Status';
    }
  }
</script>

{#if status !== 'connected' || message}
  <div class="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
    <div class="flex items-center space-x-2">
      <div class="w-2 h-2 rounded-full {getStatusColor()} {status === 'connecting' ? 'animate-pulse' : ''}"></div>
      <span class="text-sm font-medium text-gray-900">{getStatusText()}</span>
      {#if message}
        <span class="text-sm text-gray-500">{message}</span>
      {/if}
    </div>

    {#if canRetry && status === 'error'}
      <button
        class="px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-800 transition-colors"
        onclick={onRetry}
      >
        Retry
      </button>
    {/if}
  </div>
{/if}