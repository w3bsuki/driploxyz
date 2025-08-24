<script lang="ts">
	import { SearchBar, BottomNav, PromotedHighlights, FeaturedProducts, AuthPopup } from '@repo/ui';
	import type { Product, User, Profile } from '@repo/ui/types';
	import * as i18n from '@repo/i18n';
	import Header from '$lib/components/Header.svelte';
	import { unreadMessageCount } from '$lib/stores/messageNotifications';
	import { prefetchRoute } from '$lib/utils/performance';
	import { setupRoutePreloading, lazyComponents } from '$lib/utils/route-splitting';
	import { goto } from '$app/navigation';
	import { page, navigating } from '$app/stores';
	import { browser } from '$app/environment';
	import { serviceUtils } from '$lib/services';
	import { purchaseActions, purchaseStore } from '$lib/stores/purchase-store';
	import { favoritesActions, favoritesStore } from '$lib/stores/favorites-store';
	import { authPopupActions, authPopupStore } from '$lib/stores/auth-popup-store';
	import type { PageData } from './$types';
	import type { ProductWithImages } from '$lib/services';
	import type { Seller, ProductDisplay, PromotedProduct } from '$lib/types';
	import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '$lib/types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedSeller = $state<Seller | null>(null);
	let showCategoryDropdown = $state(false);
	let loadingCategory = $state<string | null>(null);
	let QuickViewDialog = $state<any>(null);

	// Language state - already initialized in +layout.svelte
	let currentLang = $state(i18n.languageTag());
	let updateKey = $state(0);

	// Track language changes and setup route preloading
	$effect(() => {
		const newLang = i18n.languageTag();
		if (newLang !== currentLang) {
			currentLang = newLang;
			updateKey++;
		}
		
		// Setup route preloading on mount
		if (browser) {
			setupRoutePreloading();
		}
	});
	
	// Lazy load QuickViewDialog when needed
	$effect(() => {
		if (selectedSeller && !QuickViewDialog && browser) {
			lazyComponents.QuickViewDialog().then(component => {
				QuickViewDialog = component;
			});
		}
	});

	// Transform promoted products for highlights
	const promotedProducts = $derived<Product[]>(
		(data.promotedProducts?.length ? data.promotedProducts : data.featuredProducts?.slice(0, 8) || [])
			.map((product: ProductWithImages) => ({
				id: product.id,
				title: product.title,
				price: product.price,
				currency: i18n.common_currency(),
				images: (product.product_images || product.images || []).map(img => 
					typeof img === 'string' ? img : img?.image_url || ''
				).filter(Boolean),
				condition: product.condition as Product['condition'] || 'good',
				seller_id: product.seller_id,
				category_id: product.category_id || '',
				size: product.size,
				brand: product.brand,
				description: product.description,
				created_at: product.created_at,
				updated_at: product.updated_at || product.created_at,
				sold: false,
				favorites_count: 0,
				views_count: 0,
				// Category fields for proper display
				category_name: product.category_name,
				main_category_name: product.main_category_name,
				subcategory_name: product.subcategory_name,
				product_images: product.product_images,
				// Seller information
				seller_name: product.seller_name,
				seller_avatar: product.seller_avatar,
				seller_rating: product.seller_rating
			}))
	);

	// Transform products to match Product interface
	const products = $derived<Product[]>(
		(data.featuredProducts || []).map((product: ProductWithImages) => ({
				id: product.id,
				title: product.title,
				price: product.price,
				currency: i18n.common_currency(),
				images: (product.product_images || product.images || []).map(img => 
					typeof img === 'string' ? img : img?.image_url || ''
				).filter(Boolean),
				condition: product.condition as Product['condition'] || 'good',
				seller_id: product.seller_id,
				category_id: product.category_id || '',
				size: product.size,
				brand: product.brand,
				description: product.description,
				created_at: product.created_at,
				updated_at: product.updated_at || product.created_at,
				sold: false,
				favorites_count: 0,
				views_count: 0,
				// Category fields for proper display
				category_name: product.category_name,
				main_category_name: product.main_category_name,
				subcategory_name: product.subcategory_name,
				product_images: product.product_images,
				// Seller information
				seller_name: product.seller_name,
				seller_avatar: product.seller_avatar,
				seller_rating: product.seller_rating
		}))
	);

	// Transform sellers for display
	const sellers = $derived<Seller[]>(
		(data.topSellers || []).map(seller => ({
			id: seller.id,
			name: seller.username || seller.full_name,
			username: seller.username,
			premium: seller.sales_count > 0,
			avatar: seller.avatar_url,
			rating: seller.rating || 0,
			itemCount: seller.product_count || 0, // Use actual active listings count
			followers: seller.followers_count || 0,
			description: seller.bio
		}))
	);

	function handleSearch(query: string) {
		if (query.trim()) {
			goto(`/search?q=${encodeURIComponent(query)}`);
		}
	}

	function handleProductClick(product: Product) {
		goto(`/product/${product.id}`);
	}

	async function handleFavorite(productId: string) {
		if (!data.user) {
			authPopupActions.showForFavorite();
			return;
		}

		try {
			await favoritesActions.toggleFavorite(productId);
		} catch (error) {
			console.error('Failed to toggle favorite:', error);
		}
	}

	async function handlePurchase(productId: string, selectedSize?: string) {
		if (!data.user) {
			authPopupActions.showForPurchase();
			return;
		}

		await purchaseActions.initiatePurchase(productId, selectedSize);
	}

	function handleBrowseAll() {
		goto('/search');
	}

	function handleSellClick() {
		goto('/sell');
	}

	function formatPrice(price: number): string {
		return `${i18n.common_currency()}${price.toFixed(2)}`;
	}
	
	function translateCategory(categoryName: string): string {
		// Map English category names to translation keys
		const categoryMap: Record<string, string> = {
			'Women': i18n.category_women(),
			'Men': i18n.category_men(),
			'Kids': i18n.category_kids(),
			'Pets': i18n.category_pets(),
			'Shoes': i18n.category_shoes(),
			'Bags': i18n.category_bags(),
			'Home': i18n.category_home(),
			'Beauty': i18n.category_beauty(),
			'T-Shirts': i18n.subcategory_tshirts ? i18n.subcategory_tshirts() : 'T-Shirts',
			'Tops & T-Shirts': i18n.subcategory_tops ? i18n.subcategory_tops() : 'Tops & T-Shirts'
		};
		return categoryMap[categoryName] || categoryName;
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

	// Get only top-level categories for navigation pills (first 3 main categories)
	const mainCategories = $derived(
		(data.categories || [])
			.filter(cat => !cat.parent_id) // Only top-level categories
			.sort((a, b) => a.sort_order - b.sort_order) // Sort by order
			.slice(0, 3) // Take first 3 (Men, Women, Kids)
	);

	// Get category icon from constants
	function getCategoryIcon(categoryName: string): string {
		return CATEGORY_ICONS[categoryName] || DEFAULT_CATEGORY_ICON;
	}

	// Load favorites for products when user is authenticated
	$effect(() => {
		if (data.user && browser) {
			const productIds = [
				...(data.promotedProducts || []).map(p => p.id),
				...(data.featuredProducts || []).map(p => p.id)
			];

			if (productIds.length > 0) {
				favoritesActions.loadMultipleFavoriteStatuses(productIds);
			}
		}
	});

	// Scroll detection removed for cleaner UX
</script>

<style>
	/* Smooth transitions for sticky search */
	.sticky-search-container {
		will-change: transform;
	}
	
	/* Optimize category pills scrolling */
	.category-nav-pill {
		transition: all 0.2s ease;
	}
</style>

{#key currentLang}
<div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
	<Header initialLanguage={data.language} user={data.user} profile={data.profile} />

	<!-- Compact Sticky Search Bar removed for cleaner UX -->

	<main class="max-w-7xl mx-auto">
		<!-- Hero Search -->
		<div class="bg-gray-50 border-b border-gray-200">
			<div class="px-4 sm:px-6 lg:px-8 py-3 space-y-2">
				<!-- Search Bar -->
				<div class="relative">
					<SearchBar 
						bind:value={searchQuery}
						onSearch={handleSearch}
						onFilter={handleFilter}
						placeholder={i18n.search_placeholder()}
						categoriesText={i18n.search_categories()}
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
										{#each data.trendingSearches.slice(0, 3) as trend}
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
			promotedProducts={promotedProducts.map(product => ({
				...product,
				sizes: product.size ? [product.size] : ['S', 'M', 'L'] // Convert single size to sizes array or add default sizes
			}))}
			{sellers}
			onSellerSelect={(seller) => selectedSeller = seller}
			onSellerClick={handleSellerClick}
			onProductClick={handleProductClick}
			onProductBuy={handlePurchase}
			onToggleFavorite={handleFavorite}
			favoritesState={$favoritesStore}
			{formatPrice}
			translations={{
				seller_premiumSeller: i18n.seller_premiumSeller(),
				seller_premiumSellerDescription: i18n.seller_premiumSellerDescription(),
				trending_promoted: i18n.trending_promoted(),
				trending_featured: i18n.trending_featured(),
				common_currency: i18n.common_currency(),
				ui_scroll: i18n.ui_scroll()
			}}
		/>

		<FeaturedProducts 
			{products}
			errors={data.errors}
			onProductClick={handleProductClick}
			onFavorite={handleFavorite}
			onBrowseAll={handleBrowseAll}
			onSellClick={handleSellClick}
			{formatPrice}
			translations={{
				empty_noProducts: i18n.empty_noProducts(),
				empty_startBrowsing: i18n.empty_startBrowsing(),
				nav_sell: i18n.nav_sell(),
				home_browseAll: i18n.home_browseAll(),
				product_size: i18n.product_size(),
				trending_newSeller: i18n.trending_newSeller(),
				seller_unknown: i18n.seller_unknown(),
				common_currency: i18n.common_currency(),
				product_addToFavorites: i18n.product_addToFavorites(),
				condition_new: i18n.condition_new(),
				condition_likeNew: i18n.condition_likeNew(),
				condition_good: i18n.condition_good(),
				condition_fair: i18n.condition_fair(),
				categoryTranslation: translateCategory
			}}
		/>
	</main>
</div>

<BottomNav 
	currentPath={$page.url.pathname}
	isNavigating={!!$navigating}
	navigatingTo={$navigating?.to?.url.pathname}
	unreadMessageCount={$unreadMessageCount}
/>

<!-- Quick View Dialog for Premium Sellers (Lazy Loaded) -->
{#if QuickViewDialog && selectedSeller}
	<svelte:component 
		this={QuickViewDialog}
		seller={selectedSeller} 
		onclose={() => selectedSeller = null} 
	/>
{/if}

<!-- Auth Popup -->
<AuthPopup 
	isOpen={$authPopupStore.isOpen}
	action={$authPopupStore.action}
	onClose={authPopupActions.close}
	onSignIn={authPopupActions.signIn}
	onSignUp={authPopupActions.signUp}
/>
{/key}

