<script lang="ts">
  import { Button, ProductCardSkeleton, WelcomeModal, toasts } from '@repo/ui';
  import type { PageData } from './$types';
  import { replaceState } from '$app/navigation';
  // No lifecycle imports needed - using $effect
  import * as i18n from '@repo/i18n';
  import { tutorial } from '$lib/tutorial/manager.svelte';
  import { TutorialToast } from '@repo/ui';
  import { getProductUrl } from '$lib/utils/seo-urls';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  let isLoading = $state(!data.products && !data.orders);
  let showWelcomeModal = $state(false);
  let currentTutorialStep = $state<{ id: string; step: number; title: string; description: string; targetElement?: string; position?: string } | null>(null);
  
  // Check for success message from listing creation and first time users
  $effect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Check if user just completed onboarding (first time)
    const isFirstTime = localStorage.getItem('driplo_welcome_shown') !== 'true';
    if (isFirstTime && data.profile?.onboarding_completed) {
      showWelcomeModal = true;
      localStorage.setItem('driplo_welcome_shown', 'true');

      // Start tutorial after welcome modal
      setTimeout(() => {
        if (tutorial.shouldShowTutorial()) {
          currentTutorialStep = tutorial.getCurrentStep('/dashboard');
        }
      }, 2000);
    } else if (tutorial.shouldShowTutorial()) {
      // Show tutorial for returning users who haven't completed it
      currentTutorialStep = tutorial.getCurrentStep('/dashboard');
    }

    if (urlParams.get('success') === 'listing') {
      toasts.success('Your listing has been published successfully! 🎉');
      // Remove the success param from URL
      const newUrl = window.location.pathname;
      replaceState(newUrl, {});
    }
  });
  
  function handleTutorialDismiss() {
    if (currentTutorialStep) {
      tutorial.markStepShown(currentTutorialStep.id);
      tutorial.dismiss();
    }
    currentTutorialStep = null;
  }
  
  function handleTutorialNext() {
    if (currentTutorialStep) {
      tutorial.markStepShown(currentTutorialStep.id);
      tutorial.nextStep();
      // Get next step for this route
      setTimeout(() => {
        currentTutorialStep = tutorial.getCurrentStep('/dashboard');
      }, 500);
    }
  }
  
  // Calculate stats from real data
  const stats = $derived.by(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const activeListings = data.products?.filter(p => p.status === 'active' && !p.is_sold) || [];
    const thisMonthOrders = data.orders?.filter(o => new Date(o.created_at) >= thisMonth) || [];
    const allTimeOrders = data.orders || [];
    
    const totalRevenue = allTimeOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const monthlyRevenue = thisMonthOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    
    return {
      totalRevenue,
      monthlyRevenue,
      totalSales: allTimeOrders.length,
      monthlySales: thisMonthOrders.length,
      activeListings: activeListings.length,
      totalViews: data.products?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0,
      monthlyViews: data.profile?.monthly_views || 0,
      conversionRate: activeListings.length > 0 ? (allTimeOrders.length / activeListings.length * 100) : 0
    };
  });
  
  // Recent orders from real data
  const recentOrders = $derived.by(() => {
    return (data.orders || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        productTitle: order.product?.title || 'Unknown Product',
        buyerName: order.buyer?.full_name || order.buyer?.username || 'Unknown Buyer',
        price: Number(order.total_amount),
        status: order.status,
        date: order.created_at
      }));
  });
  
  // Active listings from real data
  const activeListings = $derived.by(() => {
    return (data.products || [])
      .filter(p => p.status === 'active' && !p.is_sold)
      .slice(0, 6)
      .map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.price),
        images: product.images?.map(img => img.image_url) || ['/placeholder-product.svg'],
        brand: product.brand,
        size: product.size,
        condition: product.condition as 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair',
        category: product.category?.name || 'Uncategorized',
        sellerId: product.seller_id,
        sellerName: data.profile?.username || data.profile?.full_name || '',
        sellerRating: 4.8,
        createdAt: product.created_at,
        location: product.location || 'Unknown'
      }));
  });
  
  
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return i18n.dashboard_justNow();
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return i18n.dashboard_minutesAgo({ minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return i18n.dashboard_hoursAgo({ hours });
    const days = Math.floor(hours / 24);
    return i18n.dashboard_daysAgo({ days });
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_shipment': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-[color:var(--status-info-bg)] text-[color:var(--status-info-text)]';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
</script>

{#snippet actionButton(href: string, variant: 'primary' | 'outline', className: string, iconPath: string, label: string)}
  <a href={href} class="block">
    <Button {variant} class={className}>
      <span class="flex items-center justify-center gap-1 sm:gap-2">
        <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconPath} />
        </svg>
        <span class="truncate">{label}</span>
      </span>
    </Button>
  </a>
{/snippet}

{#snippet balanceCard(title: string, value: string, subtitle: string, iconColor: string, iconPath: string)}
  <div class="bg-white rounded-lg p-4 sm:p-6 shadow-xs">
    <div class="flex justify-between items-start">
      <div>
        <p class="text-sm text-gray-600">{title}</p>
        <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
        <p class="text-xs sm:text-sm text-gray-500 mt-2">{subtitle}</p>
      </div>
      <svg class="w-8 h-8 {iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconPath} />
      </svg>
    </div>
  </div>
{/snippet}

{#snippet statsCard(label: string, value: string, description: string)}
  <div class="bg-white p-4 rounded-lg shadow-xs">
    <p class="text-sm text-gray-600">{label}</p>
    <p class="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
    <p class="text-xs text-gray-500 mt-1">{description}</p>
  </div>
{/snippet}

<svelte:head>
  <title>Seller Dashboard - Driplo</title>
</svelte:head>

{#if !data.user}
  <!-- Not logged in state -->
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <h2 class="text-xl font-semibold mb-4">{i18n.dashboard_pleaseLogin()}</h2>
      <Button href="/login">{i18n.dashboard_logIn()}</Button>
    </div>
  </div>
{:else if data.profile && data.profile.onboarding_completed === false}
  <!-- Onboarding not complete -->
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center max-w-md">
      <h2 class="text-xl font-semibold mb-4">{i18n.dashboard_completeProfile()}</h2>
      <p class="text-gray-600 mb-6">{i18n.dashboard_completeProfileDesc()}</p>
      <Button href="/onboarding">{i18n.dashboard_completeSetup()}</Button>
    </div>
  </div>
{:else}
  <!-- Main dashboard content -->
  <div class="min-h-screen bg-gray-50">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Welcome Section -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{i18n.dashboard_welcomeBack({ username: data.profile?.username || data.profile?.full_name || 'User' })}</h1>
        <p class="text-gray-600 text-sm sm:text-base mt-1">{i18n.dashboard_shopStatus()}</p>
      </div>

    <!-- Quick Actions - Mobile Optimized -->
    <div class="space-y-2 sm:space-y-3 mb-6">
      <!-- Top Row: Primary Actions -->
      <div class="grid grid-cols-2 gap-2 sm:gap-3">
        {@render actionButton('/sell', 'primary', 'w-full h-10 sm:h-12 text-sm sm:text-base', 'M12 4v16m8-8H4', i18n.dashboard_newListing())}
        {@render actionButton('/dashboard/upgrade', 'outline', 'w-full h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-900 hover:from-yellow-100 hover:to-orange-100 font-medium', 'M5 10l7-7m0 0l7 7m-7-7v18', i18n.dashboard_upgrade())}
      </div>
      
      <!-- Middle Row: Business Functions -->
      <div class="grid grid-cols-2 gap-2 sm:gap-3">
        {@render actionButton('/dashboard/order-management', 'outline', 'w-full h-10 sm:h-12 text-sm sm:text-base hover:bg-gray-50', 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', i18n.dashboard_orders())}
        {@render actionButton('/dashboard/sales', 'outline', 'w-full h-10 sm:h-12 text-sm sm:text-base hover:bg-gray-50', 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', i18n.dashboard_sales())}
      </div>
      
      <!-- Bottom Row: Management -->
      <div class="grid grid-cols-2 gap-2 sm:gap-3">
        {@render actionButton('/listings', 'outline', 'w-full h-10 sm:h-12 text-sm sm:text-base hover:bg-gray-50', 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', i18n.dashboard_listings())}
        {@render actionButton('/settings', 'outline', 'w-full h-10 sm:h-12 text-sm sm:text-base hover:bg-gray-50', 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', i18n.dashboard_settings())}
      </div>
      
      <!-- Admin Panel (Only for admins) -->
      {#if data.profile?.role === 'admin'}
        {@render actionButton('/admin/payouts', 'outline', 'w-full h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 text-purple-900 hover:from-purple-100 hover:to-pink-100 font-medium', 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', i18n.dashboard_adminPanel())}
      {/if}
    </div>

    <!-- Balance Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {@render balanceCard(i18n.dashboard_availableBalance(), `$${stats().totalRevenue.toFixed(2)}`, i18n.dashboard_totalEarned(), 'text-green-500', 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z')}
      {@render balanceCard(i18n.dashboard_monthSales(), stats().monthlySales.toString(), i18n.dashboard_lastMonthIncrease(), 'text-primary', 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z')}
    </div>


    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {#if isLoading}
        {#each Array(4) as _unused, i (i)} <!-- eslint-disable-line @typescript-eslint/no-unused-vars -->
          <div class="bg-white p-4 rounded-lg shadow-xs animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div class="h-8 bg-gray-300 rounded w-20 mb-1"></div>
            <div class="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        {/each}
      {:else}
      {@render statsCard(i18n.dashboard_totalRevenue(), `$${stats().totalRevenue.toFixed(0)}`, i18n.dashboard_allTime())}
      {@render statsCard(i18n.dashboard_activeListings(), stats().activeListings.toString(), i18n.dashboard_currentlyLive())}
      {@render statsCard(i18n.dashboard_totalViews(), stats().monthlyViews.toString(), i18n.dashboard_thisMonth())}
      {@render statsCard(i18n.dashboard_conversionRate(), `${stats().conversionRate.toFixed(1)}%`, i18n.dashboard_viewsToSales())}
      {/if}
    </div>

    <!-- Recent Orders -->
    <div class="bg-white rounded-lg shadow-xs mb-6">
      <div class="p-4 sm:p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">{i18n.dashboard_recentOrders()}</h2>
          <a href="/orders" class="text-sm text-primary hover:underline">{i18n.dashboard_viewAll()}</a>
        </div>
      </div>
      <div class="overflow-x-auto">
        {#if isLoading}
          <div class="p-4">
            {#each Array(3) as _unused, i (i)} <!-- eslint-disable-line @typescript-eslint/no-unused-vars -->
              <div class="flex items-center py-3 border-b border-gray-100 animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-32 mr-4"></div>
                <div class="h-4 bg-gray-200 rounded w-24 mr-4"></div>
                <div class="h-4 bg-gray-200 rounded w-20 mr-4"></div>
                <div class="h-6 bg-gray-200 rounded-full w-20 mr-4"></div>
                <div class="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            {/each}
          </div>
        {:else if recentOrders().length === 0}
          <div class="p-8 text-center text-gray-500">
            <p>{i18n.dashboard_noRecentOrders()}</p>
          </div>
        {:else}
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{i18n.dashboard_product()}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{i18n.dashboard_buyer()}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{i18n.dashboard_price()}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{i18n.dashboard_status()}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{i18n.dashboard_time()}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {#each recentOrders() as order}
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{order.productTitle}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{order.buyerName}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">${order.price}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-1 text-xs rounded-full {getStatusColor(order.status)}">
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-500">{timeAgo(order.date)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    </div>

    <!-- Active Listings Preview -->
    <div>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">{i18n.dashboard_yourActiveListings()}</h2>
        <a href="/listings" class="text-sm text-primary hover:underline">{i18n.dashboard_manageListings()}</a>
      </div>
      {#if isLoading}
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {#each Array(6) as _unused, i (i)} <!-- eslint-disable-line @typescript-eslint/no-unused-vars -->
            <ProductCardSkeleton />
          {/each}
        </div>
      {:else if activeListings().length === 0}
        <div class="text-center py-12 bg-white rounded-lg">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{i18n.dashboard_noActiveListings()}</h3>
          <p class="text-gray-500 mb-4">{i18n.dashboard_createFirstListing()}</p>
          <Button href="/sell">{i18n.dashboard_createListing()}</Button>
        </div>
      {:else}
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {#each activeListings() as product}
            <a href={getProductUrl(product)} class="group cursor-pointer">
              <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img src={product.images[0]} alt={product.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <p class="text-xs sm:text-sm font-medium truncate">{product.title}</p>
              <p class="text-sm font-bold">${product.price}</p>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
{/if}

<!-- Welcome Modal for first-time users -->
{#if showWelcomeModal}
  <WelcomeModal
    show={showWelcomeModal}
    username={data.profile?.username || 'there'}
    translations={{
      welcome: i18n.m.welcome_modal_welcome(),
      welcomeBrand: i18n.m.welcome_modal_welcomeBrand(),
      welcomePersonal: i18n.m.welcome_modal_welcomePersonal(),
      discover: i18n.m.welcome_modal_discover(),
      discoverDesc: i18n.m.welcome_modal_discoverDesc(),
      sell: i18n.m.welcome_modal_sell(),
      sellDesc: i18n.m.welcome_modal_sellDesc(),
      ready: i18n.m.welcome_modal_ready(),
      readyDesc: i18n.m.welcome_modal_readyDesc(),
      back: i18n.m.welcome_modal_back(),
      next: i18n.m.welcome_modal_next(),
      getStarted: i18n.m.welcome_modal_getStarted(),
      skip: i18n.m.welcome_modal_skip(),
      designer: i18n.m.welcome_modal_designer(),
      vintage: i18n.m.welcome_modal_vintage(),
      trending: i18n.m.welcome_modal_trending(),
      totalSales: i18n.m.welcome_modal_totalSales(),
      happySellers: i18n.m.welcome_modal_happySellers(),
      trustedMarketplace: i18n.m.welcome_modal_trustedMarketplace()
    }}
    onComplete={() => {
      showWelcomeModal = false;
    }}
  />
{/if}

<!-- Tutorial Toast -->
{#if currentTutorialStep}
  <TutorialToast
    step={currentTutorialStep.step}
    totalSteps={tutorial.getTotalSteps()}
    title={currentTutorialStep.title}
    description={currentTutorialStep.description}
    targetElement={currentTutorialStep.targetElement}
    position={currentTutorialStep.position || 'bottom'}
    onDismiss={handleTutorialDismiss}
    onNext={handleTutorialNext}
  />
{/if}