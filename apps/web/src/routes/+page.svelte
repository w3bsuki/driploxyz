<script lang="ts">
	// Core components loaded immediately
	import { SearchBar, CategoryDropdown, BottomNav, AuthPopup, PromotedHighlights, FeaturedProducts } from '@repo/ui';
	import type { Product, User, Profile } from '@repo/ui/types';
	import * as i18n from '@repo/i18n';
	import Header from '$lib/components/Header.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { unreadMessageCount } from '$lib/stores/messageNotifications';
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
		
	});
	
	// Lazy load heavy components
	$effect(() => {
		if (browser) {
			
			// Load heavy homepage components after critical content
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
		<div class="bg-white border-b border-gray-100 shadow-sm">
			<div class="px-3 sm:px-6 lg:px-8 py-4 space-y-3">
				<!-- Search Bar with Dropdown -->
				<div class="max-w-2xl mx-auto relative">
					<SearchBar 
						bind:value={searchQuery}
						onSearch={handleSearch}
						onFilter={handleFilter}
						placeholder={i18n.search_placeholder()}
						categoriesText={i18n.search_categories()}
					/>
					
					<!-- Category Dropdown - positioned right under search bar -->
					{#if showCategoryDropdown}
						<!-- Click outside to close -->
						<button 
							class="fixed inset-0 z-10" 
							onclick={() => (showCategoryDropdown = false)}
							aria-label="Close dropdown"
						/>
						<div class="absolute top-full left-0 right-0 mt-2 z-20">
							<div class="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-h-[400px] overflow-y-auto">
								<CategoryDropdown
									categories={mainCategories.map(cat => ({
										id: cat.id,
										name: cat.name,
										slug: cat.slug,
										icon: getCategoryIcon(cat.name)
									}))}
									products={products.slice(0, 3)}
									sellers={sellers.slice(0, 3)}
									onCategorySelect={(category) => {
										showCategoryDropdown = false;
										navigateToCategory(category.slug);
									}}
									onProductClick={(product) => {
										showCategoryDropdown = false;
										handleProductClick(product);
									}}
									onSellerClick={(seller) => {
										showCategoryDropdown = false;
										handleSellerClick(seller);
									}}
									onClose={() => (showCategoryDropdown = false)}
									{formatPrice}
									translations={{
										newItems: i18n.home_newItems ? i18n.home_newItems() : 'New Items',
										topSellers: i18n.home_topSellers ? i18n.home_topSellers() : 'Top Sellers',
										categories: i18n.search_categories(),
										viewAll: i18n.home_viewAll ? i18n.home_viewAll() : 'View All',
										new: i18n.badge_new ? i18n.badge_new() : 'NEW'
									}}
								/>
							</div>
						</div>
					{/if}
				</div>
				
				<!-- Category Pills -->
				<div class="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide">
					<button 
						onclick={() => navigateToAllSearch()}
						disabled={loadingCategory === 'all'}
						class="category-nav-pill shrink-0 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px] h-10 transition-all"
					>
						{#if loadingCategory === 'all'}
							<LoadingSpinner size="sm" color="white" />
						{:else}
							{i18n.search_all()}
						{/if}
					</button>
					{#each mainCategories as category}
						<button 
							onclick={() => navigateToCategory(category.slug)}
							disabled={loadingCategory === category.slug}
							class="category-nav-pill shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px] h-10 transition-all"
							data-prefetch="hover"
						>
							{#if loadingCategory === category.slug}
								<LoadingSpinner size="sm" color="gray" />
							{:else}
								{@const categoryName = category.slug === 'women' ? i18n.category_women() : 
								                       category.slug === 'men' ? i18n.category_men() : 
								                       category.slug === 'kids' ? i18n.category_kids() : 
								                       category.name}
								{categoryName}
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Lazy load PromotedHighlights with skeleton -->
		{#if PromotedHighlights}
			<svelte:component
				this={PromotedHighlights}
				promotedProducts={promotedProducts.map(product => ({
					...product,
					sizes: product.size ? [product.size] : ['S', 'M', 'L']
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
		{:else}
			<!-- Loading skeleton for promoted highlights -->
			<div class="w-full bg-white border-b border-gray-200">
				<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div class="flex gap-4 overflow-x-auto scrollbar-hide">
						{#each Array(4) as _}
							<div class="flex-shrink-0 w-64 bg-gray-100 rounded-lg h-40 animate-pulse"></div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- FeaturedProducts -->
		{#if products.length > 0}
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
		{:else}
			<!-- Loading skeleton for featured products -->
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div class="mb-6">
					<div class="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
					<div class="w-32 h-4 bg-gray-100 rounded animate-pulse"></div>
				</div>
				<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
					{#each Array(8) as _}
						<div class="bg-white rounded-lg border border-gray-200 p-4">
							<div class="aspect-square bg-gray-100 rounded-lg mb-3 animate-pulse"></div>
							<div class="w-full h-4 bg-gray-100 rounded animate-pulse mb-2"></div>
							<div class="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
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

