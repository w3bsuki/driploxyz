<script lang="ts">
  import * as i18n from '@repo/i18n';
  const m: any = i18n;
  // @ts-expect-error: Svelte component types are resolved by svelte2tsx during build
  import Avatar from '../ui/Avatar.svelte';

  interface SellerStats {
    rating: number;
    totalSales: number;
    responseTime: number;
    joinedDate: string;
    verificationLevel?: 'basic' | 'verified' | 'superstar';
    lastActive?: string;
  }

  interface Props {
    id: string;
    name: string;
    avatar?: string;
    stats: SellerStats;
    onMessage?: () => void;
    onViewProfile?: () => void;
    class?: string;
    translations?: {
      soldBy?: string;
      message?: string;
      viewFullProfile?: string;
      sales?: string;
      memberFor?: string;
      newMember?: string;
    };
  }

  let { 
    id,
    name,
    avatar,
    stats,
    onMessage,
    onViewProfile,
    class: className = '',
    translations = {}
  }: Props = $props();

  function formatJoinDate(dateString: string) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const years = now.getFullYear() - date.getFullYear();
      const months = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
      
      if (years > 0) return `${translations.memberFor || m.seller_memberFor()} ${years} year${years > 1 ? 's' : ''}`;
      if (months > 0) return `${translations.memberFor || m.seller_memberFor()} ${months} month${months > 1 ? 's' : ''}`;
      return translations.newMember || m.seller_newMember();
    } catch {
      return translations.newMember || m.seller_newMember();
    }
  }
</script>

<div 
  class="bg-white border border-gray-200 rounded-[var(--card-radius)] p-3 {className}"
  role="region"
  aria-label="Seller information"
>
  <!-- Header -->
  <div class="flex items-center justify-between mb-2">
    <h3 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">{translations.soldBy || m.seller_soldBy()}</h3>
  </div>

  <!-- Seller Info -->
  <div class="flex items-center gap-2 mb-3">
    <Avatar 
      name={name} 
      src={avatar} 
      size="md"
      class="shrink-0"
    />
    
    <div class="flex-1 min-w-0">
      <h4 class="font-medium text-gray-900 truncate mb-0.5">{name}</h4>
      <div class="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
        <!-- Rating -->
        <div class="flex items-center gap-1">
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span class="font-medium text-gray-900">{stats.rating?.toFixed(1) || '0.0'}</span>
          <span>({stats.totalSales} {translations.sales || m.seller_sales()})</span>
        </div>
      </div>
      <div class="text-xs sm:text-sm text-gray-500 mt-1">
        {formatJoinDate(stats.joinedDate)}
      </div>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex gap-2">
    <button
      onclick={onMessage}
      class="btn-action btn-secondary flex-1"
      aria-label="Send message to {name}"
      type="button"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
      <span>{translations.message || m.message()}</span>
    </button>
    
    <button
      onclick={onViewProfile}
      class="btn-action btn-ghost"
      aria-label="View full profile of {name}"
      type="button"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  </div>
</div>

<style>
  .btn-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 40px;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
  }

  .btn-action:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgb(59 130 246);
  }

  .btn-secondary {
    background: white;
    color: rgb(55 65 81);
    border: 1px solid rgb(209 213 219);
  }

  .btn-secondary:hover {
    background: rgb(249 250 251);
    border-color: rgb(156 163 175);
  }

  .btn-ghost {
    background: transparent;
    color: rgb(107 114 128);
    border: 1px solid transparent;
    padding: 0.5rem 0.75rem;
  }

  .btn-ghost:hover {
    background: rgb(243 244 246);
    color: rgb(55 65 81);
  }

  .btn-action:active {
    transform: scale(0.95);
  }

  @media (max-width: 640px) {
    .btn-action {
      min-height: 36px;
      font-size: 0.75rem;
      padding: 0.5rem 0.75rem;
    }
  }
</style>
