<script lang="ts">
  import { fly, fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import Avatar from './Avatar.svelte';
  import Tooltip from './primitives/tooltip/Tooltip.svelte';

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

  // Defensive check for stats
  const safeStats = $derived(stats || {
    rating: 0,
    totalSales: 0,
    responseTime: 24,
    joinedDate: '2024',
    verificationLevel: 'basic',
    lastActive: 'recently'
  });

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
  }[safeStats.verificationLevel] || {
    label: 'Verified',
    icon: '✓',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Email and phone verified'
  });

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
  }[getActivityStatus(safeStats.lastActive)]);
</script>

<div 
  class="bg-[color:var(--gray-50)] rounded-xl p-4 transition-colors duration-200 hover:shadow-sm {className}"
  onmouseenter={() => isHovering = true}
  onmouseleave={() => isHovering = false}
  role="region"
  aria-label="Seller information"
>
  <!-- Header -->
  <div class="flex items-center justify-between mb-3">
    <h3 class="text-sm font-semibold text-[color:var(--text-primary)] uppercase tracking-wide">{translations.soldBy || 'Sold by'}</h3>
    <span class="text-xs text-[color:var(--text-muted)]">{formatLastActive(safeStats.lastActive)}</span>
  </div>

  <!-- Seller Info -->
  <div class="flex items-start gap-3 mb-4">
    <!-- Enhanced Avatar with Tooltips -->
    <div class="relative">
      <Tooltip content="Seller profile - {name}" positioning={{ side: 'top' }}>
        <Avatar 
          name={name} 
          src={avatar} 
          size="lg"
          class="ring-2 ring-white shadow-xs cursor-pointer"
        />
      </Tooltip>
      
      <!-- Activity Indicator with Tooltip -->
      <Tooltip content={formatLastActive(safeStats.lastActive)} positioning={{ side: 'bottom', align: 'end' }}>
        <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 {activityColor} rounded-full border-2 border-white cursor-help"></div>
      </Tooltip>
      
      <!-- Enhanced Verification Badge with Tooltip -->
      {#if safeStats.verificationLevel !== 'basic'}
        <Tooltip content={verificationData.description} positioning={{ side: 'top', align: 'end' }}>
          <div 
            class="absolute -top-1 -right-1 w-6 h-6 {verificationData.bgColor} rounded-full flex items-center justify-center text-xs border-2 border-white cursor-help"
            in:scale={{ duration: 300, delay: 200, easing: quintOut }}
          >
            {verificationData.icon}
          </div>
        </Tooltip>
      {/if}
    </div>

    <!-- Seller Details -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <h4 class="font-semibold text-[color:var(--text-primary)] truncate">{name}</h4>
        {#if safeStats.verificationLevel !== 'basic'}
          <span 
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {verificationData.bgColor} {verificationData.color}"
            in:fly={{ x: 10, duration: 300, delay: 100, easing: quintOut }}
          >
            {verificationData.label}
          </span>
        {/if}
      </div>

      <!-- Enhanced Quick Stats with Tooltips -->
      <div class="space-y-1 text-sm text-[color:var(--text-muted)]">
        <!-- Rating with Detailed Tooltip -->
        <Tooltip 
          content="Average rating: {safeStats.rating?.toFixed(1) || '0.0'} stars from {safeStats.totalSales} completed sales"
          positioning={{ side: 'top' }}
        >
          <div class="flex items-center gap-1 cursor-help">
            <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="font-medium text-[color:var(--text-primary)]">{safeStats.rating?.toFixed(1) || '0.0'}</span>
            <span>({safeStats.totalSales} {translations.sales || 'sales'})</span>
          </div>
        </Tooltip>

        <!-- Response Time with Detailed Tooltip -->
        <Tooltip 
          content="Based on recent message response patterns. Messages are typically answered within this timeframe."
          positioning={{ side: 'top' }}
        >
          <div class="flex items-center gap-1 cursor-help">
            <svg class="w-4 h-4 text-[color:var(--text-link)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{formatResponseTime(safeStats.responseTime)}</span>
          </div>
        </Tooltip>

        <!-- Membership with Join Date Tooltip -->
        <Tooltip 
          content="Member since {new Date(safeStats.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"
          positioning={{ side: 'top' }}
        >
          <div class="flex items-center gap-1 cursor-help">
            <svg class="w-4 h-4 text-[color:var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 12v-6m6 6h-8a2 2 0 01-2-2v-6a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2z"/>
            </svg>
            <span>{formatJoinDate(safeStats.joinedDate)}</span>
          </div>
        </Tooltip>
      </div>
    </div>
  </div>

  <!-- Compact Mobile-First Action Buttons -->
  <div class="grid grid-cols-2 gap-3 mb-3">
    <button
      onclick={onMessage}
      class="mobile-action-btn secondary-action"
      aria-label="Send message to {name}"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
      <span class="mobile-btn-text">{translations.message || 'Message'}</span>
    </button>
    
    <button
      onclick={onFollow}
      class="mobile-action-btn {isFollowing ? 'following-action' : 'follow-action'}"
      aria-label="{isFollowing ? 'Unfollow' : 'Follow'} {name}"
    >
      {#if isFollowing}
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        <span class="mobile-btn-text">{translations.following || 'Following'}</span>
      {:else}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        <span class="mobile-btn-text">{translations.follow || 'Follow'}</span>
      {/if}
    </button>
  </div>

  <!-- Compact View Profile Link -->
  <button
    onclick={onViewProfile}
    class="mobile-profile-btn"
    aria-label="View full profile of {name}"
  >
    <span>{translations.viewFullProfile || 'View profile'}</span>
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
            {#if safeStats.avgShippingHours}
              {safeStats.avgShippingHours < 24 ? `${safeStats.avgShippingHours}h` : `${Math.ceil(safeStats.avgShippingHours / 24)}d`}
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
          {#if safeStats.weeklySales > 0}
            <div>• Sold {safeStats.weeklySales} {safeStats.weeklySales === 1 ? 'item' : 'items'} this week</div>
          {/if}
          {#if safeStats.onTimeShippingRate !== null && safeStats.onTimeShippingRate !== undefined}
            <div>• {safeStats.onTimeShippingRate}% of orders shipped on time</div>
          {/if}
          {#if safeStats.responseTime}
            <div>• Responds to messages in {safeStats.responseTime} hours</div>
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

<style>
  /* Mobile-First Action Button System - Perfect 36-40px Touch Targets */
  :global(.mobile-action-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 38px; /* Perfect 36-40px range */
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-lg);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    cursor: pointer;
    transition: all var(--duration-fast) cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    outline: none;
    position: relative;
    overflow: hidden;
  }

  :global(.mobile-action-btn:focus-visible) {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  :global(.mobile-action-btn:active) {
    transform: translateY(1px);
  }

  /* Secondary Action (Message) - Clean, Professional */
  :global(.secondary-action) {
    background: var(--surface-base);
    color: var(--text-primary);
    border: 2px solid var(--border-default);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  :global(.secondary-action:hover) {
    background: var(--surface-subtle);
    border-color: var(--text-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  /* Follow Action - Primary Brand Color */
  :global(.follow-action) {
    background: var(--text-primary);
    color: var(--surface-base);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  :global(.follow-action:hover) {
    background: var(--text-secondary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  /* Following Action - Muted State */
  :global(.following-action) {
    background: var(--surface-muted);
    color: var(--text-primary);
    border: 2px solid var(--border-emphasis);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  :global(.following-action:hover) {
    background: var(--surface-emphasis);
    border-color: var(--status-error-border);
    color: var(--status-error-text);
  }

  /* Mobile Button Text - Compact but Readable */
  :global(.mobile-btn-text) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80px;
  }

  /* Profile Button - Subtle but Accessible */
  :global(.mobile-profile-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    min-height: 36px;
    padding: var(--space-2) var(--space-3);
    background: none;
    border: none;
    color: var(--primary);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    cursor: pointer;
    transition: all var(--duration-fast) ease;
    border-radius: var(--radius-md);
  }

  :global(.mobile-profile-btn:hover) {
    background: var(--surface-subtle);
    color: var(--primary-600);
  }

  :global(.mobile-profile-btn:focus-visible) {
    outline: 2px solid var(--state-focus);
    outline-offset: 2px;
  }

  /* Mobile Optimizations - Responsive Touch Targets */
  @media (max-width: 640px) {
    :global(.mobile-action-btn) {
      min-height: 40px; /* Slightly larger on very small screens */
      font-size: var(--text-xs);
      gap: var(--space-1);
    }
    
    :global(.mobile-btn-text) {
      max-width: 60px;
      font-size: 11px;
    }
    
    :global(.mobile-profile-btn) {
      min-height: 38px;
      font-size: var(--text-xs);
    }
  }

  /* Touch Device Optimizations */
  @media (pointer: coarse) {
    :global(.mobile-action-btn) {
      min-height: 40px;
      padding: var(--space-3);
    }
    
    :global(.mobile-profile-btn) {
      min-height: 38px;
      padding: var(--space-3);
    }
  }

  /* Haptic Feedback Enhancement - Satisfying Interactions */
  :global(.mobile-action-btn:active) {
    animation: tap-feedback 0.1s ease;
  }

  @keyframes tap-feedback {
    0% { transform: scale(1); }
    50% { transform: scale(0.96); }
    100% { transform: scale(1); }
  }

  /* High Contrast Mode Support */
  @media (prefers-contrast: high) {
    :global(.mobile-action-btn) {
      border: 2px solid;
    }
  }

  /* Reduced Motion Support */
  @media (prefers-reduced-motion: reduce) {
    :global(.mobile-action-btn) {
      transition: none;
      animation: none;
    }
  }
</style>