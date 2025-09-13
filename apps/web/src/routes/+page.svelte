<script lang="ts">
	// Core components loaded immediately
	import { EnhancedSearchBar, SearchDropdown, CategoryDropdown, BottomNav, AuthPopup, FeaturedProducts, LoadingSpinner, SellerQuickView, FeaturedSellers, FilterPill, CategoryPill, PromotedHighlights } from '@repo/ui';
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
	import { CategoryService } from '$lib/services/categories';
	import { ProfileService } from '$lib/services/profiles';
	import { getCollectionsForContext } from '$lib/data/collections';

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
	let activeDropdownTab = $state('trending');
	let dropdownSearchQuery = $state('');

	// Handle streamed data
	let featuredProductsData = $state<any[]>([]);
	let topBrandsData = $state<any[]>([]);
	let topSellersData = $state<any[]>([]);
	let sellersData = $state<any[]>([]);
	let userFavoritesData = $state<Record<string, boolean>>({});
	let dataLoaded = $state(false);

	// Top brands data - clean data from dedicated server query
	const topBrands = $derived(
		(topBrandsData || []).map(brand => {
			// Calculate trending percentage based on recent activity
			const weeklySales = brand.weekly_sales_count || 0;
			const totalSales = brand.sales_count || 0;
			const monthlyViews = brand.monthly_views || 0;

			// Calculate trending based on recent vs historical activity
			let trending = '—';
			if (totalSales > 0 && weeklySales > 0) {
				const weeklyRate = (weeklySales / Math.max(totalSales, 1)) * 100;
				if (weeklyRate >= 20) trending = '+' + Math.min(Math.round(weeklyRate), 99) + '%';
				else if (weeklyRate >= 10) trending = '+' + Math.round(weeklyRate) + '%';
				else if (weeklyRate >= 5) trending = '+' + Math.round(weeklyRate) + '%';
			} else if (monthlyViews > 100) {
				const viewTrend = Math.min(Math.round(monthlyViews / 50), 50);
				trending = '+' + viewTrend + '%';
			} else if (totalSales > 0) {
				trending = '+12%';
			}

			return {
				id: brand.id,
				name: brand.full_name || brand.username,
				items: brand.products?.length || 0,
				avatar: brand.avatar_url,
				verified: brand.verified || false,
				trending
			};
		})
	);

	// Filtered brands based on search query
	const filteredTopBrands = $derived(
		dropdownSearchQuery.trim()
			? topBrands.filter(brand =>
				brand.name.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
			)
			: topBrands
	);

	// Top sellers data - clean data from dedicated server query
	const displayTopSellers = $derived(
		(topSellersData || []).map(seller => ({
			id: seller.id,
			name: seller.username || seller.full_name,
			items: seller.products?.length || 0,
			rating: seller.rating || 0,
			avatar: seller.avatar_url,
			verified: seller.verified || false,
			sales: seller.sales_count || 0,
			account_type: seller.account_type
		}))
	);

	// Filtered sellers based on search query
	const filteredDisplayTopSellers = $derived(
		dropdownSearchQuery.trim()
			? displayTopSellers.filter(seller =>
				seller.name.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
			)
			: displayTopSellers
	);

	// Quick shop items - keeping these as shortcuts
	const quickShopItems = [
		{ label: 'Under $25', description: 'Budget finds', filter: 'max_price=25', icon: '💰' },
		{ label: 'Drip Collection', description: 'Staff picks', filter: 'collection=drip', icon: '💧' },
		{ label: 'Designer $100+', description: 'Premium pieces', filter: 'min_price=100', icon: '💎' },
		{ label: 'New with Tags', description: 'Brand new condition', filter: 'condition=brand_new_with_tags', icon: '🏷️' },
		{ label: 'Like New', description: 'Excellent condition', filter: 'condition=like_new', icon: '✨' }
	];

	// Filtered Quick Shop items based on search query
	const filteredQuickShopItems = $derived(
		dropdownSearchQuery.trim()
			? quickShopItems.filter(item =>
				item.label.toLowerCase().includes(dropdownSearchQuery.toLowerCase()) ||
				item.description.toLowerCase().includes(dropdownSearchQuery.toLowerCase())
			)
			: quickShopItems
	);

	// Search dropdown data
	let dropdownCategories = $state<any[]>([]);
	let dropdownSellers = $state<any[]>([]);
	let dropdownCollections = $state<any[]>([]);
	
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

	// Load search dropdown data
	$effect(() => {
		if (browser && data.supabase) {
			loadSearchDropdownData();
		}
	});

	async function loadSearchDropdownData() {
		try {
			// Load categories for main page context
			const categoryService = new CategoryService(data.supabase);
			const { data: categories, error: categoryError } = await categoryService.getSearchDropdownCategories('main');

			if (!categoryError && categories) {
				dropdownCategories = categoryService.transformForSearchDropdown(categories);
			}

			// Load top sellers
			const profileService = new ProfileService(data.supabase);
			const { data: sellers, error: sellerError } = await profileService.getTopSellersForDropdown(5);

			if (!sellerError && sellers) {
				dropdownSellers = profileService.transformSellersForDropdown(sellers);
			}

			// TODO: Load brand accounts from Supabase - for now using hardcoded data

			// Load collections
			dropdownCollections = getCollectionsForContext('main');
		} catch (error) {
			log.error('Failed to load search dropdown data:', error);
		}
	}

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

	// Resolve streamed promises
	$effect(() => {
		if (data.featuredProducts instanceof Promise) {
			data.featuredProducts.then(products => {
				featuredProductsData = products || [];
			});
		} else {
			featuredProductsData = data.featuredProducts || [];
		}

		if (data.topBrands instanceof Promise) {
			data.topBrands.then(brands => topBrandsData = brands || []);
		} else {
			topBrandsData = data.topBrands || [];
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

	// Filter boosted products for the highlight section
	const boostedProducts = $derived<Product[]>(
		products.filter(product => product.is_promoted).slice(0, 8) // Limit to 8 boosted products
	);

	// Filter non-boosted products for the main listings
	const regularProducts = $derived<Product[]>(
		products.filter(product => !product.is_promoted)
	);

	// Transform sellers for display (for FeaturedSellers component)
	// Include approved sellers: kush3, indecisive_wear, tintin (admin)
	const sellers = $derived<Seller[]>(
		(topSellersData || [])
			.filter(seller => {
				const username = seller.username;
				// Include approved real users
				return username === 'kush3' || username === 'indecisive_wear' || username === 'tintin';
			})
			.map(seller => {
				const productCount = seller.total_products || 0;
				return {
					id: seller.id,
					name: seller.username || seller.full_name,
					username: seller.username,
					full_name: seller.full_name,
					premium: productCount > 0 || seller.verified,
					// Use ACTUAL account_type from backend, don't hardcode
					account_type: seller.account_type,
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

	// Transform brands for display (for PromotedHighlights component)
	// Use real data from topBrands query - only verified brand accounts
	const brands = $derived<Seller[]>(
		(topBrandsData || [])
			.map(brand => {
				const productCount = brand.products?.length || 0;
				return {
					id: brand.id,
					name: brand.username || brand.full_name,
					username: brand.username,
					full_name: brand.full_name,
					premium: true, // All brands are premium
					account_type: brand.account_type || 'brand',
					avatar: brand.avatar_url,
					avatar_url: brand.avatar_url,
					rating: brand.rating || 0,
					average_rating: brand.rating || 0,
					total_products: productCount,
					itemCount: productCount,
					followers: brand.followers_count || 0,
					description: brand.bio,
					is_verified: brand.verified || false
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

	// Initialize favorites from server data on mount (after derived values are available)
	$effect(() => {
		if (browser && boostedProducts && regularProducts) {
			// Always initialize favorite counts from products, regardless of login status
			const counts: Record<string, number> = {};
			[...boostedProducts, ...regularProducts].forEach(product => {
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

	// Debug data loading - commented out to avoid potential infinite loops
	/*$effect(() => {
		log.debug('Data loading status', {
			dataLoaded,
			featuredProductsCount: featuredProductsData?.length || 0,
			boostedProductsCount: boostedProducts?.length || 0,
			regularProductsCount: regularProducts?.length || 0,
			totalProductsCount: products?.length || 0,
			sellersCount: sellersData?.length || 0,
			transformedSellersCount: sellers?.length || 0,
			sellerProductsKeys: Object.keys(sellerProducts),
			productsWithImages: products.filter(p => p.images && p.images.length > 0).length,
			sampleBoostedProduct: boostedProducts[0],
			sampleRegularProduct: regularProducts[0]
		});
	});*/

	// Transform top sellers for TrendingDropdown (filtered to approved users only)
	const topSellers = $derived<Seller[]>(
		(topSellersData || [])
			.filter(seller => {
				const username = seller.username;
				// Include approved real users
				return username === 'kush3' || username === 'indecisive_wear' || username === 'tintin';
			})
			.map(seller => ({
				id: seller.id,
				name: seller.username || seller.full_name,
				username: seller.username,
				premium: seller.sales_count > 0,
				account_type: seller.account_type, // Use backend account type
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

	// SearchDropdown event handlers
	function handleDropdownCategorySelect(category: any) {
		goto(`/category/${category.slug}`);
		showTrendingDropdown = false;
	}

	function handleDropdownSellerSelect(seller: any) {
		goto(`/profile/${seller.username}`);
		showTrendingDropdown = false;
	}

	function handleDropdownCollectionSelect(collection: any) {
		if (collection.key.startsWith('category=')) {
			const categorySlug = collection.key.replace('category=', '');
			goto(`/category/${categorySlug}`);
		} else if (collection.key.startsWith('condition=')) {
			const condition = collection.key.replace('condition=', '');
			goto(`/search?condition=${condition}`);
		} else {
			// Handle other collection types (newest, under25, etc.)
			switch (collection.key) {
				case 'newest':
					goto('/search?sort=newest');
					break;
				case 'under25':
					goto('/search?max_price=25');
					break;
				case 'trending':
					goto('/search?sort=trending');
					break;
				case 'popular':
					goto('/search?sort=popular');
					break;
				case 'premium':
					goto('/search?sort=premium');
					break;
				case 'favorites':
					goto('/search?favorites=true');
					break;
				default:
					goto(`/collection/${collection.key}`);
			}
		}
		showTrendingDropdown = false;
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
			// Get seller's products with proper image data
			const sellerProductsList = sellerProducts[seller.id] || [];
			const recentProducts = sellerProductsList.slice(0, 9).map(product => ({
				id: product.id,
				title: product.title,
				price: product.price,
				image: (product.product_images && product.product_images[0]?.image_url) || product.images?.[0] || '/placeholder-product.svg'
			}));
			
			// Open quick view for premium sellers with product data
			selectedSeller = {
				...seller,
				recentProducts
			};
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

	// Categories loaded with product counts

	// Virtual categories for quick access with real product counts
	const virtualCategories = $derived([
		{
			slug: 'clothing',
			name: i18n.category_clothing ? i18n.category_clothing() : 'Clothing',
			product_count: data.virtualCounts?.clothing || 0
		},
		{
			slug: 'shoes',
			name: i18n.category_shoesType ? i18n.category_shoesType() : 'Shoes',
			product_count: data.virtualCounts?.shoes || 0
		},
		{
			slug: 'bags',
			name: i18n.category_bagsType ? i18n.category_bagsType() : 'Bags',
			product_count: data.virtualCounts?.bags || 0
		},
		{
			slug: 'accessories',
			name: i18n.category_accessoriesType ? i18n.category_accessoriesType() : 'Accessories',
			product_count: data.virtualCounts?.accessories || 0
		}
	]);

	// Get category icon from constants
	function getCategoryIcon(categoryName: string): string {
		return CATEGORY_ICONS[categoryName] || DEFAULT_CATEGORY_ICON;
	}

	// Quick condition filters (most used) - matching search page
	const quickConditionFilters = [
		{ key: 'brand_new_with_tags', label: i18n.sell_condition_brandNewWithTags(), shortLabel: i18n.sell_condition_brandNewWithTags() },
		{ key: 'new_without_tags', label: i18n.sell_condition_newWithoutTags(), shortLabel: i18n.condition_new() },
		{ key: 'like_new', label: i18n.condition_likeNew(), shortLabel: i18n.condition_likeNew() },
		{ key: 'good', label: i18n.condition_good(), shortLabel: i18n.condition_good() }
	];

	// Selected condition state for main page
	let selectedCondition = $state<string | null>(null);

	function handleQuickCondition(conditionKey: string) {
		// Toggle off if already selected, otherwise set new condition
		if (selectedCondition === conditionKey) {
			selectedCondition = null;
			// Navigate to search without condition
			goto('/search');
		} else {
			selectedCondition = conditionKey;
			// Navigate to search with selected condition
			goto(`/search?condition=${conditionKey}`);
		}
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

		// Handle new category navigation
		if (filterValue.startsWith('category=')) {
			const category = filterValue.replace('category=', '');
			goto(`/category/${category}`);
			return;
		} else if (filterValue.startsWith('collection=')) {
			const collection = filterValue.replace('collection=', '');
			goto(`/collection/${collection}`);
			return;
		}
		// Handle new V1 filters
		else if (filterValue === 'newest') {
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
		<!-- Unified Search + Category Navigation Container -->
		<div class="bg-white/90 backdrop-blur-sm sticky z-30 border-b border-gray-100 shadow-sm" style="top: var(--app-header-offset, 56px);">
			<div class="px-2 sm:px-4 lg:px-6">
				<!-- Unified Content Container -->
				<div class="mx-auto relative">
					<!-- Hero Search -->
					<div id="hero-search-container" class="relative py-3">
						<EnhancedSearchBar
							bind:searchValue={searchQuery}
							onSearch={handleSearch}
							placeholder={i18n.search_placeholder()}
							searchId="hero-search-input"
							searchFunction={handleQuickSearch}
							showDropdown={true}
							maxResults={6}
						>
							{#snippet leftSection()}
								<button
									onclick={() => showTrendingDropdown = !showTrendingDropdown}
									class="h-12 px-4 rounded-l-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
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
							<div class="absolute top-full left-0 right-0 mt-1 z-50">
								<div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
									<div class="flex items-center gap-1 mb-3 bg-gray-100 p-1 rounded-lg">
										<button
											onclick={() => activeDropdownTab = 'trending'}
											class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'trending' ? 'bg-white text-[color:var(--text-primary)] shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
										>
											Top Brands
										</button>
										<button
											onclick={() => activeDropdownTab = 'sellers'}
											class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'sellers' ? 'bg-white text-[color:var(--text-primary)] shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
										>
											Top Sellers
										</button>
										<button
											onclick={() => activeDropdownTab = 'quickshop'}
											class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 {activeDropdownTab === 'quickshop' ? 'bg-white text-[color:var(--text-primary)] shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
										>
											Quick Shop
										</button>
									</div>

									<!-- Search Input -->
									<div class="mb-4">
										<div class="relative">
											<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
											</svg>
											<input
												type="text"
												bind:value={dropdownSearchQuery}
												placeholder={activeDropdownTab === 'trending' ? 'Search brands...' :
															activeDropdownTab === 'sellers' ? 'Search sellers...' :
															'Search quick actions...'}
												class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--input-focus-ring)] focus:border-[color:var(--input-focus-border)] bg-gray-50 hover:bg-white transition-colors"
											/>
											{#if dropdownSearchQuery.trim()}
												<button
													onclick={() => dropdownSearchQuery = ''}
													class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
												>
													<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
													</svg>
												</button>
											{/if}
										</div>
									</div>

									{#if activeDropdownTab === 'trending'}
										<div class="space-y-2">
											{#if filteredTopBrands.length > 0}
												{#each filteredTopBrands as brand}
													<button
														onclick={() => {
															goto(`/search?brand=${encodeURIComponent(brand.name)}`);
															showTrendingDropdown = false;
														}}
														class="w-full flex items-center gap-3 p-2 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
													>
														<img
															src={brand.avatar || '/avatars/1.png'}
															alt={brand.name}
															class="w-8 h-8 rounded-full object-cover flex-shrink-0"
															onerror={() => (this.src = '/avatars/1.png')}
														/>
														<div class="flex-1 min-w-0">
															<div class="flex items-center gap-2">
																<span class="text-sm font-medium text-gray-900 group-hover:text-[color:var(--text-primary)]">{brand.name}</span>
																{#if brand.verified}
																	<svg class="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
																		<path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
																	</svg>
																{/if}
																<span class="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{brand.trending}</span>
															</div>
															<span class="text-xs text-gray-500">{brand.items} items</span>
														</div>
													</button>
												{/each}
											{:else if dropdownSearchQuery.trim()}
												<div class="text-center py-8 text-gray-500">
													<svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
													</svg>
													<p class="text-sm">No brands found matching "{dropdownSearchQuery}"</p>
												</div>
											{/if}
										</div>
									{:else if activeDropdownTab === 'sellers'}
										<div class="space-y-2">
											{#if filteredDisplayTopSellers.length > 0}
												{#each filteredDisplayTopSellers as seller}
												<button
													onclick={() => {
														goto(`/profile/${seller.name}`);
														showTrendingDropdown = false;
													}}
													class="w-full flex items-center gap-3 p-2 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
												>
													<img
														src={seller.avatar || '/avatars/1.png'}
														alt={seller.name}
														class="w-8 h-8 rounded-full object-cover flex-shrink-0"
														onerror={() => (this.src = '/avatars/1.png')}
													/>
													<div class="flex-1 min-w-0">
														<div class="flex items-center gap-2">
															<span class="text-sm font-medium text-gray-900 group-hover:text-[color:var(--text-primary)] truncate">{seller.name}</span>
															{#if seller.verified}
																<svg class="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
																	<path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
																</svg>
															{/if}
														</div>
														<div class="flex items-center gap-2 text-xs text-gray-500">
															<span>{seller.items} items</span>
															{#if seller.rating > 0}
																<span>•</span>
																<div class="flex items-center gap-1">
																	<svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
																		<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
																	</svg>
																	<span>{seller.rating.toFixed(1)}</span>
																</div>
															{/if}
														</div>
													</div>
												</button>
											{/each}
											{:else if dropdownSearchQuery.trim()}
												<div class="text-center py-8 text-gray-500">
													<svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
													</svg>
													<p class="text-sm">No sellers found matching "{dropdownSearchQuery}"</p>
												</div>
											{/if}
										</div>
									{:else if activeDropdownTab === 'quickshop'}
										<div class="space-y-2">
											{#if filteredQuickShopItems.length > 0}
												{#each filteredQuickShopItems as item}
												<button
													onclick={() => {
														if (item.filter === 'collection=drip') {
															goto('/drip');
														} else if (item.filter === 'category=vintage') {
															goto('/search?category=vintage');
														} else {
															goto(`/search?${item.filter}`);
														}
														showTrendingDropdown = false;
													}}
													class="w-full flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group"
												>
													<span class="text-lg">{item.icon}</span>
													<div class="flex-1 min-w-0">
														<span class="text-sm font-medium text-gray-900 group-hover:text-[color:var(--text-primary)] block">{item.label}</span>
														<span class="text-xs text-gray-500">{item.description}</span>
													</div>
												</button>
											{/each}
											{:else if dropdownSearchQuery.trim()}
												<div class="text-center py-8 text-gray-500">
													<svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
													</svg>
													<p class="text-sm">No quick actions found matching "{dropdownSearchQuery}"</p>
												</div>
											{/if}
										</div>
									{:else}
									{/if}
								</div>
							</div>
						{/if}
					</div>

					<!-- Category Pills - Now part of unified container -->
					<nav
						id="category-pills"
						aria-label={i18n.nav_browseCategories()}
						class="flex items-center justify-start gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-3 sm:justify-center border-t border-gray-100/50"
						style="margin-top: -1px;"
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
							itemCount={category.product_count || 0}
							showItemCount={category.product_count > 0}
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
							itemCount={category.product_count || 0}
							showItemCount={category.product_count > 0}
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
							itemCount={category.product_count || 0}
							showItemCount={category.product_count > 0}
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
							itemCount={category.product_count || 0}
							showItemCount={category.product_count > 0}
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
							itemCount={virtualCategory.product_count}
							showItemCount={true}
							data-prefetch="hover"
							data-category={virtualCategory.slug}
							onmouseenter={() => prefetchCategoryPage(virtualCategory.slug)}
							ontouchstart={() => prefetchCategoryPage(virtualCategory.slug)}
							onclick={() => navigateToCategory(virtualCategory.slug)}
							onkeydown={(e: KeyboardEvent) => handlePillKeyNav(e, 5 + index)}
						/>
					{/each}

					<!-- Separator -->
					<div class="w-px h-5 bg-gray-200 mx-2"></div>

					<!-- Condition Pills -->
					{#each quickConditionFilters as condition, index}
						<button
							onclick={() => handleQuickCondition(condition.key)}
							class="shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 min-h-9 relative overflow-hidden
								{selectedCondition === condition.key
									? index === 0 ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
										: index === 1 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
										: index === 2 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
										: 'bg-gradient-to-r from-slate-600 to-gray-600 text-white shadow-md'
									: 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'}"
							aria-label={`Filter by ${condition.label}`}
						>
							<span class="relative z-10 flex items-center gap-1">
								{#if index === 0}
									<span class="w-1.5 h-1.5 rounded-full {selectedCondition === condition.key ? 'bg-white' : 'bg-emerald-500'}"></span>
								{:else if index === 1}
									<span class="w-1.5 h-1.5 rounded-full {selectedCondition === condition.key ? 'bg-white' : 'bg-blue-500'}"></span>
								{:else if index === 2}
									<span class="w-1.5 h-1.5 rounded-full {selectedCondition === condition.key ? 'bg-white' : 'bg-amber-500'}"></span>
								{:else}
									<span class="w-1.5 h-1.5 rounded-full {selectedCondition === condition.key ? 'bg-white' : 'bg-slate-500'}"></span>
								{/if}
								{condition.shortLabel}
							</span>
						</button>
					{/each}
				</nav>
			</div>
		</div>

		<!-- Promoted Highlights Section -->
		{#if dataLoaded && (filteredPromotedProducts.length > 0 || brands.length > 0)}
			<PromotedHighlights
				promotedProducts={filteredPromotedProducts}
				sellers={brands}
				partners={partners}
				onSellerSelect={handleSellerClick}
				onSellerClick={handleSellerClick}
				onPartnerClick={handlePartnerClick}
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
					ui_scroll: i18n.ui_scroll ? i18n.ui_scroll() : 'Scroll',
					promoted_hotPicks: i18n.promoted_hotPicks ? i18n.promoted_hotPicks() : 'Hot Picks',
					promoted_premiumSellers: i18n.promoted_premiumSellers ? i18n.promoted_premiumSellers() : 'Premium Sellers',
					explore_brands: i18n.explore_brands ? i18n.explore_brands() : 'Explore brands',
					brands_discover_description: i18n.brands_discover_description ? i18n.brands_discover_description() : 'Discover unique brands and their latest collections',
					brands_view_profile: i18n.brands_view_profile ? i18n.brands_view_profile() : 'View Profile',
					categoryTranslation: translateCategory
				}}
			/>
		{/if}

		<!-- Boosted Listings Section -->
		{#if dataLoaded && (boostedProducts.length > 0)}
			<div id="boosted-listings" class="relative z-0 pt-3">
				<FeaturedProducts
					products={boostedProducts}
					errors={data.errors}
					sectionTitle={i18n.boosted_listings()}
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
						product_viewAll: i18n.product_viewAll(),
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
			</div>
		{/if}


		<!-- Regular Products (Newest Listings) -->
		{#if dataLoaded && (regularProducts.length > 0)}
			<FeaturedProducts
				products={regularProducts}
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
					product_viewAll: i18n.product_viewAll(),
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

