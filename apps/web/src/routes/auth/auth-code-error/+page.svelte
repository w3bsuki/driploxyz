<script lang="ts">
  import { Button } from '@repo/ui';
</script>

<svelte:head>
  <title>Authentication Error - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          Authentication Error
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sorry, we couldn't sign you in. This can happen for a few reasons:
        </p>
      </div>

      <div class="mt-6">
        <ul class="text-sm text-gray-700 space-y-2">
          <li>• The authentication link may have expired</li>
          <li>• The link has already been used</li>
          <li>• There was an error processing your request</li>
        </ul>
      </div>

      <div class="mt-6 space-y-3">
        <Button
          variant="primary"
          size="lg"
          class="w-full"
          onclick={() => window.location.href = '/login'}
        >
          Try signing in again
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          class="w-full"
          onclick={() => window.location.href = '/signup'}
        >
          Create a new account
        </Button>
      </div>

      <div class="mt-6">
        <p class="text-center text-sm text-gray-500">
          Need help? 
          <a href="/contact" class="font-medium text-blue-600 hover:text-blue-500">
            Contact support
          </a>
        </p>
      </div>
    </div>
  </div>
</div>