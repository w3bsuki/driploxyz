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
	<section class="pb-2 sm:pb-3 {className}">
		<!-- Section Banner with proper container -->
		<div class="px-2 sm:px-4 lg:px-6 mb-3 sm:mb-4">
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
		<div class="relative px-2 sm:px-4 lg:px-6">
			<div class="flex gap-3 sm:gap-4 overflow-x-auto scrollbarhide promoted-cards-container" style="scroll-snap-type: x mandatory;" data-promoted-scroll bind:this={promotedScrollContainer}>
				{#each activePromotedProducts as product (product.id)}
					<div class="flex-shrink-0 snap-start basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5" data-promoted-card>
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


