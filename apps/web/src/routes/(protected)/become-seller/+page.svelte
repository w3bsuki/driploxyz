<script lang="ts">
  import { Button } from '@repo/ui';
  // import * as i18n from '@repo/i18n'; // Currently unused
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Start Selling - Driplo</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-8">
  <div class="text-center mb-8">
    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Start Selling on Driplo</h1>
    <p class="text-lg text-gray-600">Turn your wardrobe into cash</p>
  </div>

  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
    <div class="flex">
      <svg class="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <div>
        <h3 class="text-sm font-medium text-yellow-800">Action Required</h3>
        <p class="text-sm text-yellow-700 mt-1">{data.reason}</p>
      </div>
    </div>
  </div>

  {#if data.needsOnboarding}
    <div class="bg-white rounded-lg border p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Complete Your Account Setup</h2>
      <p class="text-gray-600 mb-4">
        You're almost ready to start selling! Just complete your account setup to unlock selling features.
      </p>
      
      <div class="space-y-3 mb-6">
        <div class="flex items-center">
          <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="text-sm text-gray-700">Account created</span>
        </div>
        
        <div class="flex items-center">
          <div class="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="text-sm text-gray-700">Complete profile setup</span>
        </div>
      </div>

      <Button href="/onboarding" variant="primary" class="w-full">
        Complete Setup
      </Button>
    </div>
  {:else}
    <div class="bg-white rounded-lg border p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">You're Ready to Sell!</h2>
      <p class="text-gray-600 mb-4">
        Your account is set up and ready. Start listing your items now!
      </p>
      
      <Button href="/sell" variant="primary" class="w-full">
        Create Your First Listing
      </Button>
    </div>
  {/if}

  <div class="bg-gray-50 rounded-lg p-6">
    <h3 class="font-semibold mb-3">Why Sell on Driplo?</h3>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="flex items-start">
        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 class="font-medium text-gray-900">Earn Money</h4>
          <p class="text-sm text-gray-600">Turn clothes you don't wear into cash</p>
        </div>
      </div>
      
      <div class="flex items-start">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h4 class="font-medium text-gray-900">Safe & Secure</h4>
          <p class="text-sm text-gray-600">Protected payments and buyer protection</p>
        </div>
      </div>
      
      <div class="flex items-start">
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
          <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v8a3 3 0 11-6 0V4H7zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 class="font-medium text-gray-900">Easy Listing</h4>
          <p class="text-sm text-gray-600">Quick photo upload and simple forms</p>
        </div>
      </div>
      
      <div class="flex items-start">
        <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
          <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h4 class="font-medium text-gray-900">Global Reach</h4>
          <p class="text-sm text-gray-600">Reach buyers from around the world</p>
        </div>
      </div>
    </div>
  </div>
</div>