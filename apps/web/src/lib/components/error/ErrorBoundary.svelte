<script lang="ts">
  import type { Snippet } from 'svelte';
  import { browser } from '$app/environment';
  // import { invalidateAll } from '$app/navigation'; // Not used in this component
  import { useErrorBoundary, type ErrorDetails } from '$lib/utils/error-handling.svelte';
  import { toast } from '@repo/ui';
  import { Button } from '@repo/ui';

  interface Props {
    children: Snippet;
    fallback?: Snippet<[ErrorDetails, () => void, boolean]>;
    onError?: (error: ErrorDetails) => void;
    retryAction?: () => Promise<void>;
    showToastOnError?: boolean;
    isolate?: boolean;
    name?: string; // For debugging
  }

  let {
    children,
    fallback,
    onError,
    retryAction,
    showToastOnError = true,
    isolate = false,
    name = 'ErrorBoundary'
  }: Props = $props();

  // Create error boundary
  const boundary = useErrorBoundary((error) => {
    // Show toast notification for non-critical errors
    if (showToastOnError && error.severity !== 'CRITICAL') {
      toast.fromError(error);
    }

    // Call custom error handler
    onError?.(error);
  });

  // Custom retry function
  async function handleRetry() {
    if (retryAction) {
      await boundary.retry(retryAction);
    } else {
      // Default retry behavior
      await boundary.retry();
    }
  }

  // Setup error capturing for this boundary
  $effect(() => {
    if (!browser || !isolate) return;

    const handleError = (event: ErrorEvent) => {
      event.stopPropagation();
      boundary.captureError(event.error, {
        boundary: name,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      boundary.captureError(event.reason, {
        boundary: name,
        type: 'unhandledRejection'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  });

  // Default fallback UI
  // DefaultFallback function removed as it's not used in this component
</script>

{#if boundary.hasError}
  <div class="error-boundary" data-error-boundary={name} role="alert" aria-live="assertive">
    {#if fallback}
      {@render fallback(boundary.error!, handleRetry, boundary.isRetrying)}
    {:else}
      <div class="error-boundary-container p-6 bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] rounded-lg">
        <div class="error-boundary-content text-center max-w-md mx-auto">
          <!-- Icon -->
          <div class="error-icon mb-4 flex justify-center">
            <div class="w-12 h-12 text-[color:var(--status-error-text)]">
              {#if boundary.error?.severity === 'CRITICAL'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              {/if}
            </div>
          </div>

          <!-- Title -->
          <h3 class="error-title text-lg font-semibold text-[color:var(--text-primary)] mb-2">
            {boundary.error?.severity === 'CRITICAL' ? 'Critical Error' : 'Something went wrong'}
          </h3>

          <!-- Message -->
          <p class="error-message text-sm text-[color:var(--text-secondary)] mb-4 leading-relaxed">
            {boundary.error?.userMessage || 'An unexpected error occurred.'}
          </p>

          <!-- Development details -->
          {#if browser && window.location.hostname === 'localhost' && boundary.error}
            <details class="error-details mb-4 text-left">
              <summary class="cursor-pointer text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)]">
                Technical details
              </summary>
              <pre class="error-code mt-2 p-3 bg-[color:var(--surface-muted)] rounded text-xs font-mono overflow-x-auto border">
{JSON.stringify({
  type: boundary.error.type,
  severity: boundary.error.severity,
  code: boundary.error.code,
  timestamp: boundary.error.timestamp,
  retryable: boundary.error.retryable,
  context: boundary.error.context
}, null, 2)}
              </pre>
            </details>
          {/if}

          <!-- Actions -->
          <div class="error-actions flex flex-col sm:flex-row gap-2 justify-center">
            {#if boundary.error?.retryable}
              <Button
                onclick={handleRetry}
                variant="primary"
                size="sm"
                disabled={boundary.isRetrying}
                class="w-full sm:w-auto"
              >
                {#if boundary.isRetrying}
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Retrying...
                {:else}
                  Try again
                {/if}
              </Button>
            {/if}

            <Button
              onclick={boundary.clearError}
              variant="outline"
              size="sm"
              class="w-full sm:w-auto"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .error-boundary {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .error-boundary-container {
    width: 100%;
    max-width: 500px;
  }

  /* Accessibility improvements */
  .error-boundary :focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .error-boundary-container {
      border-width: 2px;
    }
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .error-icon {
      animation: none !important;
    }
  }
</style>