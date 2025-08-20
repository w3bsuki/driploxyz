<script lang="ts">
	import { SearchBar } from '@repo/ui';
	import * as i18n from '@repo/i18n';
	import Header from '$lib/components/Header.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import QuickViewDialog from '$lib/components/QuickViewDialog.svelte';
	import PromotedHighlights from '$lib/components/PromotedHighlights.svelte';
	import FeaturedProducts from '$lib/components/FeaturedProducts.svelte';
	import { prefetchRoute } from '$lib/utils/performance';
	import { goto } from '$app/navigation';
	import { serviceUtils } from '$lib/services';
	import type { PageData } from './$types';
	import type { ProductWithImages } from '$lib/services';
	import type { Seller, ProductDisplay, PromotedProduct } from '$lib/types';
	import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '$lib/types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedSeller = $state<Seller | null>(null);
	let showCategoryDropdown = $state(false);
	let showCompactSearch = $state(false);
	let heroSearchElement: HTMLElement = $state();
	let loadingCategory = $state<string | null>(null);

	// Language state - already initialized in +layout.svelte
	let currentLang = $state(i18n.languageTag());
	let updateKey = $state(0);

	// Track language changes
	$effect(() => {
		const newLang = i18n.languageTag();
		if (newLang !== currentLang) {
			currentLang = newLang;
			updateKey++;
		}
	});

	// Transform promoted products for highlights
	const promotedProducts = $derived<PromotedProduct[]>(
		(data.promotedProducts?.length ? data.promotedProducts : data.featuredProducts.slice(0, 8))
			.map((product: ProductWithImages) => ({
				id: product.id,
				title: product.title,
				price: product.price,
				images: product.images,
				seller_name: product.seller_name,
				seller_id: product.seller_id
			}))
	);

	// Transform products to match UI component interface
	const products = $derived<ProductDisplay[]>(
		data.featuredProducts.map((product: ProductWithImages) => ({
			id: product.id,
			title: product.title,
			description: product.description,
			price: product.price,
			images: product.images?.map(img => img.image_url) || [],
			brand: product.brand,
			size: product.size,
			condition: product.condition as ProductDisplay['condition'],
			category: product.category_name || 'Uncategorized',
			sellerId: product.seller_id,
			sellerName: product.seller_name || 'Unknown Seller',
			sellerRating: product.seller_rating || 0,
			sellerAvatar: product.seller_avatar,
			createdAt: product.created_at,
			location: product.location
		}))
	);

	// Transform sellers for display
	const sellers = $derived<Seller[]>(
		data.topSellers.map(seller => ({
			id: seller.id,
			name: seller.username || seller.full_name,
			username: seller.username,
			premium: seller.role === 'seller',
			avatar: seller.avatar_url,
			rating: seller.rating,
			itemCount: seller.sales_count,
			followers: 0, // We don't track followers yet
			description: seller.bio
		}))
	);

	function handleSearch(query: string) {
		if (query.trim()) {
			goto(`/search?q=${encodeURIComponent(query)}`);
		}
	}

	function handleProductClick(product: ProductDisplay) {
		goto(`/product/${product.id}`);
	}

	function handleFavorite(product: ProductDisplay) {
		// Favorites functionality will be implemented with Supabase
		// For now, just show a toast or notification
	}

	function handleSellerClick(seller: Seller) {
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

	async function navigateToCategory(categorySlug: string) {
		loadingCategory = categorySlug;
		
		
		try {
			await goto(`/category/${categorySlug}`);
		} finally {
			loadingCategory = null;
		}
	}
	
	async function navigateToAllSearch() {
		loadingCategory = 'all';
		
		
		try {
			await goto('/search');
		} finally {
			loadingCategory = null;
		}
	}

	// Get only top-level categories for navigation pills (excluding Pets)
	const mainCategories = $derived(
		(data.categories || [])
			.filter(cat => !cat.parent_id && cat.slug !== 'pets') // Only top-level categories, exclude pets
			.sort((a, b) => a.sort_order - b.sort_order) // Sort by order
			.slice(0, 3) // Take first 3 (Women, Men, Kids)
	);

	// Get category icon from constants
	function getCategoryIcon(categoryName: string): string {
		return CATEGORY_ICONS[categoryName] || DEFAULT_CATEGORY_ICON;
	}

	// Scroll detection for compact search
	$effect(() => {
		if (!heroSearchElement) return;
		
		// Check if IntersectionObserver is supported
		if (!window.IntersectionObserver) {
			// Fallback: always show compact search on unsupported browsers
			showCompactSearch = true;
			return;
		}

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

{#key currentLang}
<div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
	<Header initialLanguage={data.language} />

	<!-- Compact Sticky Search Bar -->
	{#if showCompactSearch}
		<div class="fixed top-14 sm:top-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
				<SearchBar 
					bind:value={searchQuery}
					onSearch={handleSearch}
					placeholder={i18n.nav_search()}
					categoriesText={i18n.search_categories()}
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
						placeholder={i18n.search_placeholder()}
						categoriesText={i18n.search_categories()}
						suggestions={[i18n.home_searchSuggestions_vintageJackets(), i18n.home_searchSuggestions_designerBags(), i18n.home_searchSuggestions_summerDresses(), i18n.home_searchSuggestions_sneakers()]}
						showCategoryDropdown={false}
					/>
				</div>
				
				<!-- Category Pills (Hidden when dropdown is open) -->
				{#if !showCategoryDropdown}
					<div class="flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-hide sm:gap-3">
					<button 
						onclick={navigateToAllSearch}
						disabled={loadingCategory === 'all'}
						class="category-nav-pill shrink-0 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-900 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
						style="width: 80px; height: 44px;"
					>
						{#if loadingCategory === 'all'}
							<svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						{:else}
							{i18n.search_all()}
						{/if}
					</button>
					{#each mainCategories as category}
						<button 
							onclick={() => navigateToCategory(category.slug)}
							disabled={loadingCategory === category.slug}
							class="category-nav-pill shrink-0 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
							style="min-width: 80px; height: 44px;"
							{...prefetchRoute(`/category/${category.slug}`)}
						>
							{#if loadingCategory === category.slug}
								<svg class="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							{:else}
								{i18n[`category_${category.slug.toLowerCase()}`] ? i18n[`category_${category.slug.toLowerCase()}`]() : category.name}
							{/if}
						</button>
					{/each}
					</div>
				{/if}
				
				<!-- Discovery Dropdown (Trending + Top Sellers) -->
				{#if showCategoryDropdown}
					<div class="bg-white rounded-2xl border border-gray-200 p-1 shadow-xs backdrop-blur-xl">
						<div class="bg-gray-50/80 relative rounded-xl border border-gray-100 overflow-hidden">
							<div 
								aria-hidden="true"
								class="absolute inset-0 rounded-xl pointer-events-none"
								style="background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)"
							></div>
							<div class="relative p-4 space-y-4">
								<!-- Trending Section -->
								<div>
									<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{i18n.trending_title()}</h3>
									<div class="space-y-1">
										{#each [i18n.home_trending_vintageJackets(), i18n.home_trending_y2kJeans(), i18n.home_trending_designerBagsUnder100()] as trend}
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
									<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{i18n.trending_topSellers()}</h3>
									<div class="space-y-1">
										{#each sellers.slice(0, 3) as seller}
											<button
												onclick={() => handleSellerClick(seller)}
												class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white/60 rounded-lg transition-colors flex items-center space-x-3"
											>
												<div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
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
														<span class="text-badge bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
															{i18n.trending_newSeller()}
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
{/key}

