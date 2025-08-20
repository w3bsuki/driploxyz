<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let loading = $state(true);
  let error = $state('');

  onMount(() => {
    // Check for any error messages in the URL
    const urlError = $page.url.searchParams.get('error');
    if (urlError) {
      error = urlError;
      loading = false;
    } else {
      // Redirect happens server-side, this is just a fallback
      setTimeout(() => {
        goto('/login?verified=true');
      }, 2000);
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    {#if loading && !error}
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verifying your email...
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Please wait while we confirm your email address.
        </p>
      </div>
    {:else if error}
      <div class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Verification failed</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div class="mt-4">
              <a href="/login" class="text-sm font-medium text-red-600 hover:text-red-500">
                Return to login →
              </a>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>