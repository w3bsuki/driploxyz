<!--
  AUTH ERROR BOUNDARY

  Handles authentication errors gracefully with proper fallbacks.
  Used to wrap auth-sensitive components.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from './store.svelte.js';

  interface Props {
    fallback?: import('svelte').Snippet;
    children: import('svelte').Snippet;
  }

  let { fallback, children }: Props = $props();

  let hasError = $state(false);
  let errorMessage = $state<string | null>(null);

  // Reset error state when auth state changes
  $effect(() => {
    if (authStore.isAuthenticated !== null) {
      hasError = false;
      errorMessage = null;
    }
  });

  // Global error handler for auth-related errors
  onMount(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('auth') ||
          event.error?.message?.includes('session') ||
          event.error?.message?.includes('supabase')) {
        hasError = true;
        errorMessage = event.error.message;
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  });

  function retry() {
    hasError = false;
    errorMessage = null;

    // Try to reinitialize auth
    if (!authStore.initialized) {
      authStore.initialize();
    }
  }
</script>

{#if hasError}
  {#if fallback}
    {@render fallback()}
  {:else}
    <div class="auth-error-boundary bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            Authentication Error
          </h3>
          {#if errorMessage}
            <p class="text-sm text-red-700 mt-1">
              {errorMessage}
            </p>
          {/if}
          <div class="mt-2">
            <button
              onclick={retry}
              class="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
{:else}
  {@render children()}
{/if}