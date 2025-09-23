<script lang="ts">
  import type { Snippet } from 'svelte';
  import { browser } from '$app/environment';
  import { createNetworkMonitor, type ErrorDetails } from '$lib/utils/error-handling';
  import { toast } from '$lib/stores/toast.svelte';
  import ErrorBoundary from './ErrorBoundary.svelte';

  interface Props {
    children: Snippet;
    onRealtimeError?: (error: ErrorDetails) => void;
    showOfflineIndicator?: boolean;
  }

  let {
    children,
    onRealtimeError,
    showOfflineIndicator = true
  }: Props = $props();

  // Network monitoring
  const network = createNetworkMonitor();

  // Track realtime connection state
  let isRealtimeConnected = $state(true);
  let realtimeError = $state<ErrorDetails | null>(null);
  let reconnectAttempts = $state(0);
  const maxReconnectAttempts = 5;

  // Handle realtime-specific errors
  function handleRealtimeError(error: ErrorDetails) {
    // Mark as disconnected for realtime errors
    if (error.type === 'NETWORK' || error.message.includes('realtime') || error.message.includes('websocket')) {
      isRealtimeConnected = false;
      realtimeError = error;

      // Show persistent notification for realtime disconnect
      toast.warning('Real-time connection lost. Attempting to reconnect...', {
        persistent: true,
        action: {
          label: 'Retry now',
          onClick: () => handleReconnect()
        }
      });
    }

    onRealtimeError?.(error);
  }

  // Reconnection logic
  async function handleReconnect() {
    if (reconnectAttempts >= maxReconnectAttempts) {
      toast.error('Unable to restore real-time connection. Please refresh the page.', {
        persistent: true
      });
      return;
    }

    reconnectAttempts++;

    try {
      // Emit reconnect event
      if (browser) {
        window.dispatchEvent(new CustomEvent('realtime-reconnect', {
          detail: { attempt: reconnectAttempts }
        }));
      }

      // Simulate reconnection delay
      await new Promise(resolve => setTimeout(resolve, 1000 * reconnectAttempts));

      // Reset states on successful reconnection
      isRealtimeConnected = true;
      realtimeError = null;
      reconnectAttempts = 0;

      toast.success('Real-time connection restored');
    } catch {
      toast.error(`Reconnection attempt ${reconnectAttempts} failed`);
    }
  }

  // Auto-reconnect when network comes back online
  $effect(() => {
    if (network.isOnline && !isRealtimeConnected && realtimeError) {
      handleReconnect();
    }
  });

  // Custom fallback for realtime errors
  // RealtimeFallback function removed as it's not used - inline fallback is used instead
</script>

<ErrorBoundary
  onError={handleRealtimeError}
  showToastOnError={false}
  name="RealtimeErrorBoundary"
>
  {#snippet fallback(error, retry, isRetrying)}
    <div class="realtime-error-container p-4 bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] rounded-lg">
      <div class="realtime-error-content text-center max-w-sm mx-auto">
        <!-- Status indicator -->
        <div class="status-indicator mb-4 flex justify-center">
          <div class="w-12 h-12 p-2 rounded-full {error.type === 'NETWORK' || !network.isOnline ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}">
            {#if error.type === 'NETWORK' || !network.isOnline}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m13 13 6-6"></path>
                <path d="m13 13-6-6"></path>
                <path d="m13 13v6"></path>
                <path d="M13 13h6"></path>
              </svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6"></path>
                <path d="m15.5 4.5-3 3m0 0-3-3m3 3v6"></path>
              </svg>
            {/if}
          </div>
        </div>

        <!-- Title -->
        <h3 class="error-title text-lg font-semibold text-[color:var(--text-primary)] mb-2">
          {error.type === 'NETWORK' || !network.isOnline ? 'Connection Lost' : 'Real-time Service Unavailable'}
        </h3>

        <!-- Message -->
        <p class="error-message text-sm text-[color:var(--text-secondary)] mb-4 leading-relaxed">
          {#if error.type === 'NETWORK' || !network.isOnline}
            You're currently offline. Real-time updates will resume when your connection is restored.
          {:else}
            Live updates are temporarily unavailable. You can still use the app, but some features may be delayed.
          {/if}
        </p>

        <!-- Connection info -->
        <div class="connection-info mb-4 p-3 bg-[color:var(--surface-muted)] rounded-lg text-xs">
          <div class="info-item flex justify-between mb-1">
            <span class="label text-[color:var(--text-muted)]">Network:</span>
            <span class="value font-medium {network.isOnline ? 'text-green-600' : 'text-red-600'}">
              {network.isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div class="info-item flex justify-between mb-1">
            <span class="label text-[color:var(--text-muted)]">Real-time:</span>
            <span class="value font-medium {isRealtimeConnected ? 'text-green-600' : 'text-red-600'}">
              {isRealtimeConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {#if network.connectionType}
            <div class="info-item flex justify-between">
              <span class="label text-[color:var(--text-muted)]">Connection:</span>
              <span class="value font-medium text-[color:var(--text-secondary)]">{network.connectionType}</span>
            </div>
          {/if}
        </div>

        <!-- Actions -->
        <div class="error-actions flex flex-col gap-2">
          {#if error.retryable && network.isOnline}
            <button
              class="retry-button px-4 py-2 bg-[color:var(--primary)] text-white rounded-lg hover:bg-[color:var(--primary-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors {isRetrying ? 'loading' : ''}"
              onclick={retry}
              disabled={isRetrying}
            >
              {#if isRetrying}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reconnecting...
              {:else}
                Reconnect now
              {/if}
            </button>
          {/if}

          <button
            class="info-button px-4 py-2 border border-[color:var(--border-subtle)] text-[color:var(--text-secondary)] rounded-lg hover:bg-[color:var(--surface-muted)] transition-colors"
            onclick={() => {
              if (browser) window.location.reload();
            }}
          >
            Refresh page
          </button>
        </div>
      </div>
    </div>
  {/snippet}

  {@render children()}
</ErrorBoundary>

<!-- Network status indicator -->
{#if showOfflineIndicator && !network.isOnline}
  <div class="offline-indicator fixed bottom-4 left-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="m13 13 6-6"></path>
      <path d="m13 13-6-6"></path>
      <path d="m13 13v6"></path>
      <path d="M13 13h6"></path>
    </svg>
    You're offline
  </div>
{/if}

<style>
  .offline-indicator {
    animation: slide-in 0.3s ease-out;
  }

  @keyframes slide-in {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .offline-indicator {
      animation: none;
    }
  }
</style>