<script lang="ts">
  import type { Product as UIProduct } from '../../types/product';
  import ProductCard from '../../compositions/cards/ProductCard.svelte';
  import PromotedListingsBanner from '../../compositions/banners/PromotedListingsBanner.svelte';

  interface Props {
    promotedProducts: UIProduct[];
    onProductClick: (product: UIProduct) => void;
    onFavorite: (productId: string) => void;
    onBuy?: (productId: string, selectedSize?: string) => void;
    favoritesState: any;
    formatPrice: (price: number) => string;
    translations: {
      promoted_listings: string;
      promoted_description: string;
      common_currency: string;
      product_addToFavorites: string;
      seller_unknown: string;
      condition_brandNewWithTags: string;
      condition_newWithoutTags: string;
      condition_new: string;
      condition_likeNew: string;
      condition_good: string;
      condition_worn: string;
      condition_fair: string;
      categoryTranslation: (categoryName: string) => string;
      banner_curatedPicks?: string;
      banner_defaultCopy?: string;
      banner_tabSellers?: string;
      banner_tabBrands?: string;
      banner_viewAll?: string;
      banner_ariaPrevious?: string;
      banner_ariaNext?: string;
    };
    showToggle?: boolean;
    activeTab?: 'sellers' | 'brands';
    onToggle?: (tab: 'sellers' | 'brands') => void;
    onViewAll?: () => void;
    class?: string;
  }

  let {
    promotedProducts,
    onProductClick,
    onFavorite,
    onBuy,
    favoritesState,
    formatPrice,
    translations,
    showToggle = false,
    activeTab = 'sellers',
    onToggle,
    onViewAll,
    class: className = ''
  }: Props = $props();

  // Use provided list (homepage already filters/chooses boosted); limit to 8
  const activePromotedProducts: UIProduct[] = $derived(
    (promotedProducts || []).slice(0, 8)
  );

  let promotedScrollContainer = $state<HTMLElement | null>(null);
  let canScrollLeft = $state(false);
  let canScrollRight = $state(true);

  function updateScrollIndicators() {
    if (!promotedScrollContainer) return;
    const { scrollLeft, scrollWidth, clientWidth } = promotedScrollContainer;
    canScrollLeft = scrollLeft > 10;
    canScrollRight = scrollLeft < scrollWidth - clientWidth - 10;
  }

  function scrollLeft() {
    if (promotedScrollContainer) {
      const cardWidth = promotedScrollContainer.querySelector('[data-promoted-card]')?.clientWidth || 280;
      promotedScrollContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  }

  function scrollRight() {
    if (promotedScrollContainer) {
      const cardWidth = promotedScrollContainer.querySelector('[data-promoted-card]')?.clientWidth || 280;
      promotedScrollContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  }

  function handleKeyboardScroll(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollLeft();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollRight();
    }
  }

  // Initialize scroll indicators on mount
  $effect(() => {
    if (promotedScrollContainer) {
      updateScrollIndicators();
    }
  });
</script>

{#if activePromotedProducts.length > 0}
	<!-- Enhanced section with separator banner -->
	<section class="{className}">
		<!-- Section Banner with proper container -->
		<div class="px-[var(--space-3)] sm:px-[var(--space-4)] lg:px-[var(--space-6)] mb-[var(--space-1)]">
			<PromotedListingsBanner
				heading={translations.promoted_listings}
				copy={translations.promoted_description}
				itemCount={activePromotedProducts.length}
				showNavigation={false}
				{showToggle}
				{activeTab}
				{onToggle}
				cta={onViewAll ? { label: translations.banner_viewAll ?? "View All", action: onViewAll } : undefined}
				translations={{
					curatedPicks: translations.banner_curatedPicks,
					defaultCopy: translations.banner_defaultCopy,
					tabSellers: translations.banner_tabSellers,
					tabBrands: translations.banner_tabBrands,
					viewAll: translations.banner_viewAll,
					ariaPrevious: translations.banner_ariaPrevious,
					ariaNext: translations.banner_ariaNext
				}}
			/>
		</div>

		<!-- Horizontal Scrollable Cards matching grid card sizes -->
		<div class="relative px-[var(--space-3)] sm:px-[var(--space-4)] lg:px-[var(--space-6)]">
			<!-- Mobile scroll indicators - fade gradients -->
			<div 
				class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[color:var(--surface-base)] to-transparent z-10 pointer-events-none transition-opacity duration-200 sm:hidden"
				class:opacity-0={!canScrollLeft}
				class:opacity-100={canScrollLeft}
				aria-hidden="true"
			></div>
			<div 
				class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[color:var(--surface-base)] to-transparent z-10 pointer-events-none transition-opacity duration-200 sm:hidden"
				class:opacity-0={!canScrollRight}
				class:opacity-100={canScrollRight}
				aria-hidden="true"
			></div>
			
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div 
				class="flex gap-[var(--space-2)] sm:gap-[var(--space-3)] overflow-x-auto scrollbarhide promoted-cards-container" 
				style="scroll-snap-type: x mandatory;" 
				data-promoted-scroll 
				bind:this={promotedScrollContainer}
				role="region"
				aria-label="Promoted listings - horizontal scroll, use arrow keys to navigate"
				tabindex="0"
				onkeydown={handleKeyboardScroll}
				onscroll={updateScrollIndicators}
			>
        {#each activePromotedProducts as product, index (product.id)}
          <div class="home-promoted-card flex-shrink-0 snap-start" data-promoted-card>
						<ProductCard
							{product}
							onclick={onProductClick}
							onFavorite={onFavorite}
							favorited={favoritesState.favorites?.[product.id] || false}
							favoritesState={favoritesState}
							showBoostBadge={false}
							showSellerBadges={false}
							priority={index < 4}
							{index}
							totalCount={activePromotedProducts.length}
							translations={{
								addToFavorites: translations.product_addToFavorites,
								currency: translations.common_currency,
								brandNewWithTags: translations.condition_brandNewWithTags,
								newWithoutTags: translations.condition_newWithoutTags,
								new: translations.condition_new,
								likeNew: translations.condition_likeNew,
								good: translations.condition_good,
								worn: translations.condition_worn,
								fair: translations.condition_fair,
								formatPrice: formatPrice,
								categoryTranslation: translations.categoryTranslation
							}}
						/>
					</div>
				{/each}
			</div>
			
			<!-- Mobile swipe hint - shows briefly then fades -->
			{#if canScrollRight && activePromotedProducts.length > 2}
				<div class="flex justify-center mt-[var(--space-2)] sm:hidden" aria-hidden="true">
					<div class="swipe-hint flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
						<svg class="w-4 h-4 animate-swipe-hint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
						<span>Swipe for more</span>
					</div>
				</div>
			{/if}
		</div>
	</section>
{/if}


<style>
  :global(.home-promoted-card) {
    flex-basis: calc((100% - var(--space-2)) / 2);
    max-width: calc((100% - var(--space-2)) / 2);
  }

  @media (min-width: 640px) {
    :global(.home-promoted-card) {
      flex-basis: calc((100% - (2 * var(--space-3))) / 3);
      max-width: calc((100% - (2 * var(--space-3))) / 3);
    }
  }

  @media (min-width: 1024px) {
    :global(.home-promoted-card) {
      flex-basis: calc((100% - (3 * var(--space-3))) / 4);
      max-width: calc((100% - (3 * var(--space-3))) / 4);
    }
  }

  @media (min-width: 1280px) {
    :global(.home-promoted-card) {
      flex-basis: calc((100% - (4 * var(--space-3))) / 5);
      max-width: calc((100% - (4 * var(--space-3))) / 5);
    }
  }

  /* Swipe hint animation - subtle pulsing arrow */
  @keyframes swipe-hint {
    0%, 100% {
      transform: translateX(0);
      opacity: 0.7;
    }
    50% {
      transform: translateX(4px);
      opacity: 1;
    }
  }

  .animate-swipe-hint {
    animation: swipe-hint 1.5s ease-in-out infinite;
  }

  /* Fade out the hint after a few seconds */
  .swipe-hint {
    animation: fade-out 4s ease-in-out forwards;
  }

  @keyframes fade-out {
    0%, 70% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      visibility: hidden;
    }
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .animate-swipe-hint {
      animation: none;
    }
    .swipe-hint {
      animation: none;
      opacity: 0.7;
    }
  }
</style>


