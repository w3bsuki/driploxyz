<script lang="ts">
  import type { Product as UIProduct } from '../types';
  import { ProductCard } from './';

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
  }

  let {
    promotedProducts,
    onProductClick,
    onFavorite,
    onBuy,
    favoritesState,
    formatPrice,
    translations
  }: Props = $props();

  // Use provided list (homepage already filters/chooses boosted); limit to 8
  const activePromotedProducts: UIProduct[] = $derived(
    (promotedProducts || []).slice(0, 8)
  );
  
  let promotedScrollContainer = $state<HTMLElement | null>(null);
</script>

{#if activePromotedProducts.length > 0}
	<!-- Ultrathink: Standardized spacing pattern -->
	<section class="py-3 mt-2 sm:mt-3">
		<div class="px-2 sm:px-4 lg:px-6">
			<!-- Section Header aligned with FeaturedSellers, with chevrons in title row -->
			<div class="mb-3">
				<div class="flex items-center justify-between">
					<div class="flex-1">
						<h2 class="text-base font-normal text-gray-900 leading-tight">
							{translations.promoted_listings}
						</h2>
						<p class="text-xs text-gray-500">
							{translations.promoted_description}
						</p>
					</div>
					<!-- Ultrathink: Perfect chevron alignment and sizing -->
					<div class="flex items-center gap-1.5 ml-3">
						<button
							onclick={() => promotedScrollContainer?.scrollBy({ left: -280, behavior: 'smooth' })}
							class="w-7 h-7 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
							aria-label="Scroll left"
						>
							<svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
						</button>
						<button
							onclick={() => promotedScrollContainer?.scrollBy({ left: 280, behavior: 'smooth' })}
							class="w-7 h-7 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
							aria-label="Scroll right"
						>
							<svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
						</button>
					</div>
				</div>
			</div>

			<!-- Horizontal Scrollable Cards, width aligned to seller cards -->
			<div class="relative">
				<div class="flex gap-2 sm:gap-3 px-2 sm:px-4 lg:px-6 overflow-x-auto scrollbar-hide pb-2" style="scroll-snap-type: x mandatory;" data-promoted-scroll bind:this={promotedScrollContainer}>
					{#each activePromotedProducts as product (product.id)}
						<div class="flex-shrink-0 snap-start w-1/2 sm:w-1/3 lg:w-1/4 xl:w-1/5">
							<div class="relative">
								<!-- Clean cards: no badges -->

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
						</div>
					{/each}
				</div>
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
</style>