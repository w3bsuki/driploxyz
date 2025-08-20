<script lang="ts">
  import { Button, BrandBadge } from '@repo/ui';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const subscriptionStatus = data.paymentIntentStatus === 'succeeded' ? 'success' : 'failed';
  const { planName, brandActivated } = data;
</script>

<svelte:head>
  <title>Subscription Complete - Dashboard</title>
</svelte:head>

<div class="max-w-2xl mx-auto text-center space-y-8 py-12">
  {#if subscriptionStatus === 'checking'}
    <div class="space-y-4">
      <div class="text-6xl">⏳</div>
      <h1 class="text-2xl font-bold text-gray-900">Processing your subscription...</h1>
      <p class="text-gray-600">Please wait while we confirm your payment.</p>
    </div>
  {:else if subscriptionStatus === 'success'}
    <div class="space-y-6">
      <div class="text-6xl">{brandActivated ? '🏢' : '🎉'}</div>
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          Welcome to {planName}!
          {#if brandActivated}
            <BrandBadge verified={true} size="lg" />
          {/if}
        </h1>
        <p class="text-lg text-gray-600 mt-2">
          {brandActivated ? 'Your brand account has been verified and activated!' : 'Your subscription has been activated successfully.'}
        </p>
      </div>
      
      <div class="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-green-800 mb-2">What's Next?</h3>
        <div class="text-left text-sm text-green-700 space-y-2">
          <div class="flex items-center space-x-2">
            <span class="text-green-500">✓</span>
            <span>Your subscription is now active and ready to use</span>
          </div>
          {#if brandActivated}
            <div class="flex items-center space-x-2">
              <span class="text-green-500">✓</span>
              <span>You now have a verified brand badge on your profile</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-green-500">✓</span>
              <span>Access to advanced analytics and bulk upload tools</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-green-500">✓</span>
              <span>Priority customer support for your business</span>
            </div>
          {:else}
            <div class="flex items-center space-x-2">
              <span class="text-green-500">✓</span>
              <span>You can now access all premium features</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-green-500">✓</span>
              <span>Start boosting your product listings for better visibility</span>
            </div>
          {/if}
        </div>
      </div>
      
      <div class="space-y-3">
        <Button href="/dashboard" class="w-full" size="lg">
          Go to Dashboard
        </Button>
        <Button href="/sell" variant="outline" class="w-full">
          List Your First Product
        </Button>
      </div>
    </div>
  {:else}
    <div class="space-y-6">
      <div class="text-6xl">❌</div>
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Subscription Failed</h1>
        <p class="text-lg text-gray-600 mt-2">There was an issue processing your payment.</p>
      </div>
      
      <div class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-red-800 mb-2">What went wrong?</h3>
        <div class="text-left text-sm text-red-700 space-y-1">
          <p>• Your payment method may have been declined</p>
          <p>• There might have been a network error</p>
          <p>• Your bank may have blocked the transaction</p>
        </div>
      </div>
      
      <div class="space-y-3">
        <Button href="/dashboard/upgrade" class="w-full" size="lg">
          Try Again
        </Button>
        <Button href="/dashboard" variant="outline" class="w-full">
          Back to Dashboard
        </Button>
      </div>
    </div>
  {/if}
</div>