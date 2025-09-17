<script lang="ts">
  import type { Snippet } from 'svelte';
  import { isBrowser } from './utils/runtime.js';
  import { createLogger } from './utils/log.js';

  const logger = createLogger('ErrorBoundary');

  interface Props {
    children: Snippet;
    fallback?: Snippet<[error: Error, retry: () => void]>;
    name?: string;
    level?: 'page' | 'component' | 'widget';
    showErrorDetails?: boolean;
  }

  let {
    children,
    fallback,
    name = 'Unknown Component',
    level = 'component',
    showErrorDetails = false
  }: Props = $props();

  let hasError = $state(false);
  let error = $state<Error | null>(null);
  let retryCount = $state(0);

  function handleError(err: Error) {
    hasError = true;
    error = err;

    // Log error with context
    logger.error(`Error in ${name}`, {
      error: err.message,
      stack: err.stack,
      level,
      retryCount,
      timestamp: new Date().toISOString()
    });

    // Report to error tracking if available
    if (isBrowser && window.Sentry?.captureException) {
      window.Sentry.captureException(err, {
        tags: {
          component: name,
          level,
          retryCount
        },
        contexts: {
          errorBoundary: {
            name,
            level,
            retryCount
          }
        }
      });
    }
  }

  function retry() {
    retryCount++;
    hasError = false;
    error = null;

    logger.info(`Retrying ${name} (attempt ${retryCount})`);
  }

  // Catch synchronous errors
  function safeRender(renderFn: () => any) {
    try {
      return renderFn();
    } catch (err) {
      if (err instanceof Error) {
        handleError(err);
      }
      return null;
    }
  }

  // Handle promise rejections for async content
  function handleUnhandledRejection(event: PromiseRejectionEvent) {
    handleError(new Error(`Unhandled promise rejection: ${event.reason}`));
  }

  // Set up global error handling for this boundary
  if (isBrowser) {
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  }
</script>

{#if hasError && error}
  {#if fallback}
    {@render fallback(error, retry)}
  {:else}
    <div class="error-boundary" data-level={level}>
      <div class="error-content">
        <div class="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h3 class="error-title">
          {level === 'page' ? 'Page Error' : level === 'widget' ? 'Widget Error' : 'Component Error'}
        </h3>

        <p class="error-message">
          {level === 'page' ? 'The page encountered an error and cannot be displayed.' :
           level === 'widget' ? 'This content is temporarily unavailable.' :
           'This component failed to load properly.'}
        </p>

        {#if showErrorDetails && error}
          <details class="error-details">
            <summary>Error Details</summary>
            <pre>{error.message}</pre>
          </details>
        {/if}

        <div class="error-actions">
          <button onclick={retry} class="retry-button">
            Try Again
          </button>

          {#if level === 'page'}
            <button onclick={() => window.location.reload()} class="reload-button">
              Reload Page
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
{:else}
  {safeRender(() => children())}
{/if}

<style>
  .error-boundary {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 1rem;
    border: 1px dashed #e5e7eb;
    border-radius: 8px;
    background-color: #fef7f0;
  }

  .error-boundary[data-level="page"] {
    min-height: 400px;
    background-color: #fefefe;
  }

  .error-boundary[data-level="widget"] {
    min-height: 100px;
    background-color: #f9fafb;
  }

  .error-content {
    text-align: center;
    max-width: 400px;
  }

  .error-icon {
    color: #f59e0b;
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
  }

  .error-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.5rem 0;
  }

  .error-message {
    color: #6b7280;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  .error-details {
    margin: 1rem 0;
    text-align: left;
  }

  .error-details summary {
    cursor: pointer;
    font-weight: 500;
    color: #374151;
  }

  .error-details pre {
    background: #f3f4f6;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    color: #374151;
    white-space: pre-wrap;
    word-break: break-word;
    margin-top: 0.5rem;
  }

  .error-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .retry-button,
  .reload-button {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
    border: 1px solid transparent;
  }

  .retry-button {
    background-color: #3b82f6;
    color: white;
  }

  .retry-button:hover {
    background-color: #2563eb;
  }

  .reload-button {
    background-color: #f3f4f6;
    color: #374151;
    border-color: #d1d5db;
  }

  .reload-button:hover {
    background-color: #e5e7eb;
  }
</style>