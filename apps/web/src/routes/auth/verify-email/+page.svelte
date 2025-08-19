<script lang="ts">
  import { page } from '$app/stores';
  import * as i18n from '@repo/i18n';

  const email = $derived($page.url.searchParams.get('email') || '');
</script>

<svelte:head>
  <title>Verify Your Email - Driplo</title>
  <meta name="description" content="Please verify your email address to complete registration" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col justify-center px-4 py-6">
  <div class="w-full max-w-md mx-auto">
    <div class="bg-white shadow-xl rounded-2xl overflow-hidden p-8">
      <!-- Success Icon -->
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
        
        <p class="text-gray-600 mb-6">
          We've sent a verification link to{' '}
          {#if email}
            <span class="font-semibold text-gray-900">{email}</span>
          {:else}
            your email address
          {/if}
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-800">
            Please click the link in the email to verify your account and complete registration.
          </p>
        </div>

        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or
          </p>
          
          <a 
            href="/signup" 
            class="inline-flex items-center justify-center font-medium text-blue-600 hover:text-blue-700"
          >
            Try signing up again
          </a>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-200">
          <a 
            href="/login" 
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            Already verified? Sign in
          </a>
        </div>
      </div>
    </div>
  </div>
</div>