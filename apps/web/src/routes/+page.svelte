<script lang="ts">
	// Core components loaded immediately
	import { MainPageSearchBar, EnhancedSearchBar, SearchDropdown, CategoryDropdown, BottomNav, AuthPopup, FeaturedProducts, LoadingSpinner, SellerQuickView, FeaturedSellers, FilterPill, CategoryPill, PromotedHighlights, PromotedListingsSection } from '@repo/ui';
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
	let dropdownSearchQuery = $state('');
	let activeDropdownTab = $state('trending');
	let showTrendingDropdown = $state(false);
	let selectedSeller = $state<Seller | null>(null);
	let selectedPartner = $state<any>(null);
	let showSellerModal = $state(false);
	let showPartnerModal = $state(false);
	let showCategoryDropdown = $state(false);
	let loadingCategory = $state<string | null>(null);
	let selectedPillIndex = $state(-1);
	let activeTab = $state<'sellers' | 'brands'>('sellers');

	// Handle streamed data
	let featuredProductsData = $state<any[]>([]);
	let topBrandsData = $state<any[]>([]);
	let topSellersData = $state<any[]>([]);
	let sellersData = $state<any[]>([]);
	let userFavoritesData = $state<Record<string, boolean>>({});
	let dataLoaded = $state(false);

	// Batched preview map for sellers/brands (populated client-side without MCP)
	let sellerPreviewMap = $state<Record<string, Product[]>>({});

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

	// Top sellers data - clean data for MainPageSearchBar
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

	// Quick shop items - keeping these as shortcuts
	const quickShopItems = [
		{ label: 'Under $25', description: 'Budget finds', filter: 'max_price=25', icon: '💰' },
		{ label: 'Drip Collection', description: 'Staff picks', filter: 'collection=drip', icon: '💧' },
		{ label: 'Designer $100+', description: 'Premium pieces', filter: 'min_price=100', icon: '💎' },
		{ label: 'New with Tags', description: 'Brand new condition', filter: 'condition=brand_new_with_tags', icon: '🏷️' },
		{ label: 'Like New', description: 'Excellent condition', filter: 'condition=like_new', icon: '✨' }
	];

	// Component state
	let sellersInView = $state(false);

	// Language state - already initialized in +layout.svelte
	let currentLang = $state(i18n.getLocale());
	let updateKey = $state(0);

	// Sync searchQuery with URL parameters on page load/navigation
	$effect(() => {
		if (browser) {
			const urlSearchQuery = $page.url.searchParams.get('q') || '';
			if (urlSearchQuery !== searchQuery) {
				searchQuery = urlSearchQuery;
			}
		}
	});

	// Track language changes and setup route preloading
	$effect(() => {
		const newLang = i18n.getLocale();
		if (newLang !== currentLang) {
			currentLang = newLang;
			updateKey++;
		}
	});

	// Use server-provided data instead of client-side fetching for better performance
	// Server already loads categories and sellers in +page.server.ts

	// Debug data (removed to prevent infinite loops)

	
	
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
			// BOOST: Keep the is_boosted field from server
			is_boosted: product.is_boosted || false,
			// SELLER SUBSCRIPTION: Keep seller tier and badges from server
			seller_subscription_tier: product.seller_subscription_tier,
			seller_badges: product.seller_badges,
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

	// Optimized promoted products computation using $derived.by() for better performance
	const promotedProducts = $derived.by(() => {
		const rawProducts = featuredProductsData || [];
		if (rawProducts.length === 0) return [];

		return rawProducts
			.filter(product =>
				// Only include products from pro/premium/brand sellers or boosted products
				product.seller_subscription_tier === 'pro' ||
				product.seller_subscription_tier === 'premium' ||
				product.seller_subscription_tier === 'brand' ||
				product.seller_badges?.is_pro ||
				product.seller_badges?.is_brand ||
				product.is_boosted
			)
			.map(product => {
				const transformed = transformProduct(product);
				return {
					...transformed,
					category_name: transformed.category_name || transformed.main_category_name || 'Uncategorized',
					main_category_name: transformed.main_category_name || transformed.category_name || 'Uncategorized'
				};
			});
	});

	// Optimized products transformation using $derived.by()
	const products = $derived.by(() => {
		const rawProducts = featuredProductsData || [];
		if (rawProducts.length === 0) return [];

		return rawProducts.map(product => {
			const transformed = transformProduct(product);
			return {
				...transformed,
				category_name: transformed.category_name || transformed.main_category_name || 'Uncategorized',
				main_category_name: transformed.main_category_name || transformed.category_name || 'Uncategorized'
			};
		});
	});

	// Optimized product filtering using $derived.by()
	const boostedProducts = $derived.by(() => {
		return products.filter(product => product.is_boosted).slice(0, 8); // Limit to 8 boosted products
	});

	const regularProducts = $derived.by(() => {
		return products.filter(product => !product.is_boosted);
	});

	// Optimized sellers transformation using $derived.by()
	const sellers = $derived.by(() => {
		const rawSellers = topSellersData || [];
		if (rawSellers.length === 0) return [];

		return rawSellers
			.filter(seller => {
				const username = seller.username;
				// Include verified users with active listings or admin accounts
				return seller.verified && (seller.sales_count > 0 || seller.account_type === 'admin') && (
					username === 'kush3' ||
					username === 'indecisive_wear' ||
					username === 'Tintin' ||
					seller.account_type === 'brand'
				);
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
			});
	});

	// Optimized brands transformation using $derived.by()
	const brands = $derived.by(() => {
		const rawBrands = topBrandsData || [];
		if (rawBrands.length === 0) return [];

		return rawBrands.map(brand => {
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
		});
	});


	// Optimized seller products mapping using $derived.by()
	const sellerProducts = $derived.by(() => {
		const map: Record<string, Product[]> = {};
		const entities = [...sellers, ...brands];

		if (entities.length === 0) return map;

		for (const entity of entities) {
			const serverPreviews = sellerPreviewMap[entity.id];
			if (serverPreviews && serverPreviews.length > 0) {
				map[entity.id] = serverPreviews.slice(0, 3);
			}
		}
		return map;
	});

	// Consolidated effect for data initialization to reduce re-renders
	$effect(() => {
		// Handle seller previews
		if (data.sellerPreviews instanceof Promise) {
			data.sellerPreviews.then(previews => sellerPreviewMap = previews || {});
		} else {
			sellerPreviewMap = data.sellerPreviews || {};
		}

		// Initialize favorites from server data when products are available
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

	// Production cleanup - debug logs removed for better performance

	// Transform top sellers for TrendingDropdown (filtered to approved users only)
	const topSellers = $derived<Seller[]>(
		(topSellersData || [])
			.filter(seller => {
				const username = seller.username;
				// Include verified users with active listings or admin accounts
				return seller.verified && (seller.sales_count > 0 || seller.account_type === 'admin') && (
					username === 'kush3' ||
					username === 'indecisive_wear' ||
					username === 'Tintin' ||
					seller.account_type === 'brand'
				);
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
		} else if (!query.trim() && $page.url.searchParams.has('q')) {
			// Clear search param if query is empty
			const url = new URL($page.url);
			url.searchParams.delete('q');
			goto(url.pathname + url.search, { replaceState: true });
		}
	}

	// Handle category selection from MainPageSearchBar
	function handleMainPageCategorySelect(categorySlug: string) {
		goto(`/category/${categorySlug}`);
	}

	// Handle filter changes from MainPageSearchBar
	function handleMainPageFilterChange(key: string, value: any) {
		const url = new URL('/search', window.location.origin);
		url.searchParams.set(key, value);
		goto(url.pathname + url.search);
	}

	// Handle condition filter from MainPageSearchBar
	function handleMainPageConditionFilter(condition: string) {
		if (selectedCondition === condition) {
			selectedCondition = null;
			goto('/search');
		} else {
			selectedCondition = condition;
			goto(`/search?condition=${condition}`);
		}
	}

	// Handle navigate to all from MainPageSearchBar
	async function handleMainPageNavigateToAll() {
		loadingCategory = 'all';
		try {
			await goto('/search');
		} finally {
			loadingCategory = null;
		}
	}

	// Handle pill keyboard navigation from MainPageSearchBar
	function handleMainPagePillKeyNav(e: KeyboardEvent, index: number) {
		const pills = document.querySelectorAll('#category-pills button');
		const totalPills = mainCategories.length + 1 + virtualCategories.length;

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

	// Handle prefetch category from MainPageSearchBar
	async function handleMainPagePrefetchCategory(categorySlug: string) {
		try {
			await preloadCode(`/category/${categorySlug}`);
			await preloadData(`/category/${categorySlug}`);
		} catch (e) {
			// Continue without preload if failed
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

	// SearchDropdown event handlers (unused with new MainPageSearchBar)
	function handleDropdownCategorySelect(category: any) {
		goto(`/category/${category.slug}`);
	}

	function handleDropdownSellerSelect(seller: any) {
		goto(`/profile/${seller.username}`);
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

	// Get only top-level categories for navigation pills with real product counts
	const mainCategories = $derived(
		(data.categories || [])
			.filter(cat => !cat.parent_id) // Only top-level categories
			.sort((a, b) => a.sort_order - b.sort_order) // Sort by order
			.slice(0, 4) // Take first 4 (Women, Men, Kids, Unisex)
			.map(cat => ({
				slug: cat.slug,
				name: translateCategory(cat.name),
				product_count: data.categoryProductCounts?.[cat.slug] || 0, // Real count from server
				// Keep legacy properties for compatibility
				key: cat.slug,
				label: translateCategory(cat.name),
				icon: getCategoryIcon(cat.name)
			}))
	);

	// Categories loaded with product counts

	// Virtual categories for quick access with real product counts
	const virtualCategories = $derived([
		{
			slug: 'clothing',
			name: i18n.category_clothing ? i18n.category_clothing() : 'Clothing',
			product_count: data.virtualCategoryCounts?.clothing || 0 // Real count from server
		},
		{
			slug: 'shoes',
			name: i18n.category_shoesType ? i18n.category_shoesType() : 'Shoes',
			product_count: data.virtualCategoryCounts?.shoes || 0 // Real count from server
		},
		{
			slug: 'bags',
			name: i18n.category_bagsType ? i18n.category_bagsType() : 'Bags',
			product_count: data.virtualCategoryCounts?.bags || 0 // Real count from server
		},
		{
			slug: 'accessories',
			name: i18n.category_accessoriesType ? i18n.category_accessoriesType() : 'Accessories',
			product_count: data.virtualCategoryCounts?.accessories || 0 // Real count from server
		}
	]);

	// Get category icon from constants
	function getCategoryIcon(categoryName: string): string {
		return CATEGORY_ICONS[categoryName] || DEFAULT_CATEGORY_ICON;
	}

	// Quick condition filters (most used) - matching search page
	const quickConditionFilters = [
		{ key: 'brand_new_with_tags', label: i18n.sell_condition_brandNewWithTags(), shortLabel: 'New with tags' },
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

	// MainPageSearchBar handlers
	function handleMainPageSearch(query: string) {
		const url = new URL('/search', window.location.origin);
		if (query.trim()) {
			url.searchParams.set('q', query.trim());
		}
		goto(url.pathname + url.search);
	}

	async function handleMainPageQuickSearch(query: string) {
		if (!query.trim()) return { data: [], error: null };

		try {
			const { data: products, error } = await data.supabase
				.from('products')
				.select('id, title, price, seller_id, product_images(image_url)')
				.ilike('title', `%${query}%`)
				.eq('country_code', data.country || 'BG')
				.limit(6);

			if (error) return { data: [], error: error.message };
			return { data: products || [], error: null };
		} catch (err) {
			return { data: [], error: 'Search failed' };
		}
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

<!-- Main Page Search Bar with real data and handlers -->
<div class="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
	<MainPageSearchBar
		supabase={data.supabase}
		bind:searchQuery={searchQuery}
		topBrands={topBrands}
		topSellers={displayTopSellers}
		mainCategories={mainCategories}
		virtualCategories={virtualCategories}
		conditionFilters={quickConditionFilters}
		{i18n}
		{currentLang}
		{selectedCondition}
		{loadingCategory}
		onSearch={handleMainPageSearch}
		onQuickSearch={handleMainPageQuickSearch}
		onCategorySelect={handleMainPageCategorySelect}
		onConditionFilter={handleMainPageConditionFilter}
		onNavigateToAll={handleMainPageNavigateToAll}
		onPillKeyNav={handleMainPagePillKeyNav}
		onPrefetchCategory={handleMainPagePrefetchCategory}
	/>
</div>

<!-- Promoted Products Section (motivation for sellers) -->
{#if dataLoaded && (boostedProducts.length > 0 || products.length > 0)}
	<div class="relative z-0">
		<PromotedListingsSection
			promotedProducts={boostedProducts.length > 0 ? boostedProducts : products.slice(0, 8)}
			onProductClick={handleProductClick}
			onFavorite={handleFavorite}
			onBuy={handlePurchase}
			favoritesState={$favoritesStore}
			{formatPrice}
			translations={{
				promoted_listings: i18n.promoted_listings(),
				promoted_description: i18n.promoted_description(),
				common_currency: i18n.common_currency(),
				product_addToFavorites: i18n.product_addToFavorites(),
				seller_unknown: i18n.seller_unknown(),
				condition_brandNewWithTags: i18n.sell_condition_brandNewWithTags(),
				condition_newWithoutTags: i18n.sell_condition_newWithoutTags(),
				condition_new: i18n.condition_new(),
				condition_likeNew: i18n.condition_likeNew(),
				condition_good: i18n.condition_good(),
				condition_worn: i18n.sell_condition_worn(),
				condition_fair: i18n.condition_fair(),
				categoryTranslation: translateCategory
			}}
			class="pt-1"
		/>
	</div>
{/if}

<!-- Highlight Sellers/Brands Section -->
{#if dataLoaded && sellers.length > 0}
  <FeaturedSellers
		sellers={(activeTab === 'brands' ? brands : sellers)}
		sellerProducts={sellerProducts}
		onSellerClick={handleSellerClick}
		title={i18n.highlight_sellers()}
		description={activeTab === 'brands' ? i18n.verified_brands() : i18n.top_rated_sellers()}
		class="pt-[var(--space-2)]"
		showToggle={true}
		activeTab={activeTab}
		onToggle={(tab) => { activeTab = tab }}
	/>
{/if}

<!-- Main Content Area -->
<div class="min-h-screen bg-[color:var(--surface-base)] pb-20 sm:pb-0">
	<main>
		<!-- Promoted Products Section moved below Highlight Sellers/Brands -->


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
				class="pt-1"
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

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
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

