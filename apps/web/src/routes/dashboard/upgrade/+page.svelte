<script lang="ts">
  import { Button, PricingCard, Accordion } from '@repo/ui';
  import { goto } from '$app/navigation';
  import { loadStripe } from '@stripe/stripe-js';
  import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
  import Header from '$lib/components/Header.svelte';
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

<Header />

<div class="min-h-screen bg-white pb-16">
  <!-- Discount Banner Only -->
  {#if discountInfo.eligible}
    <div class="px-4 pt-6 pb-8">
      <div class="max-w-4xl mx-auto text-center">
        <div class="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-lg">
          <span class="text-lg">🎉</span>
          <span class="font-semibold">{i18n.banner_earlyBird()}: {discountInfo.discountPercent}% {i18n.banner_off()} {i18n.banner_firstMonth()}!</span>
          <span class="bg-white text-black px-2 py-1 rounded text-xs font-bold">{i18n.banner_limitedTime()}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Plans Section -->
  <div class="px-4 mb-12">
    <div class="max-w-4xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {#each plans as plan}
          {@const isActive = hasActivePlan(plan.plan_type)}
          {@const currentSub = getCurrentPlan(plan.plan_type)}
          {@const features = getPlanFeatures(plan.plan_type)}
          {@const discountedPrice = calculateDiscountedPrice(plan.price_monthly)}
          {@const isPremium = plan.plan_type === 'premium'}
          {@const isBrand = plan.plan_type === 'brand'}
          
          <PricingCard
            planName={plan.name}
            planIcon={getPlanIcon(plan.plan_type)}
            badge={isPremium ? `🔥 ${i18n.banner_mostPopular()}` : isBrand ? `💼 ${i18n.banner_business()}` : ''}
            price={discountInfo.eligible ? discountedPrice : plan.price_monthly}
            originalPrice={discountInfo.eligible ? plan.price_monthly : undefined}
            period="/ month"
            buttonText={isActive ? i18n.banner_currentlyActive() : `Get ${plan.name}`}
            features={features}
            onSelect={() => {
              if (!isActive) {
                subscribeToPlan(plan.id, plan.plan_type);
              }
            }}
            class={isPremium ? 'border-2 border-black' : ''}
          />
        {/each}
      </div>
    </div>
  </div>

  <!-- Current Plan Summary -->
  <div class="px-4 mb-12">
    <div class="max-w-4xl mx-auto flex justify-center">
      {#if userSubscriptions.length === 0}
        <div class="bg-white rounded-xl border border-gray-200 p-1.5 shadow-xl backdrop-blur-xl max-w-xs w-full">
          <!-- Header with glass effect -->
          <div class="bg-gray-50/80 relative mb-4 rounded-xl border p-4">
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
              <span class="border-gray-300 text-gray-700 rounded-full border px-2 py-0.5 text-xs">
                Current
              </span>
            </div>
            
            <div class="mb-3 flex items-end gap-1">
              <span class="text-3xl font-extrabold tracking-tight">$0</span>
              <span class="text-gray-700 pb-1 text-sm">/ month</span>
            </div>
            
            <div class="w-full font-semibold text-white bg-gray-400 py-3 px-4 rounded-lg cursor-not-allowed">
              Current Plan
            </div>
          </div>
          
          <!-- Features -->
          <div class="space-y-6 p-3">
            <ul class="space-y-3">
              <li class="text-gray-600 flex items-start gap-3 text-sm">
                <span class="mt-0.5">
                  <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-black rounded-full text-xs">✓</span>
                </span>
                <span>Up to 20 products</span>
              </li>
              <li class="text-gray-600 flex items-start gap-3 text-sm">
                <span class="mt-0.5">
                  <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-black rounded-full text-xs">✓</span>
                </span>
                <span>Basic support</span>
              </li>
              <li class="text-gray-600 flex items-start gap-3 text-sm">
                <span class="mt-0.5">
                  <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-black rounded-full text-xs">✓</span>
                </span>
                <span>Standard listings</span>
              </li>
            </ul>
          </div>
        </div>
      {:else}
        {#each userSubscriptions.filter(sub => sub.status === 'active') as subscription}
          {@const planType = subscription.subscription_plans?.plan_type}
          {@const features = getPlanFeatures(planType || '')}
          
          <div class="bg-white rounded-xl border-2 border-black p-1.5 shadow-xl backdrop-blur-xl max-w-xs w-full">
            <!-- Header with glass effect -->
            <div class="bg-gray-50/80 relative mb-4 rounded-xl border p-4">
              <div 
                aria-hidden="true"
                class="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
                style="background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)"
              ></div>
              
              <div class="mb-8 flex items-center justify-between">
                <div class="text-gray-600 flex items-center gap-2 text-sm font-medium">
                  <span class="text-lg">{getPlanIcon(planType || '')}</span>
                  <span>{subscription.subscription_plans?.name}</span>
                </div>
                <span class="border-gray-300 text-gray-700 rounded-full border px-2 py-0.5 text-xs">
                  Active
                </span>
              </div>
              
              <div class="mb-3 flex items-end gap-1">
                <span class="text-3xl font-extrabold tracking-tight">${subscription.subscription_plans?.price_monthly}</span>
                <span class="text-gray-700 pb-1 text-sm">/ month</span>
              </div>
              
              <div class="text-xs text-gray-500 mb-3">
                Renews {new Date(subscription.current_period_end).toLocaleDateString()}
              </div>
              
              <button 
                onclick={() => cancelSubscription(subscription.stripe_subscription_id, planType || '')}
                class="w-full font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 py-3 px-4 rounded-lg transition-colors"
                disabled={!!loading}
              >
                {loading === planType ? 'Canceling...' : 'Cancel Plan'}
              </button>
            </div>
            
            <!-- Features -->
            <div class="space-y-6 p-3">
              <ul class="space-y-3">
                {#each features.slice(0, 3) as feature}
                  <li class="text-gray-600 flex items-start gap-3 text-sm">
                    <span class="mt-0.5">
                      <span class="inline-flex items-center justify-center w-4 h-4 text-white bg-black rounded-full text-xs">✓</span>
                    </span>
                    <span>{feature}</span>
                  </li>
                {/each}
              </ul>
              
              {#if subscription.discount_percent > 0}
                <div class="bg-black text-white rounded px-3 py-2 text-center">
                  <span class="text-sm font-bold">{subscription.discount_percent}% {i18n.banner_offApplied()}</span>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      {/if}
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