<script lang="ts">
	// Core components loaded immediately
	import { SearchBar, HeroSearchDropdown, SmartStickySearch, CategoryDropdown, BottomNav, AuthPopup, FeaturedProducts, LoadingSpinner } from '@repo/ui';
	import type { Product, User, Profile } from '@repo/ui/types';
	import * as i18n from '@repo/i18n';
	import { unreadMessageCount } from '$lib/stores/messageNotifications';
	import { goto, preloadCode, preloadData } from '$app/navigation';
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
	import { getProductUrl } from '$lib/utils/seo-urls';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedSeller = $state<Seller | null>(null);
	let showCategoryDropdown = $state(false);
	let loadingCategory = $state<string | null>(null);
	let QuickViewDialog = $state<any>(null);
	let selectedPillIndex = $state(-1);
	
	// Lazy loaded components
	let PromotedHighlights = $state<any>(null);
	let highlightsInView = $state(false);

	// Language state - already initialized in +layout.svelte
	let currentLang = $state(i18n.getLocale());
	let updateKey = $state(0);

	// Track language changes and setup route preloading
	$effect(() => {
		const newLang = i18n.getLocale();
		if (newLang !== currentLang) {
			currentLang = newLang;
			updateKey++;
		}
		
	});
	
	// Initialize favorites from server data on mount
	$effect(() => {
		if (browser) {
			// Always initialize favorite counts from products, regardless of login status
			const counts: Record<string, number> = {};
			[...promotedProducts, ...products].forEach(product => {
				if (product.favorite_count !== undefined) {
					counts[product.id] = product.favorite_count;
				}
			});
			
			// Initialize favorites state from server if user is logged in
			const updates: any = {
				favoriteCounts: {
					...counts
				}
			};

			if (data.user && userFavoritesData) {
				updates.favorites = {
					...userFavoritesData
				};
			}

			favoritesStore.update(state => ({
				...state,
				...updates
			}));
		}
	});
	
	// Lazy load heavy components
	$effect(() => {
		if (browser && !PromotedHighlights) {
			// Set up intersection observer for PromotedHighlights
			const observer = new IntersectionObserver(
				async ([entry]) => {
					if (entry.isIntersecting && !PromotedHighlights) {
						highlightsInView = true;
						const module = await import('@repo/ui');
						PromotedHighlights = module.PromotedHighlights;
						observer.disconnect();
					}
				},
				{ rootMargin: '100px' } // Start loading 100px before visible
			);
			
			const trigger = document.querySelector('#highlights-trigger');
			if (trigger) {
				observer.observe(trigger);
			}
			
			return () => observer.disconnect();
		}
	});

	// Helper function to transform product data
	function transformProduct(product: ProductWithImages): Product {
		return {
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
			favorite_count: product.favorite_count || 0,
			views_count: 0,
			// Category fields for proper display
			category_name: product.category_name,
			main_category_name: product.main_category_name,
			subcategory_name: product.subcategory_name,
			product_images: product.product_images,
			// Seller information
			seller_name: product.seller_name,
			seller_avatar: product.seller_avatar,
			seller_rating: product.seller_rating,
			// PROMOTION: Keep the is_promoted field from server
			is_promoted: product.is_promoted || false,
			// SEO: Include slug for URL generation
			slug: product.slug || null
		};
	}

	// Handle streamed data
	let featuredProductsData = $state<any[]>([]);
	let topSellersData = $state<any[]>([]);
	let userFavoritesData = $state<Record<string, boolean>>({});
	
	// Resolve streamed promises
	$effect(() => {
		if (data.featuredProducts instanceof Promise) {
			data.featuredProducts.then(products => featuredProductsData = products || []);
		} else {
			featuredProductsData = data.featuredProducts || [];
		}
		
		if (data.topSellers instanceof Promise) {
			data.topSellers.then(sellers => topSellersData = sellers || []);
		} else {
			topSellersData = data.topSellers || [];
		}
		
		if (data.userFavorites instanceof Promise) {
			data.userFavorites.then(favorites => userFavoritesData = favorites || {});
		} else {
			userFavoritesData = data.userFavorites || {};
		}
	});

	// Transform promoted products for highlights
	const promotedProducts = $derived<Product[]>(
		(data.promotedProducts?.length ? data.promotedProducts : featuredProductsData?.slice(0, 8) || [])
			.map(transformProduct)
	);

	// Transform products to match Product interface
	const products = $derived<Product[]>(
		(featuredProductsData || []).map(transformProduct)
	);

	// Transform sellers for display
	const sellers = $derived<Seller[]>(
		(topSellersData || []).map(seller => ({
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
		goto(getProductUrl(product));
	}

	async function handleFavorite(productId: string) {
		if (!data.user) {
			authPopupActions.showForFavorite();
			return;
		}

		try {
			await favoritesActions.toggleFavorite(productId);
		} catch (error) {
			// Failed to toggle favorite
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
		// Format as integer if whole number, otherwise with decimals
		const formatted = price % 1 === 0 ? price.toString() : price.toFixed(2);
		return `${formatted}${i18n.common_currency()}`;
	}
	
	function translateCategory(categoryName: string): string {
		// Map English category names to translation keys
		const categoryMap: Record<string, string> = {
			// Level 1 - Gender categories
			'Women': i18n.category_women(),
			'Men': i18n.category_men(),
			'Kids': i18n.category_kids(),
			'Unisex': i18n.category_unisex(),
			
			// Level 2 - Main categories
			'Accessories': i18n.category_accessories(),
			'Activewear': i18n.category_activewear(),
			'Bags': i18n.category_bags(),
			'Boots': i18n.category_boots(),
			'Dresses': i18n.category_dresses(),
			'Flats': i18n.category_flats(),
			'Formal Shoes': i18n.category_formalShoes(),
			'Heels': i18n.category_heels(),
			'Hoodies': i18n.category_hoodies(),
			'Jackets': i18n.category_jackets(),
			'Jackets & Coats': i18n.category_jacketsCoats(),
			'Jeans': i18n.category_jeans(),
			'Jewelry': i18n.category_jewelry(),
			'Lingerie & Underwear': i18n.category_lingerie(),
			'Pants & Jeans': i18n.category_pantsJeans(),
			'Pants & Trousers': i18n.category_pantsTrousers(),
			'Sandals': i18n.category_sandals(),
			'Sandals & Slides': i18n.category_sandalsSlides(),
			'Shirts': i18n.category_shirts(),
			'Shirts & Blouses': i18n.category_shirtsBlouses(),
			'Shorts': i18n.category_shorts(),
			'Skirts': i18n.category_skirts(),
			'Sneakers': i18n.category_sneakers(),
			'Suits & Blazers': i18n.category_suitsBlazers(),
			'Sweaters & Hoodies': i18n.category_sweatersHoodies(),
			'Swimwear': i18n.category_swimwear(),
			'T-Shirts': i18n.category_tshirts(),
			'Tops & T-Shirts': i18n.category_topsTshirts(),
			'Underwear': i18n.category_underwear(),
			'Watches': i18n.category_watches(),
			
			// Level 2 - Product Types
			'Clothing': i18n.category_clothing(),
			'Shoes': i18n.category_shoesType(),
			'Accessories': i18n.category_accessoriesType(),
			'Bags': i18n.category_bagsType(),
			
			// Level 3 - Accessory subcategories
			'Hats & Caps': i18n.category_hatsAndCaps(),
			'Belts': i18n.category_belts(),
			'Scarves': i18n.category_scarves(),
			'Sunglasses': i18n.category_sunglasses(),
			'Wallets': i18n.category_wallets(),
			'Hair Accessories': i18n.category_hairAccessories(),
			'Ties': i18n.category_ties(),
			'Cufflinks': i18n.category_cufflinks(),
			'Backpacks': i18n.category_backpacks()
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

	async function prefetchCategoryPath(path: string) {
		try {
			await preloadCode(path);
			preloadData(path).catch(() => {});
		} catch (e) {
			// ignore
		}
	}
	
	function handlePillKeyNav(e: KeyboardEvent, index: number) {
		const pills = document.querySelectorAll('[role="navigation"] button');
		const totalPills = mainCategories.length + 1;
		
		switch(e.key) {
			case 'ArrowRight':
				e.preventDefault();
				selectedPillIndex = Math.min(index + 1, totalPills - 1);
				(pills[selectedPillIndex] as HTMLElement)?.focus();
				break;
			case 'ArrowLeft':
				e.preventDefault();
				selectedPillIndex = Math.max(index - 1, 0);
				(pills[selectedPillIndex] as HTMLElement)?.focus();
				break;
			case 'Home':
				e.preventDefault();
				selectedPillIndex = 0;
				(pills[0] as HTMLElement)?.focus();
				break;
			case 'End':
				e.preventDefault();
				selectedPillIndex = totalPills - 1;
				(pills[totalPills - 1] as HTMLElement)?.focus();
				break;
		}
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

	// Prepare quick filters for hero search
	const heroQuickFilters = [
		{ label: i18n.filter_under20(), value: 'price_under_20', style: 'price' },
		{ label: i18n.filter_newToday(), value: 'new_today', style: 'new' },
		{ label: i18n.condition_newWithTags(), value: 'condition_new', style: 'condition' },
		{ label: 'Nike', value: 'brand_Nike', style: 'brand' },
		{ label: 'Adidas', value: 'brand_Adidas', style: 'brand' },
		{ label: `${i18n.product_size()} M`, value: 'size_M', style: 'size' },
		{ label: `${i18n.product_size()} L`, value: 'size_L', style: 'size' }
	];

	function handleHeroFilterClick(filterValue: string) {
		const url = new URL('/search', window.location.origin);
		
		// Handle new V1 filters
		if (filterValue === 'newest') {
			url.searchParams.set('sort', 'newest');
		} else if (filterValue === 'under25') {
			url.searchParams.set('max_price', '25');
		} else if (filterValue === 'price-low') {
			url.searchParams.set('sort', 'price-low');
		} else if (filterValue === 'price-high') {
			url.searchParams.set('sort', 'price-high');
		} else if (filterValue === 'search') {
			goto('/search');
			return;
		} else if (filterValue.startsWith('condition=')) {
			const condition = filterValue.replace('condition=', '');
			url.searchParams.set('condition', condition);
		} 
		// Legacy filters
		else if (filterValue.startsWith('price_under_')) {
			const price = filterValue.replace('price_under_', '');
			url.searchParams.set('max_price', price);
		} else if (filterValue.startsWith('brand_')) {
			const brand = filterValue.replace('brand_', '');
			url.searchParams.set('brand', brand);
		} else if (filterValue.startsWith('size_')) {
			const size = filterValue.replace('size_', '');
			url.searchParams.set('size', size);
		} else if (filterValue.startsWith('condition_')) {
			const condition = filterValue.replace('condition_', '');
			url.searchParams.set('condition', condition);
		} else if (filterValue === 'new_today') {
			url.searchParams.set('sort', 'newest');
		}
		
		goto(url.pathname + url.search);
	}

	// Removed duplicate favorites initialization - keeping only the first one

	// Scroll detection removed for cleaner UX
</script>


{#key currentLang}
<div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
	<main class="max-w-7xl mx-auto">
		<!-- Hero Search -->
		<div class="bg-gradient-to-b from-white to-gray-50/30 border-b border-gray-100">
			<div class="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
				<!-- Hero Search with Enhanced Styling -->
				<div id="hero-search-container" class="max-w-2xl mx-auto relative mb-4">
					<div class="relative">
						<!-- Enhanced search container with subtle shadow -->
						<div class="bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200">
							<HeroSearchDropdown 
								bind:value={searchQuery}
								onSearch={handleSearch}
								placeholder={i18n.search_placeholder()}
								categoriesText={i18n.search_categories()}
								trendingProducts={products.slice(0, 8)}
								topSellers={sellers}
								quickFilters={heroQuickFilters}
								onProductClick={handleProductClick}
								onSellerClick={handleSellerClick}
								onFilterClick={handleHeroFilterClick}
								{formatPrice}
								class="rounded-2xl"
								translations={{
									quickShop: i18n.search_quickShop(),
									shopByCondition: i18n.search_shopByCondition(),
									shopByPrice: i18n.search_shopByPrice(),
									quickAccess: i18n.search_quickAccess(),
									topSellers: i18n.search_topSellers(),
									newWithTags: i18n.search_newWithTags(),
									likeNew: i18n.search_likeNew(),
									good: i18n.search_good(),
									fair: i18n.search_fair(),
									under25: i18n.search_under25(),
									cheapest: i18n.search_cheapest(),
									newest: i18n.search_newest(),
									premium: i18n.search_premium(),
									myFavorites: i18n.search_myFavorites(),
									browseAll: i18n.search_browseAll(),
									viewAllResults: i18n.search_viewAllResults()
								}}
							/>
						</div>
					</div>
				</div>
				
				<!-- Enhanced Category Pills -->
				<nav 
					role="navigation"
					aria-label="Browse categories"
					class="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
				>
					<button 
						onmouseenter={() => preloadCode('/search')}
						ontouchstart={() => preloadCode('/search')}
						onclick={() => navigateToAllSearch()}
						onkeydown={(e) => handlePillKeyNav(e, 0)}
						disabled={loadingCategory === 'all'}
						aria-label="View all categories"
						aria-busy={loadingCategory === 'all'}
						aria-current={$page.url.pathname === '/search' ? 'page' : undefined}
						class="category-nav-pill shrink-0 px-3 sm:px-5 py-2 bg-black text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-800 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center min-w-[72px] sm:min-w-[96px] h-9 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black relative snap-start transition-colors"
					>
						{#if loadingCategory === 'all'}
							<LoadingSpinner size="sm" color="white" />
						{:else}
							<span>{i18n.search_all()}</span>
						{/if}
					</button>
					
					<!-- Women Category with Pink Accent -->
					{#if mainCategories.find(c => c.slug === 'women')}
						{@const category = mainCategories.find(c => c.slug === 'women')}
						<button 
							onmouseenter={() => prefetchCategoryPath(`/category/${category.slug}`)}
							ontouchstart={() => prefetchCategoryPath(`/category/${category.slug}`)}
							onclick={() => navigateToCategory(category.slug)}
							onkeydown={(e) => handlePillKeyNav(e, 1)}
							disabled={loadingCategory === category.slug}
							aria-label="Browse Women category"
							aria-busy={loadingCategory === category.slug}
							class="category-nav-pill shrink-0 px-3 sm:px-5 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-1.5 min-w-[72px] sm:min-w-[96px] h-9 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 relative snap-start transition-colors"
							data-prefetch="hover"
						>
							{#if loadingCategory === category.slug}
								<LoadingSpinner size="sm" color="gray" />
							{:else}
								<span class="text-sm sm:text-base">👗</span>
								<span>{i18n.category_women()}</span>
							{/if}
						</button>
					{/if}
					
					<!-- Men Category with Blue Accent -->
					{#if mainCategories.find(c => c.slug === 'men')}
						{@const category = mainCategories.find(c => c.slug === 'men')}
						<button 
							onmouseenter={() => prefetchCategoryPath(`/category/${category.slug}`)}
							ontouchstart={() => prefetchCategoryPath(`/category/${category.slug}`)}
							onclick={() => navigateToCategory(category.slug)}
							onkeydown={(e) => handlePillKeyNav(e, 2)}
							disabled={loadingCategory === category.slug}
							aria-label="Browse Men category"
							aria-busy={loadingCategory === category.slug}
							class="category-nav-pill shrink-0 px-3 sm:px-5 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-1.5 min-w-[72px] sm:min-w-[96px] h-9 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 relative snap-start transition-colors"
							data-prefetch="hover"
						>
							{#if loadingCategory === category.slug}
								<LoadingSpinner size="sm" color="gray" />
							{:else}
								<span class="text-sm sm:text-base">👔</span>
								<span>{i18n.category_men()}</span>
							{/if}
						</button>
					{/if}
					
					<!-- Kids Category with Green Accent -->
					{#if mainCategories.find(c => c.slug === 'kids')}
						{@const category = mainCategories.find(c => c.slug === 'kids')}
						<button 
							onmouseenter={() => prefetchCategoryPath(`/category/${category.slug}`)}
							ontouchstart={() => prefetchCategoryPath(`/category/${category.slug}`)}
							onclick={() => navigateToCategory(category.slug)}
							onkeydown={(e) => handlePillKeyNav(e, 3)}
							disabled={loadingCategory === category.slug}
							aria-label="Browse Kids category"
							aria-busy={loadingCategory === category.slug}
							class="category-nav-pill shrink-0 px-3 sm:px-5 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-1.5 min-w-[72px] sm:min-w-[96px] h-9 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 relative snap-start transition-colors"
							data-prefetch="hover"
						>
							{#if loadingCategory === category.slug}
								<LoadingSpinner size="sm" color="gray" />
							{:else}
								<span class="text-sm sm:text-base">👶</span>
								<span>{i18n.category_kids()}</span>
							{/if}
						</button>
					{/if}
				</nav>
			</div>
		</div>

		<!-- Lazy load PromotedHighlights with skeleton -->
		<div id="highlights-trigger">
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
						ui_scroll: i18n.ui_scroll(),
						promoted_hotPicks: i18n.promoted_hotPicks(),
						promoted_premiumSellers: i18n.promoted_premiumSellers()
					}}
				/>
			{:else if highlightsInView}
				<!-- Loading skeleton for promoted highlights when in view -->
				<div class="w-full bg-gradient-to-br from-gray-50/90 to-white/95 border-y border-gray-200/60">
					<div class="px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5">
						<div class="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
							{#each Array(4) as _}
								<div class="flex-shrink-0 w-40 sm:w-44 bg-gray-100 rounded-lg h-48 sm:h-52 animate-pulse"></div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>

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
				favoritesState={$favoritesStore}
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
					condition_brandNewWithTags: i18n.sell_condition_brandNewWithTags(),
					condition_newWithoutTags: i18n.sell_condition_newWithoutTags(),
					condition_new: i18n.condition_new(),
					condition_likeNew: i18n.condition_likeNew(),
					condition_good: i18n.condition_good(),
					condition_worn: i18n.sell_condition_worn(),
					condition_fair: i18n.condition_fair(),
					categoryTranslation: translateCategory
				}}
			/>
		{:else}
			<!-- Loading skeleton for featured products -->
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

<!-- Smart Sticky Search -->
<SmartStickySearch 
	bind:value={searchQuery}
	onSearch={handleSearch}
	placeholder={i18n.search_placeholder()}
	quickFilters={heroQuickFilters.slice(0, 4)}
	onFilterClick={handleHeroFilterClick}
	observeTarget="#hero-search-container"
/>

<BottomNav 
	currentPath={$page.url.pathname}
	isNavigating={!!$navigating}
	navigatingTo={$navigating?.to?.url.pathname}
	unreadMessageCount={$unreadMessageCount}
	labels={{
		home: i18n.nav_home(),
		search: i18n.nav_search(),
		sell: i18n.nav_sell(),
		wishlist: i18n.nav_wishlist(),
		profile: i18n.nav_profile()
	}}
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

