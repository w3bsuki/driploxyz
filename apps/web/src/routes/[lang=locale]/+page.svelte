<script lang="ts">
	import { SearchBar, LanguageSwitcher } from '@repo/ui';
	import Header from '$lib/components/Header.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import QuickViewDialog from '$lib/components/QuickViewDialog.svelte';
	import PromotedHighlights from '$lib/components/PromotedHighlights.svelte';
	import FeaturedProducts from '$lib/components/FeaturedProducts.svelte';
	import { goto } from '$app/navigation';
	import { serviceUtils } from '$lib/services';
	import type { PageData } from './$types';
	import type { ProductWithImages } from '$lib/services';
	import { m, languageTag } from '@repo/i18n';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedSeller = $state<any>(null);
	let showCategoryDropdown = $state(false);
	let showCompactSearch = $state(false);
	let heroSearchElement: HTMLElement;

	// Transform promoted products for highlights
	const promotedProducts = $derived(data.promotedProducts?.map((product: ProductWithImages) => ({
		id: product.id,
		title: product.title,
		price: product.price,
		images: product.images,
		seller_name: product.seller_name
	})) || []);

	// Transform products to match UI component interface
	const products = $derived(data.featuredProducts.map((product: ProductWithImages) => ({
		id: product.id,
		title: product.title,
		description: product.description,
		price: product.price,
		images: product.images.map(img => img.image_url),
		brand: product.brand,
		size: product.size,
		condition: product.condition,
		category: product.category_name || 'Uncategorized',
		sellerId: product.seller_id,
		sellerName: product.seller_name || 'Unknown Seller',
		sellerRating: product.seller_rating || 0,
		sellerAvatar: product.seller_avatar,
		createdAt: product.created_at,
		location: product.location
	})));

	// Transform sellers for display
	const sellers = $derived(data.topSellers.map(seller => ({
		id: seller.id,
		name: seller.username || seller.full_name,
		username: seller.username,
		premium: seller.role === 'seller',
		avatar: seller.avatar_url,
		rating: seller.rating,
		itemCount: seller.sales_count,
		followers: 0, // We don't track followers yet
		description: seller.bio
	})));

	function handleSearch(query: string) {
		if (query.trim()) {
			goto(`/search?q=${encodeURIComponent(query)}`);
		}
	}

	function handleProductClick(product: any) {
		goto(`/product/${product.id}`);
	}

	function handleFavorite(product: any) {
		// TODO: Implement favorites functionality
		console.log('Favorited:', product.title);
	}

	function handleSellerClick(seller: any) {
		if (seller.premium) {
			// Open quick view for premium sellers
			selectedSeller = seller;
		} else {
			// Navigate directly to profile for non-premium
			goto(`/profile/${seller.username || seller.id}`);
		}
	}

	function handleFilter() {
		// Toggle category dropdown instead of navigating
		showCategoryDropdown = !showCategoryDropdown;
	}

	function navigateToCategory(categorySlug: string) {
		goto(`/category/${categorySlug}`);
	}

	// Get only top-level categories for navigation pills
	const mainCategories = $derived(
		data.categories
			.filter(cat => !cat.parent_id) // Only top-level categories
			.sort((a, b) => a.sort_order - b.sort_order) // Sort by order
			.slice(0, 4) // Take first 4
	);

	// Category icon mapping (same as search page)
	function getCategoryIcon(categoryName: string): string {
		const iconMap: Record<string, string> = {
			'Women': '👗',
			'Men': '👔', 
			'Kids': '👶',
			'Pets': '🐕',
			'Shoes': '👟',
			'Bags': '👜',
			'Home': '🏠',
			'Beauty': '💄'
		};
		return iconMap[categoryName] || '📦';
	}

	// Scroll detection for compact search
	$effect(() => {
		if (!heroSearchElement) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				showCompactSearch = !entry.isIntersecting;
			},
			{ 
				rootMargin: '-50px 0px 0px 0px' // Trigger when hero is 50px out of view
			}
		);

		observer.observe(heroSearchElement);

		return () => observer.disconnect();
	});
</script>

