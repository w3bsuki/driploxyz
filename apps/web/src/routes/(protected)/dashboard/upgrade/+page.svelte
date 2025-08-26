<script lang="ts">
  import { Button, PricingCard, Accordion } from '@repo/ui';
  import { goto } from '$app/navigation';
  import { loadStripe } from '@stripe/stripe-js';
  import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let loading = $state('');
  let stripe: any = $state(null);
  
  // Safe access to data properties with defaults
  const plans = $derived(data?.plans || []);
  const userSubscriptions = $derived(data?.userSubscriptions || []);
  const profile = $derived(data?.profile || null);
  const user = $derived(data?.user || null);
  const discountInfo = $derived(data?.discountInfo || { eligible: false, discountPercent: 0 });

  // Initialize Stripe
  $effect(async () => {
    if (PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      stripe = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
  });

  function hasActivePlan(planType: string) {
    return userSubscriptions.some(sub => 
      sub.status === 'active' && 
      sub.subscription_plans?.plan_type === planType
    );
  }

  function getCurrentPlan(planType: string) {
    return userSubscriptions.find(sub => 
      sub.status === 'active' && 
      sub.subscription_plans?.plan_type === planType
    );
  }

  async function subscribeToPlan(planId: string, planType: string) {
    if (loading || !stripe) return;
    
    loading = planType;
    
    try {
      // Apply discount if eligible
      const discountPercent = discountInfo.eligible ? discountInfo.discountPercent : 0;
      
      // Create subscription via API
      const createResponse = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          discountPercent
        }),
      });

      const createResult = await createResponse.json();

      if (!createResponse.ok) {
        alert('Failed to create subscription: ' + createResult.error);
        return;
      }

      if (!createResult.clientSecret) {
        alert('Payment setup failed');
        return;
      }

      // Confirm payment with Stripe
      const { error: confirmError } = await stripe.confirmPayment({
        clientSecret: createResult.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/upgrade/success`,
        },
      });

      if (confirmError) {
        alert('Payment failed: ' + confirmError.message);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to process subscription');
    } finally {
      loading = '';
    }
  }

  async function cancelSubscription(subscriptionId: string, planType: string) {
    if (loading) return;
    
    if (!confirm('Are you sure you want to cancel your subscription? It will remain active until the end of your billing period.')) {
      return;
    }
    
    loading = planType;
    
    try {
      const cancelResponse = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId
        }),
      });

      const cancelResult = await cancelResponse.json();
      
      if (!cancelResponse.ok) {
        alert('Failed to cancel subscription: ' + cancelResult.error);
      } else {
        alert('Subscription canceled successfully. It will remain active until the end of your billing period.');
        goto('/dashboard/upgrade', { invalidateAll: true });
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel subscription');
    } finally {
      loading = '';
    }
  }

  function calculateDiscountedPrice(price: number) {
    if (!discountInfo.eligible) return price;
    return price * (1 - discountInfo.discountPercent / 100);
  }

  function getPlanFeatures(planType: string) {
    switch (planType) {
      case 'premium':
        return [
          '10 boosted ads per month',
          '3-7 days homepage visibility',
          'Priority customer support',
          'Advanced analytics',
          'No ads in your listings'
        ];
      case 'brand':
        return [
          'List unlimited products',
          'Brand verification badge',
          'Business account features',
          'Bulk product management',
          'Priority customer support',
          'Advanced analytics dashboard'
        ];
      default:
        return [];
    }
  }

  function getPlanIcon(planType: string) {
    switch (planType) {
      case 'premium': return '⭐';
      case 'brand': return '🏢';
      default: return '📦';
    }
  }
  
  const faqItems = [
    {
      title: 'Can I change plans anytime?',
      content: 'Absolutely! Upgrade, downgrade, or cancel your subscription anytime. Changes take effect at your next billing cycle.',
      icon: '🔄'
    },
    {
      title: 'What about my remaining boosts?',
      content: 'Your active boosted ads continue until they expire, but you can\'t create new ones after canceling Premium.',
      icon: '⭐'
    },
    {
      title: 'Business selling requirements?',
      content: 'Yes, business accounts require an active Brand subscription to comply with marketplace policies and verification.',
      icon: '💼'
    },
    {
      title: 'Early bird discount recurring?',
      content: 'The early bird discount is a one-time first-month special. Regular pricing applies from month two onwards.',
      icon: '🎯'
    }
  ];
</script>

<svelte:head>
  <title>Upgrade Your Plan - Dashboard</title>
</svelte:head>


<div class="min-h-screen bg-white pb-16">
  <!-- Discount Banner Only -->
  {#if discountInfo.eligible}
    <div class="px-4 pt-5 pb-5 sm:pt-6 sm:pb-8">
      <div class="max-w-4xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 bg-black text-white px-5 py-3 sm:px-6 rounded-lg">
          <span class="text-lg">🎉</span>
          <span class="font-semibold text-base sm:text-lg">
            <span class="sm:hidden">{i18n.banner_earlyBird()}: -{discountInfo.discountPercent}%</span>
            <span class="hidden sm:inline">{i18n.banner_earlyBird()}: {discountInfo.discountPercent}% {i18n.banner_off()} {i18n.banner_firstMonth()}!</span>
          </span>
          <span class="bg-white text-black px-2.5 py-1 rounded text-xs font-bold">{i18n.banner_limitedTime()}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Plans Section - Removed, showing only glass cards below -->

  <!-- Plans with Glass Style Cards -->
  <div class="px-4 mb-12">
    <div class="max-w-5xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
        
        <!-- Free Plan -->
        {#if true}
          {@const hasFree = !userSubscriptions.some(s => s.status === 'active')}
          {@const freeFeatures = ['Up to 20 products', 'Basic support', 'Standard listings']}
        <div class="bg-white rounded-xl border {hasFree ? 'border-gray-300' : 'border-gray-200'} p-1.5 shadow-xl backdrop-blur-xl max-w-xs w-full">
          <!-- Header with glass effect -->
          <div class="bg-gray-50/80 relative mb-4 rounded-xl border border-gray-200 p-4">
            <div 
              aria-hidden="true"
              class="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
              style="background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)"
            ></div>
            
            <div class="mb-8 flex items-center justify-between">
              <div class="text-gray-600 flex items-center gap-2 text-sm font-medium">
                <span class="text-lg">🆓</span>
                <span>Free Plan</span>
              </div>
              {#if hasFree}
                <span class="border-gray-300 text-gray-700 rounded-full border px-2 py-0.5 text-xs">
                  Current
                </span>
              {/if}
            </div>
            
            <div class="mb-3 flex items-end gap-1">
              <span class="text-3xl font-extrabold tracking-tight">$0</span>
              <span class="text-gray-700 pb-1 text-sm">/ month</span>
            </div>
            
            <div class="w-full font-semibold text-white bg-gray-400 py-3 px-4 rounded-lg cursor-not-allowed">
              {hasFree ? 'Current Plan' : 'Free Plan'}
            </div>
          </div>
          
          <!-- Features -->
          <div class="space-y-6 p-3">
            <ul class="space-y-3">
              {#each freeFeatures as feature}
                <li class="text-gray-600 flex items-start gap-3 text-sm">
                  <span class="mt-0.5">
                    <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-black rounded-full text-xs">✓</span>
                  </span>
                  <span>{feature}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        {/if}

        <!-- Premium Plan -->
        {#if true}
          {@const hasPremium = userSubscriptions.some(s => s.status === 'active' && s.subscription_plans?.plan_type === 'premium')}
          {@const premiumFeatures = ['10 boosted ads/month', 'Priority support', 'Advanced analytics']}
          {@const premiumPrice = discountInfo.eligible ? calculateDiscountedPrice(24.99) : 24.99}
        <div class="bg-white rounded-xl border-2 {hasPremium ? 'border-purple-500' : 'border-purple-300'} p-1.5 shadow-xl backdrop-blur-xl max-w-xs w-full relative">
          <!-- Popular Badge -->
          <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full">
              ⭐ Most Popular
            </div>
          </div>
          
          <!-- Header with glass effect -->
          <div class="bg-purple-50/80 relative mb-4 rounded-xl border border-purple-200 p-4">
            <div 
              aria-hidden="true"
              class="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
              style="background: linear-gradient(180deg, rgba(139,92,246,0.07) 0%, rgba(139,92,246,0.03) 40%, rgba(0,0,0,0) 100%)"
            ></div>
            
            <div class="mb-8 flex items-center justify-between">
              <div class="text-purple-700 flex items-center gap-2 text-sm font-medium">
                <span class="text-lg">⭐</span>
                <span>Premium Plan</span>
              </div>
              {#if hasPremium}
                <span class="bg-purple-600 text-white rounded-full px-2 py-0.5 text-xs">
                  Active
                </span>
              {/if}
            </div>
            
            <div class="mb-3 flex items-end gap-1">
              {#if discountInfo.eligible && !hasPremium}
                <span class="text-3xl font-extrabold tracking-tight text-purple-900">${premiumPrice.toFixed(2)}</span>
                <span class="text-purple-700 pb-1 text-sm line-through ml-2">$24.99</span>
              {:else}
                <span class="text-3xl font-extrabold tracking-tight text-purple-900">$24.99</span>
              {/if}
              <span class="text-purple-700 pb-1 text-sm">/ month</span>
            </div>
            
            {#if hasPremium}
              {@const currentSub = getCurrentPlan('premium')}
              <button 
                onclick={() => cancelSubscription(currentSub?.stripe_subscription_id || '', 'premium')}
                class="w-full font-semibold text-purple-600 border border-purple-300 hover:bg-purple-50 py-3 px-4 rounded-lg transition-colors"
                disabled={!!loading}
              >
                {loading === 'premium' ? 'Canceling...' : 'Cancel Plan'}
              </button>
            {:else}
              <button
                onclick={() => subscribeToPlan('c0587696-cbcd-4e6b-b6bc-ba84fb47ddce', 'premium')}
                class="w-full font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-3 px-4 rounded-lg transition-all"
                disabled={!!loading}
              >
                {loading === 'premium' ? 'Processing...' : 'Get Premium'}
              </button>
            {/if}
          </div>
          
          <!-- Features -->
          <div class="space-y-6 p-3">
            <ul class="space-y-3">
              {#each premiumFeatures as feature}
                <li class="text-gray-600 flex items-start gap-3 text-sm">
                  <span class="mt-0.5">
                    <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-purple-600 rounded-full text-xs">✓</span>
                  </span>
                  <span>{feature}</span>
                </li>
              {/each}
            </ul>
            {#if discountInfo.eligible && !hasPremium}
              <div class="bg-purple-100 text-purple-700 rounded-sm px-3 py-2 text-center">
                <span class="text-sm font-bold">50% OFF First Month!</span>
              </div>
            {/if}
          </div>
        </div>
        {/if}

        <!-- Brand Plan -->
        {#if true}
          {@const hasBrand = userSubscriptions.some(s => s.status === 'active' && s.subscription_plans?.plan_type === 'brand')}
          {@const brandFeatures = ['Unlimited products', 'Brand verification', 'Bulk tools']}
          {@const brandPrice = discountInfo.eligible ? calculateDiscountedPrice(49.99) : 49.99}
        <div class="bg-white rounded-xl border {hasBrand ? 'border-blue-400' : 'border-gray-200'} p-1.5 shadow-xl backdrop-blur-xl max-w-xs w-full">
          <!-- Header with glass effect -->
          <div class="bg-blue-50/80 relative mb-4 rounded-xl border border-blue-200 p-4">
            <div 
              aria-hidden="true"
              class="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
              style="background: linear-gradient(180deg, rgba(59,130,246,0.07) 0%, rgba(59,130,246,0.03) 40%, rgba(0,0,0,0) 100%)"
            ></div>
            
            <div class="mb-8 flex items-center justify-between">
              <div class="text-blue-700 flex items-center gap-2 text-sm font-medium">
                <span class="text-lg">🏢</span>
                <span>Brand Plan</span>
              </div>
              {#if hasBrand}
                <span class="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
                  Active
                </span>
              {/if}
            </div>
            
            <div class="mb-3 flex items-end gap-1">
              {#if discountInfo.eligible && !hasBrand}
                <span class="text-3xl font-extrabold tracking-tight text-blue-900">${brandPrice.toFixed(2)}</span>
                <span class="text-blue-700 pb-1 text-sm line-through ml-2">$49.99</span>
              {:else}
                <span class="text-3xl font-extrabold tracking-tight text-blue-900">$49.99</span>
              {/if}
              <span class="text-blue-700 pb-1 text-sm">/ month</span>
            </div>
            
            {#if hasBrand}
              {@const currentSub = getCurrentPlan('brand')}
              <button 
                onclick={() => cancelSubscription(currentSub?.stripe_subscription_id || '', 'brand')}
                class="w-full font-semibold text-blue-600 border border-blue-300 hover:bg-blue-50 py-3 px-4 rounded-lg transition-colors"
                disabled={!!loading}
              >
                {loading === 'brand' ? 'Canceling...' : 'Cancel Plan'}
              </button>
            {:else}
              <button
                onclick={() => subscribeToPlan('989b722e-4050-4c63-ac8b-ab105f14027c', 'brand')}
                class="w-full font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-3 px-4 rounded-lg transition-all"
                disabled={!!loading}
              >
                {loading === 'brand' ? 'Processing...' : 'Get Brand'}
              </button>
            {/if}
          </div>
          
          <!-- Features -->
          <div class="space-y-6 p-3">
            <ul class="space-y-3">
              {#each brandFeatures as feature}
                <li class="text-gray-600 flex items-start gap-3 text-sm">
                  <span class="mt-0.5">
                    <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-blue-600 rounded-full text-xs">✓</span>
                  </span>
                  <span>{feature}</span>
                </li>
              {/each}
            </ul>
            {#if discountInfo.eligible && !hasBrand}
              <div class="bg-blue-100 text-blue-700 rounded-sm px-3 py-2 text-center">
                <span class="text-sm font-bold">50% OFF First Month!</span>
              </div>
            {/if}
          </div>
        </div>
        {/if}

      </div>
    </div>
  </div>

  <!-- FAQ Section -->
  <div class="px-4 mb-8">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <h3 class="text-2xl font-bold text-black mb-2">Got Questions?</h3>
        <p class="text-gray-600">Everything you need to know about our plans</p>
      </div>
      
      <Accordion items={faqItems} class="mb-8" />
      
      <!-- Contact Support -->
      <div class="text-center">
        <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-black rounded-lg mb-4">
            <span class="text-white text-lg">💬</span>
          </div>
          <h4 class="text-lg font-bold text-black mb-2">Still have questions?</h4>
          <p class="text-gray-600 mb-4">Our support team is here to help you choose the perfect plan</p>
          <Button variant="outline" size="sm" class="border-gray-300 text-gray-700 hover:bg-gray-50">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>