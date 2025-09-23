<script lang="ts">
  import type { Product } from '../../types/product';
  
  interface Seller {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    itemCount: number;
  }

  interface QuickFilter {
    label: string;
    value: string;
    style?: 'default' | 'price' | 'new' | 'condition' | 'brand' | 'size';
  }
  
  interface Props {
    topSellers: Seller[];
    quickFilters?: QuickFilter[];
    onSellerClick: (seller: Seller) => void;
    onFilterClick?: (filter: string) => void;
    translations: {
      quickShop: string;
      shopByCondition: string;
      shopByPrice: string;
      quickAccess: string;
      topSellers: string;
      newWithTags: string;
      likeNew: string;
      good: string;
      fair: string;
      under25: string;
      cheapest: string;
      newest: string;
      premium: string;
      myFavorites: string;
      browseAll: string;
    };
  }
  
  let { 
    topSellers,
    quickFilters = [
      { label: 'Under $20', value: 'price_under_20', style: 'price' },
      { label: 'New Today', value: 'new_today', style: 'new' },
      { label: 'Size S', value: 'size_s', style: 'size' },
      { label: 'Size M', value: 'size_m', style: 'size' }
    ],
    onSellerClick,
    onFilterClick = () => {},
    translations
  }: Props = $props();


  function getFilterButtonClasses(style: string = 'default'): string {
    const baseClasses = 'px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:ring-offset-1';
    
    switch(style) {
      case 'price':
        return `${baseClasses} bg-[color:var(--success-subtle)] text-[color:var(--success-text)] hover:bg-[color:var(--success-muted)]`;
      case 'new':
        return `${baseClasses} bg-[color:var(--primary-subtle)] text-[color:var(--primary-text)] hover:bg-[color:var(--primary-muted)]`;
      case 'condition':
        return `${baseClasses} bg-[color:var(--accent-subtle)] text-[color:var(--accent-text)] hover:bg-[color:var(--accent-muted)]`;
      case 'brand':
      case 'size':
        return `${baseClasses} bg-[color:var(--surface-subtle)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)]`;
      default:
        return `${baseClasses} bg-[color:var(--surface-subtle)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)]`;
    }
  }
</script>