<div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
	<Header />

	<!-- i18n Test Section -->
	<div class="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
		<div class="max-w-7xl mx-auto flex items-center justify-between">
			<div class="text-sm font-medium text-yellow-800">
				🌐 {m.test_works()} (Current: {languageTag()})
			</div>
			<LanguageSwitcher />
		</div>
	</div>

	<!-- Compact Sticky Search Bar -->
	{#if showCompactSearch}
		<div class="fixed top-14 sm:top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
				<SearchBar 
					bind:value={searchQuery}
					onSearch={handleSearch}
					placeholder="Search..."
					variant="compact"
					class="max-w-sm mx-auto"
				/>
			</div>
		</div>
	{/if}

	<main class="max-w-7xl mx-auto">
		<!-- Hero Search -->
		<div bind:this={heroSearchElement} class="bg-gray-50 border-b border-gray-200">
			<div class="px-4 sm:px-6 lg:px-8 py-4 space-y-3">
				<!-- Search Bar -->
				<div class="relative">
					<SearchBar 
						bind:value={searchQuery}
						onSearch={handleSearch}
						onFilter={handleFilter}
						placeholder="Search for anything..."
						suggestions={['Vintage jackets', 'Designer bags', 'Summer dresses', 'Sneakers']}
						showCategoryDropdown={false}
					/>
				</div>
				
				<!-- Category Pills (Hidden when dropdown is open) -->
				{#if !showCategoryDropdown}
					<div class="flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-hide sm:gap-3">
					<button 
						onclick={() => goto('/search')}
						class="flex-shrink-0 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-900 transition-colors"
					>
						All
					</button>
					{#each mainCategories as category}
						<button 
							onclick={() => navigateToCategory(category.slug)}
							class="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
						>
							{category.name}
						</button>
					{/each}
					</div>
				{/if}
				
				<!-- Discovery Dropdown (Trending + Top Sellers) -->
				{#if showCategoryDropdown}
					<div class="bg-white rounded-2xl border border-gray-200 p-1 shadow-sm backdrop-blur-xl transition-all duration-300 ease-out">
						<div class="bg-gray-50/80 relative rounded-xl border overflow-hidden">
							<div 
								aria-hidden="true"
								class="absolute inset-x-0 top-0 h-full rounded-[inherit] pointer-events-none"
								style="background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)"
							/>
							<div class="relative p-4 space-y-4">
								<!-- Trending Section -->
								<div>
									<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trending Now</h3>
									<div class="space-y-1">
										{#each ['Vintage jackets', 'Y2K jeans', 'Designer bags under $100'] as trend}
											<button
												onclick={() => handleSearch(trend)}
												class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white/60 rounded-lg transition-colors flex items-center space-x-2"
											>
												<svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
												</svg>
												<span>{trend}</span>
											</button>
										{/each}
									</div>
								</div>

								<!-- Top Sellers Section -->
								<div>
									<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Top Sellers</h3>
									<div class="space-y-1">
										{#each sellers.slice(0, 3) as seller}
											<button
												onclick={() => handleSellerClick(seller)}
												class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white/60 rounded-lg transition-colors flex items-center space-x-3"
											>
												<div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
													{#if seller.avatar}
														<img src={seller.avatar} alt={seller.name} class="w-full h-full rounded-full object-cover" />
													{:else}
														<span class="text-xs font-medium text-gray-600">{seller.name.charAt(0).toUpperCase()}</span>
													{/if}
												</div>
												<div class="flex items-center space-x-2 min-w-0 flex-1">
													<span class="truncate">{seller.name}</span>
													{#if seller.rating !== null}
														<div class="flex items-center space-x-1 text-xs text-gray-500">
															<svg class="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
																<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
															</svg>
															<span>{seller.rating.toFixed(1)}</span>
														</div>
													{:else}
														<span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
															New Seller
														</span>
													{/if}
												</div>
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<PromotedHighlights 
			{promotedProducts}
			{sellers}
			onSellerSelect={(seller) => selectedSeller = seller}
			onSellerClick={handleSellerClick}
		/>

		<FeaturedProducts 
			{products}
			errors={data.errors}
			onProductClick={handleProductClick}
			onFavorite={handleFavorite}
		/>
	</main>
</div>

<BottomNav />

<!-- Quick View Dialog for Premium Sellers -->
<QuickViewDialog 
	seller={selectedSeller} 
	onclose={() => selectedSeller = null} 
/>

