<script lang="ts">
  import { fly, fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import Avatar from './Avatar.svelte';

  interface SellerStats {
    rating: number;
    totalSales: number;
    responseTime: number; // in hours
    joinedDate: string;
    verificationLevel: 'basic' | 'verified' | 'superstar';
    lastActive: string;
  }

  interface Props {
    id: string;
    name: string;
    avatar?: string;
    stats: SellerStats;
    isFollowing?: boolean;
    onFollow?: () => void;
    onMessage?: () => void;
    onViewProfile?: () => void;
    showFullStats?: boolean;
    class?: string;
    translations?: {
      soldBy?: string;
      message?: string;
      follow?: string;
      following?: string;
      viewFullProfile?: string;
      sales?: string;
      activeNow?: string;
      activeAgo?: string;
      memberFor?: string;
      newMember?: string;
      trustedSeller?: string;
      superstarSeller?: string;
      verified?: string;
      positiveReviews?: string;
      avgShipping?: string;
      recentActivity?: string;
    };
  }

  let { 
    id,
    name,
    avatar,
    stats,
    isFollowing = false,
    onFollow,
    onMessage,
    onViewProfile,
    showFullStats = false,
    class: className = '',
    translations = {}
  }: Props = $props();

  let isHovering = $state(false);

  const verificationData = $derived({
    'basic': {
      label: translations.verified || 'Verified',
      icon: '✓',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Email and phone verified'
    },
    'verified': {
      label: translations.trustedSeller || 'Trusted Seller',
      icon: '🛡️',
      color: 'text-[color:var(--text-link)]',
      bgColor: 'bg-blue-100',
      description: 'ID verified, excellent ratings'
    },
    'superstar': {
      label: translations.superstarSeller || 'Superstar Seller',
      icon: '⭐',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Top 1% seller, premium service'
    }
  }[stats.verificationLevel]);

  function formatResponseTime(hours: number) {
    if (hours < 1) return 'Usually responds within 1 hour';
    if (hours < 24) return `Usually responds within ${Math.round(hours)} hours`;
    return `Usually responds within ${Math.round(hours / 24)} days`;
  }

  function formatJoinDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const years = now.getFullYear() - date.getFullYear();
    const months = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
    
    if (years > 0) return `${translations.memberFor || 'Member for'} ${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) return `${translations.memberFor || 'Member for'} ${months} month${months > 1 ? 's' : ''}`;
    return translations.newMember || 'New member';
  }

  function formatLastActive(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return translations.activeNow || 'Active now';
    if (diffInHours < 24) return `Active ${Math.round(diffInHours)}h ${translations.activeAgo || 'ago'}`;
    const days = Math.round(diffInHours / 24);
    return `Active ${days}d ${translations.activeAgo || 'ago'}`;
  }

  function getActivityStatus(lastActive: string) {
    const date = new Date(lastActive);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'online';
    if (diffInHours < 24) return 'recent';
    return 'offline';
  }

  const activityColor = $derived({
    'online': 'bg-green-500',
    'recent': 'bg-yellow-500',
    'offline': 'bg-[color:var(--surface-emphasis)]'
  }[getActivityStatus(stats.lastActive)]);
</script>

<div 
  class="bg-[color:var(--surface-base)] border rounded-xl p-4 transition-colors duration-200 hover:shadow-md {className}"
  onmouseenter={() => isHovering = true}
  onmouseleave={() => isHovering = false}
  role="region"
  aria-label="Seller information"
>
  <!-- Header -->
  <div class="flex items-center justify-between mb-3">
    <h3 class="text-sm font-semibold text-[color:var(--text-primary)] uppercase tracking-wide">{translations.soldBy || 'Sold by'}</h3>
    <span class="text-xs text-[color:var(--text-muted)]">{formatLastActive(stats.lastActive)}</span>
  </div>

  <!-- Seller Info -->
  <div class="flex items-start gap-3 mb-4">
    <!-- Avatar with Activity Indicator -->
    <div class="relative">
      <Avatar 
        name={name} 
        src={avatar} 
        size="lg"
        class="ring-2 ring-white shadow-xs"
      />
      <!-- Activity Indicator -->
      <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 {activityColor} rounded-full border-2 border-white"></div>
      
      <!-- Verification Badge -->
      {#if stats.verificationLevel !== 'basic'}
        <div 
          class="absolute -top-1 -right-1 w-6 h-6 {verificationData.bgColor} rounded-full flex items-center justify-center text-xs border-2 border-white"
          title={verificationData.description}
          in:scale={{ duration: 300, delay: 200, easing: quintOut }}
        >
          {verificationData.icon}
        </div>
      {/if}
    </div>

    <!-- Seller Details -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <h4 class="font-semibold text-[color:var(--text-primary)] truncate">{name}</h4>
        {#if stats.verificationLevel !== 'basic'}
          <span 
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {verificationData.bgColor} {verificationData.color}"
            in:fly={{ x: 10, duration: 300, delay: 100, easing: quintOut }}
          >
            {verificationData.label}
          </span>
        {/if}
      </div>

      <!-- Quick Stats -->
      <div class="space-y-1 text-sm text-[color:var(--text-muted)]">
        <!-- Rating -->
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span class="font-medium text-[color:var(--text-primary)]">{stats.rating?.toFixed(1) || '0.0'}</span>
          <span>({stats.totalSales} {translations.sales || 'sales'})</span>
        </div>

        <!-- Response Time -->
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4 text-[color:var(--text-link)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{formatResponseTime(stats.responseTime)}</span>
        </div>

        <!-- Membership -->
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4 text-[color:var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 12v-6m6 6h-8a2 2 0 01-2-2v-6a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2z"/>
          </svg>
          <span>{formatJoinDate(stats.joinedDate)}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="grid grid-cols-2 gap-2 mb-3">
    <button
      onclick={onMessage}
      class="flex items-center justify-center gap-2 px-3 py-2 border border-[color:var(--border-default)] rounded-lg text-sm font-medium text-[color:var(--text-primary)] hover:bg-[color:var(--surface-subtle)] transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
      {translations.message || 'Message'}
    </button>
    
    <button
      onclick={onFollow}
      class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
             {isFollowing 
               ? 'bg-[color:var(--surface-muted)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-emphasis)]' 
               : 'bg-black text-white hover:bg-gray-800'}"
    >
      {#if isFollowing}
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        {translations.following || 'Following'}
      {:else}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        {translations.follow || 'Follow'}
      {/if}
    </button>
  </div>

  <!-- View Profile Link -->
  <button
    onclick={onViewProfile}
    class="w-full flex items-center justify-center gap-2 text-sm text-[color:var(--text-link)] hover:text-[color:var(--text-link-hover)] font-medium transition-colors"
  >
    {translations.viewFullProfile || 'View full profile'}
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
    </svg>
  </button>

  <!-- Extended Stats (if enabled) -->
  {#if showFullStats}
    <div 
      class="mt-4 pt-4 border-t border-[color:var(--border-subtle)] space-y-3"
      in:fade={{ duration: 300, delay: 200 }}
    >
      <!-- Trust Metrics -->
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div class="text-center p-2 bg-[color:var(--surface-subtle)] rounded-lg">
          <div class="font-semibold text-[color:var(--text-primary)]">98%</div>
          <div class="text-[color:var(--text-muted)]">{translations.positiveReviews || 'Positive reviews'}</div>
        </div>
        <div class="text-center p-2 bg-[color:var(--surface-subtle)] rounded-lg">
          <div class="font-semibold text-[color:var(--text-primary)]">
            {#if stats.avgShippingHours}
              {stats.avgShippingHours < 24 ? `${stats.avgShippingHours}h` : `${Math.ceil(stats.avgShippingHours / 24)}d`}
            {:else}
              N/A
            {/if}
          </div>
          <div class="text-[color:var(--text-muted)]">{translations.avgShipping || 'Avg shipping'}</div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="text-xs text-[color:var(--text-muted)]">
        <div class="font-medium text-[color:var(--text-primary)] mb-1">{translations.recentActivity || 'Recent activity'}</div>
        <div class="space-y-1">
          {#if stats.weeklySales > 0}
            <div>• Sold {stats.weeklySales} {stats.weeklySales === 1 ? 'item' : 'items'} this week</div>
          {/if}
          {#if stats.onTimeShippingRate !== null && stats.onTimeShippingRate !== undefined}
            <div>• {stats.onTimeShippingRate}% of orders shipped on time</div>
          {/if}
          {#if stats.responseTime}
            <div>• Responds to messages in {stats.responseTime} hours</div>
          {:else}
            <div>• New seller - building reputation</div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Hover Animation -->
  {#if isHovering}
    <div 
      class="absolute inset-0 rounded-xl bg-linear-to-r from-blue-50 to-purple-50 opacity-30 pointer-events-none"
      in:fade={{ duration: 200 }}
    ></div>
  {/if}
</div>