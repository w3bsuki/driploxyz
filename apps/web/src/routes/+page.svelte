<script lang="ts">
	// Core components loaded immediately
	import { EnhancedSearchBar, TrendingDropdown, CategoryDropdown, BottomNav, AuthPopup, FeaturedProducts, LoadingSpinner, SellerQuickView, FeaturedSellers, FilterPill, CategoryPill } from '@repo/ui';
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
	import { createLogger } from '$lib/utils/log';

	const log = createLogger('homepage');

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedSeller = $state<Seller | null>(null);
	let selectedPartner = $state<any>(null);
	let showSellerModal = $state(false);
	let showPartnerModal = $state(false);
	let showCategoryDropdown = $state(false);
	let showTrendingDropdown = $state(false);
	let loadingCategory = $state<string | null>(null);
	let selectedPillIndex = $state(-1);
	
	// Component state
	let sellersInView = $state(false);

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

	// Debug data (removed to prevent infinite loops)

	// Handle click outside for trending dropdown
	$effect(() => {
		if (typeof window !== 'undefined') {
			function handleClickOutside(e: MouseEvent) {
				const target = e.target as HTMLElement;
				if (!target.closest('#hero-search-container')) {
					showTrendingDropdown = false;
				}
			}

			if (showTrendingDropdown) {
				document.addEventListener('click', handleClickOutside);
				return () => document.removeEventListener('click', handleClickOutside);
			}
		}
	});

	// Hide trending dropdown when user starts typing in search
	$effect(() => {
		if (searchQuery.trim()) {
			showTrendingDropdown = false;
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
	// FeaturedSellers is now imported directly, no lazy loading needed

	// Helper function to transform product data
	function transformProduct(product: ProductWithImages): Product {
		const images = (product.product_images || product.images || []).map(img => 
			typeof img === 'string' ? img : img?.image_url || ''
		).filter(Boolean);
		
		return {
			id: product.id,
			title: product.title,
			price: product.price,
			currency: i18n.common_currency(),
			images,
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
	let sellersData = $state<any[]>([]);
	let userFavoritesData = $state<Record<string, boolean>>({});
	let dataLoaded = $state(false);
	
	// Resolve streamed promises
	$effect(() => {
		if (data.featuredProducts instanceof Promise) {
			data.featuredProducts.then(products => {
				featuredProductsData = products || [];
			});
		} else {
			featuredProductsData = data.featuredProducts || [];
		}
		
		if (data.topSellers instanceof Promise) {
			data.topSellers.then(sellers => topSellersData = sellers || []);
		} else {
			topSellersData = data.topSellers || [];
		}
		
		if (data.sellers instanceof Promise) {
			data.sellers.then(sellers => sellersData = sellers || []);
		} else {
			sellersData = data.sellers || [];
		}
		
		if (data.userFavorites instanceof Promise) {
			data.userFavorites.then(favorites => userFavoritesData = favorites || {});
		} else {
			userFavoritesData = data.userFavorites || {};
		}
		
		// Mark data as loaded after processing
		dataLoaded = true;
	});

	// Transform promoted products for highlights
	const promotedProducts = $derived<Product[]>(
		(featuredProductsData || []).map(transformProduct).map(p => ({
			...p,
			category_name: p.category_name || p.main_category_name || 'Uncategorized',
			main_category_name: p.main_category_name || p.category_name || 'Uncategorized'
		}))
	);

	// Transform products to match Product interface
	const products = $derived<Product[]>(
		(featuredProductsData || []).map(transformProduct).map(p => ({
			...p,
			category_name: p.category_name || p.main_category_name || 'Uncategorized',
			main_category_name: p.main_category_name || p.category_name || 'Uncategorized'
		}))
	);

	// Transform sellers for display (for FeaturedSellers component)
	// Use topSellersData instead of sellersData because topSellers specifically gets sellers with active products
	const sellers = $derived<Seller[]>(
		(topSellersData || []).map(seller => {
			const productCount = seller.total_products || 0;
			return {
				id: seller.id,
				name: seller.username || seller.full_name,
				username: seller.username,
				full_name: seller.full_name,
				premium: productCount > 0 || seller.verified,
				account_type: seller.username === 'indecisive_wear' ? 'brand' : 
				             seller.account_type || (productCount > 10 ? 'pro' : productCount > 0 ? 'brand' : 'new'),
				avatar: seller.avatar_url,
				avatar_url: seller.avatar_url,
				rating: seller.rating || 0,
				average_rating: seller.rating || 0,
				total_products: productCount,
				itemCount: productCount,
				followers: seller.followers_count || 0,
				description: seller.bio,
				is_verified: seller.verified || false
			};
		})
	);

	// Create seller products mapping from featured products
	const sellerProducts = $derived(() => {
		const productsBySeller: Record<string, Product[]> = {};
		
		// Match products to sellers by seller_id
		sellers.forEach(seller => {
			const matchingProducts = products.filter(p => p.seller_id === seller.id);
			
			if (matchingProducts.length > 0) {
				productsBySeller[seller.id] = matchingProducts.slice(0, 3);
			}
		});
		
		return productsBySeller;
	});

	// Debug data loading
	$effect(() => {
		log.debug('Data loading status', {
			dataLoaded,
			featuredProductsCount: featuredProductsData?.length || 0,
			promotedProductsCount: promotedProducts?.length || 0,
			filteredPromotedProductsCount: filteredPromotedProducts?.length || 0,
			sellersCount: sellersData?.length || 0,
			transformedSellersCount: sellers?.length || 0,
			sellerProductsKeys: Object.keys(sellerProducts),
			sellerProductsDebug: sellerProducts,
			sellersIds: sellers.map(s => s.id),
			productsSellerIds: products.map(p => p.seller_id).filter(Boolean),
			sampleProduct: products[0],
			productsWithImages: products.filter(p => p.images && p.images.length > 0).length
		});
	});

	// Transform top sellers for TrendingDropdown
	const topSellers = $derived<Seller[]>(
		(topSellersData || []).map(seller => ({
			id: seller.id,
			name: seller.username || seller.full_name,
			username: seller.username,
			premium: seller.sales_count > 0,
			account_type: seller.sales_count > 10 ? 'pro' : seller.sales_count > 0 ? 'brand' : 'new',
			avatar: seller.avatar_url,
			avatar_url: seller.avatar_url,
			rating: seller.rating || 0,
			average_rating: seller.rating || 0,
			total_products: seller.product_count || 0,
			itemCount: seller.product_count || 0,
			followers: seller.followers_count || 0,
			description: seller.bio,
			is_verified: seller.is_verified || false
		}))
	);

	// Partners data - production ready, no test data
	const partners = $derived([]);

	function handleSearch(query: string) {
		if (query.trim()) {
			goto(`/search?q=${encodeURIComponent(query)}`);
		}
	}

	// Quick search for dropdown results
	async function handleQuickSearch(query: string) {
		if (!query.trim() || !data.supabase) {
			return { data: [], error: null };
		}
		
		try {
			const { ProductService } = await import('$lib/services/products');
			const productService = new ProductService(data.supabase);
			return await productService.searchProducts(query, { limit: 6 });
		} catch (error) {
			return { data: [], error: 'Search failed' };
		}
	}

	function handleProductClick(product: Product) {
		// Safety check: if product doesn't have required fields, fallback to legacy URL
		if (!product.slug || (!product.seller_username && !product.profiles?.username)) {
			goto(`/product/${product.id}`);
			return;
		}
		goto(getProductUrl(product));
	}
	
	function handleSearchResultClick(result: any) {
		// Safety check: if result doesn't have required fields, fallback to legacy URL
		if (!result.slug || (!result.seller_username && !result.profiles?.username)) {
			goto(`/product/${result.id}`);
			return;
		}
		goto(getProductUrl(result));
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
	
	function handleViewProProducts() {
		goto('/pro');
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
			showSellerModal = true;
		} else {
			// Navigate directly to profile for non-premium
			goto(`/profile/${seller.username || seller.id}`);
		}
	}

	function handlePartnerClick(partner: any) {
		// Transform partner to seller format for the SellerQuickView component
		selectedPartner = {
			id: partner.id,
			username: partner.name,
			avatar_url: partner.logo,
			itemCount: 12, // Mock item count - will be real when they have a profile
			created_at: '2023-01-01', // Mock creation date
			bio: partner.description,
			location: 'Sofia, Bulgaria',
			totalSales: 28,
			rating: 4.8,
			recentProducts: [
				{
					id: 'p1',
					title: 'Minimalist Oversized Hoodie',
					price: 89,
					image: 'https://via.placeholder.com/200x200/2C2C2C/FFFFFF?text=HOODIE'
				},
				{
					id: 'p2',
					title: 'Cropped Wide Leg Jeans',
					price: 67,
					image: 'https://via.placeholder.com/200x200/6B73FF/FFFFFF?text=JEANS'
				},
				{
					id: 'p3',
					title: 'Statement Chain Necklace',
					price: 34,
					image: 'https://via.placeholder.com/200x200/FFD700/000000?text=CHAIN'
				},
				{
					id: 'p4',
					title: 'Vintage Band T-Shirt',
					price: 45,
					image: 'https://via.placeholder.com/200x200/8B4513/FFFFFF?text=VINTAGE'
				}
			],
			// Store partner-specific data for enhanced actions
			_partnerData: partner
		};
		showPartnerModal = true;
	}

	function closePartnerModal() {
		showPartnerModal = false;
		selectedPartner = null;
	}

	function closeSellerModal() {
		showSellerModal = false;
		selectedSeller = null;
	}

	function handleFilter() {
		// Toggle category dropdown instead of navigating
		showCategoryDropdown = !showCategoryDropdown;
	}

	async function prefetchCategoryPage(categorySlug: string) {
		try {
			// Preload the category page
			await preloadCode(`/category/${categorySlug}`);
			// Preload category page data
			await preloadData(`/category/${categorySlug}`);
		} catch (e) {
			// Preload failed, but continue navigation
			// Preload failed - continuing without preload
		}
	}
	
	function handlePillKeyNav(e: KeyboardEvent, index: number) {
		const pills = document.querySelectorAll('#category-pills button');
		const totalPills = mainCategories.length + 1 + virtualCategories.length; // All + mainCategories + virtualCategories
		
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
			// Navigate to dedicated category page
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

	// Get only top-level categories for navigation pills (first 4 main categories including Unisex)
	const mainCategories = $derived(
		(data.categories || [])
			.filter(cat => !cat.parent_id) // Only top-level categories
			.sort((a, b) => a.sort_order - b.sort_order) // Sort by order
			.slice(0, 4) // Take first 4 (Women, Men, Kids, Unisex)
	);

	// Virtual categories for quick access
	const virtualCategories = [
		{ slug: 'clothing', name: i18n.category_clothing ? i18n.category_clothing() : 'Clothing' },
		{ slug: 'shoes', name: i18n.category_shoesType ? i18n.category_shoesType() : 'Shoes' },
		{ slug: 'bags', name: i18n.category_bagsType ? i18n.category_bagsType() : 'Bags' },
		{ slug: 'accessories', name: i18n.category_accessoriesType ? i18n.category_accessoriesType() : 'Accessories' }
	];

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

	// Promoted content filtering
	let promotedFilter = $state<string>('all');

	// Promoted content filter options
	const promotedCategoryFilters = [
		{ key: 'all', label: i18n.search_all(), icon: '🌟' },
		{ key: 'men', label: i18n.category_men(), icon: '👔' },
		{ key: 'women', label: i18n.category_women(), icon: '👗' },
		{ key: 'kids', label: i18n.category_kids(), icon: '👶' }
	];

	const promotedConditionFilters = [
		{ key: 'brand_new_with_tags', label: i18n.sell_condition_brandNewWithTags(), shortLabel: 'нови с етикет' },
		{ key: 'like_new', label: i18n.condition_likeNew(), shortLabel: 'като ново' },
		{ key: 'newest', label: 'най-нови', shortLabel: 'най-нови' }
	];

	function handlePromotedFilterChange(filterKey: string) {
		promotedFilter = promotedFilter === filterKey ? 'all' : filterKey;
	}

	// Filter promoted products based on selected filter
	const filteredPromotedProducts = $derived(() => {
		if (promotedFilter === 'all') {
			return promotedProducts;
		}

		return promotedProducts.filter(product => {
			// Category filters
			if (promotedFilter === 'men' || promotedFilter === 'women' || promotedFilter === 'kids') {
				const productCategory = product.main_category_name?.toLowerCase();
				return productCategory === promotedFilter || productCategory === promotedFilter + 's'; // handle plurals
			}

			// Condition filters
			if (promotedFilter === 'brand_new_with_tags') {
				return product.condition === 'brand_new_with_tags';
			}
			if (promotedFilter === 'like_new') {
				return product.condition === 'like_new';
			}
			if (promotedFilter === 'newest') {
				// Sort by creation date and return newest ones
				return true; // All products, but we'll sort them in the component
			}

			return true;
		});
	});

</script>


{#key currentLang}
<div class="min-h-screen bg-[color:var(--surface-subtle)] pb-20 sm:pb-0">
	<main>
		<!-- Hero Search -->
		<div class="sticky top-12 sm:top-16 bg-white/40 backdrop-blur-sm border-b border-gray-100 z-40">
			<div class="px-2 sm:px-4 lg:px-6 safe-area py-1.5">
				<!-- Hero Search -->
				<div id="hero-search-container" class="max-w-4xl mx-auto relative mb-3 z-50">
					<EnhancedSearchBar
						bind:searchValue={searchQuery}
						onSearch={handleSearch}
						placeholder={i18n.search_placeholder()}
						searchId="hero-search-input"
						searchFunction={handleQuickSearch}
						showDropdown={true}
						maxResults={6}
					>
						{#snippet rightSection()}
							<button
								onclick={() => showTrendingDropdown = !showTrendingDropdown}
								class="h-12 px-3 rounded-r-xl hover:bg-gray-100 transition-colors flex items-center gap-1"
								aria-expanded={showTrendingDropdown}
								aria-haspopup="listbox"
								aria-label={i18n.search_categories()}
							>
								<svg 
									class="w-4 h-4 text-gray-600 transition-transform {showTrendingDropdown ? 'rotate-180' : ''}" 
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
								<span class="text-sm font-medium text-gray-600 hidden sm:inline">{i18n.search_categories()}</span>
							</button>
						{/snippet}
					</EnhancedSearchBar>

					{#if showTrendingDropdown}
						<div class="absolute z-[9999] w-full mt-2">
							<TrendingDropdown
								topSellers={topSellers}
								quickFilters={heroQuickFilters}
								onSellerClick={handleSellerClick}  
								onFilterClick={handleHeroFilterClick}
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
					{/if}
				</div>
				
				<!-- Category Pills -->
				<nav 
					id="category-pills"
					aria-label={i18n.nav_browseCategories()}
					class="flex items-center justify-start gap-2 sm:gap-3 overflow-x-auto no-scrollbar px-2 sm:px-4 lg:px-6 safe-area sm:justify-center"
				>
					<!-- All Categories -->
					<CategoryPill 
						variant="primary"
						label={i18n.search_all()}
						loading={loadingCategory === 'all'}
						disabled={loadingCategory === 'all'}
						ariaLabel={i18n.search_viewAll()}
						ariaCurrent={$page.url.pathname === '/search' ? 'page' : undefined}
						data-prefetch="hover"
						onmouseenter={() => preloadCode('/search')}
						ontouchstart={() => preloadCode('/search')}
						onclick={() => navigateToAllSearch()}
						onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, 0)}
					/>
					
					<!-- Women Category - Standard Action (36px) -->
					{#if mainCategories.find(c => c.slug === 'women')}
						{@const category = mainCategories.find(c => c.slug === 'women')}
						<CategoryPill 
							label={i18n.category_women()}
							emoji="👗"
							loading={loadingCategory === category.slug}
							disabled={loadingCategory === category.slug}
							ariaLabel={`${i18n.menu_browse()} ${i18n.category_women()}`}
							itemCount={category?.product_count || 0}
							showItemCount={!!category?.product_count && category.product_count > 0}
							data-prefetch="hover"
							data-category="women"
							onmouseenter={() => prefetchCategoryPage(category.slug)}
							ontouchstart={() => prefetchCategoryPage(category.slug)}
							onclick={() => navigateToCategory(category.slug)}
							onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, 1)}
						/>
					{/if}
					
					<!-- Men Category - Standard Action (36px) -->
					{#if mainCategories.find(c => c.slug === 'men')}
						{@const category = mainCategories.find(c => c.slug === 'men')}
						<CategoryPill 
							label={i18n.category_men()}
							emoji="👔"
							loading={loadingCategory === category.slug}
							disabled={loadingCategory === category.slug}
							ariaLabel={`${i18n.menu_browse()} ${i18n.category_men()}`}
							itemCount={category?.product_count || 0}
							showItemCount={!!category?.product_count && category.product_count > 0}
							data-prefetch="hover"
							data-category="men"
							onmouseenter={() => prefetchCategoryPage(category.slug)}
							ontouchstart={() => prefetchCategoryPage(category.slug)}
							onclick={() => navigateToCategory(category.slug)}
							onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, 2)}
						/>
					{/if}
					
					<!-- Kids Category - Standard Action (36px) -->
					{#if mainCategories.find(c => c.slug === 'kids')}
						{@const category = mainCategories.find(c => c.slug === 'kids')}
						<CategoryPill 
							label={i18n.category_kids()}
							emoji="👶"
							loading={loadingCategory === category.slug}
							disabled={loadingCategory === category.slug}
							ariaLabel={`${i18n.menu_browse()} ${i18n.category_kids()}`}
							itemCount={category?.product_count || 0}
							showItemCount={!!category?.product_count && category.product_count > 0}
							data-prefetch="hover"
							data-category="kids"
							onmouseenter={() => prefetchCategoryPage(category.slug)}
							ontouchstart={() => prefetchCategoryPage(category.slug)}
							onclick={() => navigateToCategory(category.slug)}
							onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, 3)}
						/>
					{/if}
					
					<!-- Unisex Category - Standard Action (36px) -->
					{#if mainCategories.find(c => c.slug === 'unisex')}
						{@const category = mainCategories.find(c => c.slug === 'unisex')}
						<CategoryPill 
							label={i18n.category_unisex()}
							emoji="🌍"
							loading={loadingCategory === category.slug}
							disabled={loadingCategory === category.slug}
							ariaLabel={`${i18n.menu_browse()} ${i18n.category_unisex()}`}
							itemCount={category?.product_count || 0}
							showItemCount={!!category?.product_count && category.product_count > 0}
							data-prefetch="hover"
							data-category="unisex"
							onmouseenter={() => prefetchCategoryPage(category.slug)}
							ontouchstart={() => prefetchCategoryPage(category.slug)}
							onclick={() => navigateToCategory(category.slug)}
							onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, 4)}
						/>
					{/if}
					
					<!-- Virtual Categories - Unisex Product Types -->
					{#each virtualCategories as virtualCategory, index}
						<CategoryPill 
							variant="outline"
							label={virtualCategory.name}
							loading={loadingCategory === virtualCategory.slug}
							disabled={loadingCategory === virtualCategory.slug}
							ariaLabel={`${i18n.menu_browse()} ${virtualCategory.name}`}
							data-prefetch="hover"
							data-category={virtualCategory.slug}
							onmouseenter={() => prefetchCategoryPage(virtualCategory.slug)}
							ontouchstart={() => prefetchCategoryPage(virtualCategory.slug)}
							onclick={() => navigateToCategory(virtualCategory.slug)}
							onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, 5 + index)}
						/>
					{/each}
				</nav>
			</div>
		</div>

		<!-- Featured Sellers Section -->
		<div id="sellers-trigger" class="relative z-0 pt-3">
			<FeaturedSellers
				sellers={sellers}
				sellerProducts={sellerProducts}
				onSellerClick={handleSellerClick}
				title={i18n.promoted_premiumSellers ? i18n.promoted_premiumSellers() : 'Featured Sellers'}
			/>
		</div>


		<!-- FeaturedProducts -->
		{#if dataLoaded && (products.length > 0)}
			<FeaturedProducts
				{products}
				errors={data.errors}
				sectionTitle={i18n.home_newestListings()}
				onProductClick={handleProductClick}
				onFavorite={handleFavorite}
				onBrowseAll={handleBrowseAll}
				onSellClick={handleSellClick}
				{formatPrice}
				favoritesState={$favoritesStore}
				showViewAllButton={true}
				onViewAll={handleViewProProducts}
				translations={{
					empty_noProducts: i18n.empty_noProducts(),
					empty_startBrowsing: i18n.empty_startBrowsing(),
					nav_sell: i18n.nav_sell(),
					home_browseAll: i18n.home_browseAll(),
					home_itemCount: i18n.home_itemCount(),
					home_updatedMomentsAgo: i18n.home_updatedMomentsAgo(),
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
		{:else if !dataLoaded}
			<!-- Loading skeleton for featured products -->
			<div class="px-2 sm:px-4 lg:px-6 py-4">
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
		{:else}
			<!-- No products found - show call to action for new users -->
			<div class="px-2 sm:px-4 lg:px-6 py-8 text-center">
				<div class="max-w-md mx-auto">
					<div class="w-16 h-16 bg-[color:var(--surface-brand-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-[color:var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-[color:var(--text-primary)] mb-2">{i18n.welcome()}</h3>
					<p class="text-[color:var(--text-secondary)] mb-6">
						{data.user ? 
							'No products available yet. Check back soon for new listings!' : 
							'Discover amazing second-hand fashion and unique finds from sellers across Bulgaria and the UK.'
						}
					</p>
					<div class="space-y-3">
						<button 
							onclick={() => goto('/search')}
							class="w-full bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)] px-6 py-3 rounded-lg font-medium hover:bg-[color:var(--brand-primary)]/90 transition-colors"
						>
							{i18n.home_browseAll()}
						</button>
						{#if data.user}
							<button 
								onclick={() => goto('/sell')}
								class="w-full border border-[color:var(--border-primary)] text-[color:var(--brand-primary)] px-6 py-3 rounded-lg font-medium hover:bg-[color:var(--surface-secondary)] transition-colors"
							>
								{i18n.nav_sell()}
							</button>
						{:else}
							<button 
								onclick={() => authPopupActions.showForSignUp()}
								class="w-full border border-[color:var(--border-primary)] text-[color:var(--brand-primary)] px-6 py-3 rounded-lg font-medium hover:bg-[color:var(--surface-secondary)] transition-colors"
							>
								{i18n.auth_signUp()}
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>


<BottomNav 
	currentPath={$page.url.pathname}
	isNavigating={!!$navigating}
	navigatingTo={$navigating?.to?.url.pathname}
	unreadMessageCount={$unreadMessageCount}
	profileHref={data.profile?.username ? `/profile/${data.profile.username}` : '/account'}
	isAuthenticated={!!data.user}
	labels={{
		home: i18n.nav_home(),
		search: i18n.nav_search(),
		sell: i18n.nav_sell(),
		messages: i18n.nav_messages(),
		profile: i18n.nav_profile()
	}}
/>

<!-- Quick View Dialog for Premium Sellers -->
{#if selectedSeller}
	<SellerQuickView
		seller={selectedSeller} 
		bind:isOpen={showSellerModal}
		onClose={closeSellerModal}
		onViewProfile={(sellerId) => goto(`/profile/${sellerId}`)}
	/>
{/if}

<!-- Partner Quick View Dialog -->
{#if selectedPartner}
	<SellerQuickView
		seller={selectedPartner}
		bind:isOpen={showPartnerModal}
		onClose={closePartnerModal}
		onViewProfile={(partnerId) => {
			// When they get a real profile, this will navigate to their profile
			// For now, show a notice and optionally link to their Instagram
			const partner = partners.find(p => p.id === partnerId);
			if (partner?.instagram) {
				if (confirm(`${partner.name} will have a full profile soon! Would you like to visit their Instagram in the meantime?`)) {
					window.open(partner.instagram, '_blank');
				}
			} else {
				alert(`${partner?.name || 'This partner'} will have a full profile available very soon!`);
			}
		}}
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

<!-- Subtle browsing hint for unauthenticated users -->
{#if !data.user}
	<div class="fixed bottom-20 sm:bottom-4 left-4 right-4 z-30 mx-auto max-w-xs sm:max-w-sm">
		<div class="bg-[color:var(--surface-base)] border border-[color:var(--border-primary)] rounded-lg shadow-sm px-4 py-3 text-center">
			<p class="text-xs text-[color:var(--text-secondary)] mb-2">
				{i18n.engagement_banner_description ? i18n.engagement_banner_description() : 'Join thousands of fashion lovers'}
			</p>
			<button 
				onclick={() => authPopupActions.showForSignUp()}
				class="text-xs font-medium text-[color:var(--brand-primary)] hover:underline"
			>
				{i18n.auth_signUp()}
			</button>
		</div>
	</div>
{/if}
{/key}

