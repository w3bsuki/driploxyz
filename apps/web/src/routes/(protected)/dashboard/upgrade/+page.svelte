<script lang="ts">
  import { Button, Accordion } from '@repo/ui';
  import { goto } from '$app/navigation';
  import { loadStripe } from '@stripe/stripe-js';
  import { env as publicEnv } from '$env/dynamic/public';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let loading = $state('');
  let stripe: import('@stripe/stripe-js').Stripe | null = $state(null);
  
  // Safe access to data properties with defaults
  const userSubscriptions = $derived(data?.userSubscriptions || []);
  const discountInfo = $derived(data?.discountInfo || { eligible: false, discountPercent: 0 });

  // Initialize Stripe
  $effect(async () => {
    const publishableKey = publicEnv.PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (publishableKey) {
      stripe = await loadStripe(publishableKey);
    }
  });


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
        alert(i18n.upgrade_createSubscriptionFailed() + ' ' + createResult.error);
        return;
      }

      if (!createResult.clientSecret) {
        alert(i18n.upgrade_paymentSetupFailed());
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
        alert(i18n.upgrade_paymentFailed() + ' ' + confirmError.message);
      }
    } catch {
      alert(i18n.upgrade_subscriptionFailed());
    } finally {
      loading = '';
    }
  }

  async function cancelSubscription(subscriptionId: string, planType: string) {
    if (loading) return;
    
    if (!confirm(i18n.upgrade_cancelConfirm())) {
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
        alert(i18n.upgrade_cancelSubscriptionFailed() + ' ' + cancelResult.error);
      } else {
        alert(i18n.upgrade_cancelSuccess());
        goto('/dashboard/upgrade', { invalidateAll: true });
      }
    } catch {
      alert(i18n.upgrade_subscriptionFailed());
    } finally {
      loading = '';
    }
  }

  function calculateDiscountedPrice(price: number) {
    if (!discountInfo.eligible) return price;
    return price * (1 - discountInfo.discountPercent / 100);
  }


  
  const faqItems = [
    {
      title: i18n.upgrade_faqChangePlans(),
      content: i18n.upgrade_faqChangePlansAnswer(),
      icon: '🔄'
    },
    {
      title: i18n.upgrade_faqRemainingBoosts(),
      content: i18n.upgrade_faqRemainingBoostsAnswer(),
      icon: '⭐'
    },
    {
      title: i18n.upgrade_faqBusinessRequirements(),
      content: i18n.upgrade_faqBusinessRequirementsAnswer(),
      icon: '💼'
    },
    {
      title: i18n.upgrade_faqEarlyBirdRecurring(),
      content: i18n.upgrade_faqEarlyBirdRecurringAnswer(),
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
          {@const freeFeatures = [i18n.upgrade_freeFeature1(), i18n.upgrade_freeFeature2(), i18n.upgrade_freeFeature3()]}
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
                <span>{i18n.upgrade_freePlan()}</span>
              </div>
              {#if hasFree}
                <span class="border-gray-300 text-gray-700 rounded-full border px-2 py-0.5 text-xs">
                  {i18n.upgrade_current()}
                </span>
              {/if}
            </div>
            
            <div class="mb-3 flex items-end gap-1">
              <span class="text-3xl font-extrabold tracking-tight">$0</span>
              <span class="text-gray-700 pb-1 text-sm">{i18n.upgrade_perMonth()}</span>
            </div>
            
            <div class="w-full font-semibold text-white bg-gray-400 py-3 px-4 rounded-lg cursor-not-allowed">
              {hasFree ? i18n.upgrade_currentPlan() : i18n.upgrade_freePlan()}
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
          {@const premiumFeatures = [i18n.upgrade_premiumFeature1(), i18n.upgrade_premiumFeature2(), i18n.upgrade_premiumFeature3()]}
          {@const premiumPrice = discountInfo.eligible ? calculateDiscountedPrice(24.99) : 24.99}
        <div class="bg-white rounded-xl border-2 {hasPremium ? 'border-purple-500' : 'border-purple-300'} p-1.5 shadow-xl backdrop-blur-xl max-w-xs w-full relative">
          <!-- Popular Badge -->
          <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold px-3 py-1 rounded-full">
              ⭐ {i18n.upgrade_mostPopular()}
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
                <span>{i18n.upgrade_premiumPlan()}</span>
              </div>
              {#if hasPremium}
                <span class="bg-purple-600 text-white rounded-full px-2 py-0.5 text-xs">
                  {i18n.upgrade_activePlan()}
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
              <span class="text-purple-700 pb-1 text-sm">{i18n.upgrade_perMonth()}</span>
            </div>
            
            {#if hasPremium}
              {@const currentSub = getCurrentPlan('premium')}
              <button 
                onclick={() => cancelSubscription(currentSub?.stripe_subscription_id || '', 'premium')}
                class="w-full font-semibold text-purple-600 border border-purple-300 hover:bg-purple-50 py-3 px-4 rounded-lg transition-colors"
                disabled={!!loading}
              >
                {loading === 'premium' ? i18n.upgrade_canceling() : i18n.upgrade_cancelPlan()}
              </button>
            {:else}
              <button
                onclick={() => subscribeToPlan('c0587696-cbcd-4e6b-b6bc-ba84fb47ddce', 'premium')}
                class="w-full font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-3 px-4 rounded-lg transition-colors"
                disabled={!!loading}
              >
                {loading === 'premium' ? i18n.upgrade_processing() : i18n.upgrade_getPremium()}
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
                <span class="text-sm font-bold">{i18n.upgrade_discountFirstMonth()}</span>
              </div>
            {/if}
          </div>
        </div>
        {/if}

        <!-- Brand Plan -->
        {#if true}
          {@const hasBrand = userSubscriptions.some(s => s.status === 'active' && s.subscription_plans?.plan_type === 'brand')}
          {@const brandFeatures = [i18n.upgrade_brandFeature1(), i18n.upgrade_brandFeature2(), i18n.upgrade_brandFeature3()]}
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
                <span>{i18n.upgrade_brandPlan()}</span>
              </div>
              {#if hasBrand}
                <span class="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
                  {i18n.upgrade_activePlan()}
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
              <span class="text-blue-700 pb-1 text-sm">{i18n.upgrade_perMonth()}</span>
            </div>
            
            {#if hasBrand}
              {@const currentSub = getCurrentPlan('brand')}
              <button 
                onclick={() => cancelSubscription(currentSub?.stripe_subscription_id || '', 'brand')}
                class="w-full font-semibold text-blue-600 border border-blue-300 hover:bg-blue-50 py-3 px-4 rounded-lg transition-colors"
                disabled={!!loading}
              >
                {loading === 'brand' ? i18n.upgrade_canceling() : i18n.upgrade_cancelPlan()}
              </button>
            {:else}
              <button
                onclick={() => subscribeToPlan('989b722e-4050-4c63-ac8b-ab105f14027c', 'brand')}
                class="w-full font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-3 px-4 rounded-lg transition-colors"
                disabled={!!loading}
              >
                {loading === 'brand' ? i18n.upgrade_processing() : i18n.upgrade_getBrand()}
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
                <span class="text-sm font-bold">{i18n.upgrade_discountFirstMonth()}</span>
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
        <h3 class="text-2xl font-bold text-black mb-2">{i18n.upgrade_faqTitle()}</h3>
        <p class="text-gray-600">{i18n.upgrade_faqSubtitle()}</p>
      </div>
      
      <Accordion items={faqItems} class="mb-8" />
      
      <!-- Contact Support -->
      <div class="text-center">
        <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-black rounded-lg mb-4">
            <span class="text-white text-lg">💬</span>
          </div>
          <h4 class="text-lg font-bold text-black mb-2">{i18n.upgrade_supportTitle()}</h4>
          <p class="text-gray-600 mb-4">{i18n.upgrade_supportSubtitle()}</p>
          <Button variant="outline" size="sm" class="border-gray-300 text-gray-700 hover:bg-gray-50">
            {i18n.upgrade_contactSupport()}
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>