<div class="w-full bg-[color:var(--surface-base)] rounded-xl shadow-lg border border-[color:var(--border-default)] overflow-hidden max-w-4xl mx-auto">

  <!-- Main Content -->
  <div class="p-6 space-y-6">
    
    <!-- Condition Filters -->
    <div class="space-y-3">
      <h3 class="text-xs uppercase tracking-wide font-semibold text-[color:var(--text-secondary)]">{translations.shopByCondition}</h3>
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button 
          onclick={() => onFilterClick('condition=brand_new_with_tags')}
          class="shrink-0 px-4 py-2 bg-[color:var(--surface-subtle)] border border-[color:var(--border-default)] rounded-lg text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] hover:border-[color:var(--border-hover)] transition-colors min-h-[36px] focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:ring-offset-1"
        >
          🏷️ {translations.newWithTags}
        </button>
        <button 
          onclick={() => onFilterClick('condition=new_without_tags')}
          class="shrink-0 px-4 py-2 bg-[color:var(--surface-subtle)] border border-[color:var(--border-default)] rounded-lg text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] hover:border-[color:var(--border-hover)] transition-colors min-h-[36px] focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:ring-offset-1"
        >
          ✨ {translations.likeNew}
        </button>
        <button 
          onclick={() => onFilterClick('condition=like_new')}
          class="shrink-0 px-4 py-2 bg-[color:var(--surface-subtle)] border border-[color:var(--border-default)] rounded-lg text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] hover:border-[color:var(--border-hover)] transition-colors min-h-[36px] focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:ring-offset-1"
        >
          👍 {translations.good}
        </button>
        <button 
          onclick={() => onFilterClick('condition=good')}
          class="shrink-0 px-4 py-2 bg-[color:var(--surface-subtle)] border border-[color:var(--border-default)] rounded-lg text-sm font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] hover:border-[color:var(--border-hover)] transition-colors min-h-[36px] focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:ring-offset-1"
        >
          📦 {translations.fair}
        </button>
      </div>
    </div>

    <!-- Price & Sort Filters -->
    <div class="space-y-3">
      <h3 class="text-xs uppercase tracking-wide font-semibold text-[color:var(--text-secondary)]">{translations.shopByPrice}</h3>
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button 
          onclick={() => onFilterClick('under25')}
          class="shrink-0 px-4 py-2 bg-[color:var(--primary)] text-[color:var(--primary-fg)] rounded-lg text-sm font-medium hover:bg-[color:var(--primary-hover)] transition-colors min-h-[36px] focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:ring-offset-1"
        >
          💰 {translations.under25}
        </button>
        <button 
          onclick={() => onFilterClick('price-low')}
          class="shrink-0 px-4 py-2 bg-[color:var(--surface-muted)] border border-[color:var(--border-default)] text-[color:var(--text-primary)] rounded-lg text-sm font-medium hover:bg-[color:var(--surface-subtle)] hover:border-[color:var(--border-hover)] transition-colors min-h-[36px] focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:ring-offset-1"
        >
          💸 {translations.cheapest}
        </button>
        <button 
          onclick={() => onFilterClick('newest')}
          class="shrink-0 px-4 py-2 bg-[color:var(--surface-muted)] border border-[color:var(--border-default)] text-[color:var(--text-primary)] rounded-lg text-sm font-medium hover:bg-[color:var(--surface-subtle)] hover:border-[color:var(--border-hover)] transition-colors min-h-[36px] focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:ring-offset-1"
        >
          📅 {translations.newest}
        </button>
        <button 
          onclick={() => onFilterClick('price-high')}
          class="shrink-0 px-4 py-2 bg-[color:var(--surface-muted)] border border-[color:var(--border-default)] text-[color:var(--text-primary)] rounded-lg text-sm font-medium hover:bg-[color:var(--surface-subtle)] hover:border-[color:var(--border-hover)] transition-colors min-h-[36px] focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:ring-offset-1"
        >
          🔥 {translations.premium}
        </button>
      </div>
    </div>

  </div>

  <!-- Top Sellers -->
  {#if topSellers.length > 0}
    <div class="border-t border-[color:var(--border-subtle)] p-6 bg-[color:var(--surface-subtle)]">
      <div class="space-y-3">
        <h3 class="text-xs uppercase tracking-wide font-semibold text-[color:var(--text-secondary)] flex items-center gap-2">
          <span class="w-2 h-2 bg-[color:var(--primary)] rounded-full animate-pulse"></span>
          {translations.topSellers}
        </h3>
        <div class="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          {#each topSellers.slice(0, 6) as seller, index}
            <button
              onclick={() => onSellerClick(seller)}
              class="shrink-0 flex items-center gap-3 px-4 py-3 bg-[color:var(--surface-base)] border border-[color:var(--border-default)] rounded-xl hover:border-[color:var(--border-hover)] hover:shadow-sm transition-all duration-200 group min-w-[140px] focus:outline-none focus:ring-2 focus:ring-[color:var(--state-focus)] focus:ring-offset-1"
              aria-label="View {seller.name || seller.username}'s shop"
            >
              <div class="relative">
                <div class="w-10 h-10 rounded-full bg-[color:var(--surface-subtle)] overflow-hidden border-2 border-[color:var(--surface-base)] shadow-sm">
                  {#if seller.avatar}
                    <img 
                      src={seller.avatar} 
                      alt={seller.name || seller.username}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <div class="w-full h-full flex items-center justify-center text-[color:var(--text-secondary)] font-bold text-sm">
                      {(seller.name || seller.username || '?')[0].toUpperCase()}
                    </div>
                  {/if}
                </div>
                {#if index < 3}
                  <div class="absolute -top-1 -right-1 bg-[color:var(--primary)] rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    <span class="text-[color:var(--primary-fg)] text-xs font-bold">{index + 1}</span>
                  </div>
                {/if}
              </div>
              <div class="flex flex-col items-start min-w-0">
                <span class="text-sm font-semibold text-[color:var(--text-primary)] truncate">
                  {(seller.name || seller.username || 'User').split(' ')[0]}
                </span>
                <span class="text-xs text-[color:var(--text-secondary)]">
                  {seller.itemCount || 0} items
                </span>
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

