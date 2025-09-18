<script lang="ts">
  import type { Product as UIProduct } from './types/product';
  import { ProductCard } from './';
  import PromotedListingsBanner from './components/home/PromotedListingsBanner.svelte';

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
</script>

{#if activePromotedProducts.length > 0}
	<!-- Enhanced section with separator banner -->
	<section class="pb-3 sm:pb-4 {className}">
		<!-- Section Banner with proper container -->
		<div class="px-2 sm:px-4 lg:px-6 mb-4 sm:mb-6">
			<PromotedListingsBanner
				heading={translations.promoted_listings}
				copy="Stand out from the crowd. Get your listings seen by thousands of buyers daily."
				itemCount={activePromotedProducts.length}
				showNavigation={false}
				{showToggle}
				{activeTab}
				{onToggle}
				cta={onViewAll ? { label: "View All", action: onViewAll } : undefined}
			/>
		</div>

		<!-- Horizontal Scrollable Cards matching grid card sizes -->
		<div class="relative px-2 sm:px-4 lg:px-6">
			<div class="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide promoted-cards-container" style="scroll-snap-type: x mandatory;" data-promoted-scroll bind:this={promotedScrollContainer}>
				{#each activePromotedProducts as product (product.id)}
					<div class="flex-shrink-0 snap-start promoted-card" data-promoted-card>
						<ProductCard
							{product}
							onclick={onProductClick}
							onFavorite={onFavorite}
							favorited={favoritesState.favorites?.[product.id] || false}
							favoritesState={favoritesState}
							showBoostBadge={false}
							showSellerBadges={false}
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
		</div>
	</section>
{/if}

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Match exact grid card sizes - use same padding as section container */

  .promoted-card {
    /* Mobile: 2 columns like grid-cols-2 */
    width: calc((100vw - 1rem - 0.75rem) / 2); /* 100vw - padding - gap */
  }

  @media (min-width: 640px) {
    .promoted-card {
      /* Small screens: 3 columns like sm:grid-cols-3 */
      width: calc((100vw - 2rem - 2rem) / 3); /* 100vw - padding - gaps */
    }
  }

  @media (min-width: 1024px) {
    .promoted-card {
      /* Large screens: 4 columns like lg:grid-cols-4 */
      width: calc((100vw - 3rem - 3rem) / 4);
    }
  }

  @media (min-width: 1280px) {
    .promoted-card {
      /* XL screens: 5 columns like xl:grid-cols-5 */
      width: calc((100vw - 3rem - 4rem) / 5);
    }
  }
</style>

