<script lang="ts">
	import { MainPageSearchBar, BottomNav, FeaturedProducts, FeaturedSellers, PromotedListingsSection } from '@repo/ui';
	import type { Product } from '@repo/ui/types';
	import * as i18n from '@repo/i18n';
	import { notificationStore } from '$lib/stores/notifications.svelte';
	import { goto } from '$app/navigation';
	import { page, navigating } from '$app/state';
	import { browser } from '$app/environment';
	import { favoritesActions, favoritesStore } from '$lib/stores/favorites.svelte';
	import { authPopupActions, authPopupStore } from '$lib/stores/auth-popup.svelte';
	import type { PageData } from './$types';
	import type { ProductWithImages } from '@repo/ui/search';
	import type { Seller } from '@repo/ui/types';
	import { startTiming, logInfo, logError } from '$lib/utils/error-logger';

	let { data }: { data: PageData } = $props();

	// Simple state management with Svelte 5
	let searchQuery = $state('');
	let showSellerModal = $state(false);
	let selectedSeller = $state<Seller | null>(null);
	let loadingCategory = $state<string | null>(null);

	// Language state
	let currentLang = $state(i18n.getLocale());

	// Initialize searchQuery from URL
	if (browser) {
		const urlSearchQuery = page.url.searchParams.get('q') || '';
		if (urlSearchQuery) {
			searchQuery = urlSearchQuery;
		}
	}

	// Track language changes
	$effect(() => {
		const newLang = i18n.getLocale();
		if (newLang !== currentLang) {
			currentLang = newLang;
		}
	});

	// Initialize data
	let featuredProducts = $derived(data.featuredProducts || []);
	let categories = $derived(data.categories || []);
	let topSellers = $derived(data.topSellers || []);
	let topBrands = $derived(data.topBrands || []);

	// Main categories for navigation
	const mainCategories = $derived(
		(categories || [])
			.filter(cat => !cat.parent_id)
			.sort((a, b) => a.sort_order - b.sort_order)
			.slice(0, 4)
			.map(cat => ({
				slug: cat.slug,
				name: cat.name,
				product_count: 0,
				key: cat.slug,
				label: cat.name,
				icon: '📦'
			}))
	);

	// Virtual categories
	const virtualCategories = $derived([
		{
			slug: 'clothing',
			name: 'Clothing',
			product_count: 0
		},
		{
			slug: 'shoes',
			name: 'Shoes',
			product_count: 0
		},
		{
			slug: 'bags',
			name: 'Bags',
			product_count: 0
		},
		{
			slug: 'accessories',
			name: 'Accessories',
			product_count: 0
		}
	]);

	// Transform products for display
	const displayProducts = $derived(featuredProducts.map((product: any) => ({
		id: product.id,
		title: product.title,
		price: product.price,
		currency: i18n.common_currency(),
		images: product.images || [],
		condition: product.condition || 'good',
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
		category_name: product.category_name,
		main_category_name: product.main_category_name,
		subcategory_name: product.subcategory_name,
		seller_name: product.seller_name,
		seller_avatar: product.seller_avatar,
		seller_rating: product.seller_rating,
		slug: product.slug || null
	})));

	// Event handlers
	function handleMainPageCategorySelect(categorySlug: string) {
		goto(`/category/${categorySlug}`);
	}

	function handleMainPageSearch(query: string) {
		const url = new URL('/search', window.location.origin);
		if (query.trim()) {
			url.searchParams.set('q', query.trim());
		}
		goto(url.pathname + url.search);
	}

	function handleMainPageQuickSearch(query: string) {
		if (!query.trim() || !data.supabase) return { data: [], error: null };

		// Return empty results for now
		return { data: [], error: null };
	}

	function handleMainPageConditionFilter(condition: string) {
		goto(`/search?condition=${condition}`);
	}

	function handleMainPageNavigateToAll() {
		loadingCategory = 'all';
		try {
			goto('/search');
		} finally {
			loadingCategory = null;
		}
	}

	function handleMainPagePrefetchCategory(categorySlug: string) {
		try {
			goto(`/category/${categorySlug}`);
		} catch {
			// Continue without preload if failed
		}
	}

	function handleProductClick(product: Product) {
		if (product.slug) {
			goto(`/product/${product.slug}`);
		} else {
			goto(`/product/${product.id}`);
		}
	}

	async function handleFavorite(productId: string) {
		if (!data.user) {
			authPopupActions.showForFavorite();
			return;
		}

		try {
			await favoritesActions.toggleFavorite(productId);
			logInfo('Favorite toggled successfully', { productId });
		} catch (error) {
			logError('Failed to toggle favorite', error as Error, { productId });
		}
	}

	function handleBrowseAll() {
		goto('/search');
	}

	function handleSellClick() {
		goto('/sell');
	}

	function formatPrice(price: number): string {
		const formatted = price % 1 === 0 ? price.toString() : price.toFixed(2);
		return `${formatted}${i18n.common_currency()}`;
	}

	function translateCategory(categoryName: string): string {
		const categoryMap: Record<string, string> = {
			'Women': i18n.category_women(),
			'Men': i18n.category_men(),
			'Kids': i18n.category_kids(),
			'Unisex': 'Unisex',
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
			'Jeans': i18n.category_jeans(),
			'Jewelry': i18n.category_jewelry(),
			'Lingerie & Underwear': i18n.category_lingerie(),
			'Pants & Jeans': i18n.category_pantsJeans(),
			'Sandals': i18n.category_sandals(),
			'Shirts': i18n.category_shirts(),
			'Shorts': i18n.category_shorts(),
			'Skirts': i18n.category_skirts(),
			'Sneakers': i18n.category_sneakers(),
			'Sweaters & Hoodies': i18n.category_sweatersHoodies(),
			'Swimwear': i18n.category_swimwear(),
			'T-Shirts': i18n.category_tshirts(),
			'Tops & T-Shirts': i18n.category_topsTshirts(),
			'Underwear': i18n.category_underwear(),
			'Watches': i18n.category_watches(),
			'Clothing': i18n.category_clothing(),
			'Shoes': i18n.category_shoesType(),
		};
		return categoryMap[categoryName] || categoryName;
	}

	function closeSellerModal() {
		showSellerModal = false;
		selectedSeller = null;
	}

	// Quick condition filters
	const quickConditionFilters = [
		{ key: 'brand_new_with_tags', label: i18n.sell_condition_brandNewWithTags(), shortLabel: 'New with tags' },
		{ key: 'like_new', label: i18n.condition_likeNew(), shortLabel: i18n.condition_likeNew() },
		{ key: 'good', label: i18n.condition_good(), shortLabel: i18n.condition_good() }
	];
</script>

{#key currentLang}
<!-- Main Page Search Bar -->
<div class="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
	<MainPageSearchBar
		supabase={data.supabase}
		bind:searchQuery
		topBrands={topBrands}
		topSellers={topSellers}
		{mainCategories}
		{virtualCategories}
		conditionFilters={quickConditionFilters}
		{i18n}
		{currentLang}
		selectedCondition={null}
		{loadingCategory}
		onSearch={handleMainPageSearch}
		onQuickSearch={handleMainPageQuickSearch}
		onCategorySelect={handleMainPageCategorySelect}
		onConditionFilter={handleMainPageConditionFilter}
		onNavigateToAll={handleMainPageNavigateToAll}
		onPillKeyNav={() => {}}
		onPrefetchCategory={handleMainPagePrefetchCategory}
	/>
</div>

<!-- Main Content Area -->
<div class="min-h-screen bg-[color:var(--surface-base)] pb-20 sm:pb-0">
	<main>
		<!-- Regular Products -->
		{#if displayProducts.length > 0}
			<FeaturedProducts
				products={displayProducts}
				errors={data.errors}
				sectionTitle={i18n.home_newestListings()}
				onProductClick={handleProductClick}
				onFavorite={handleFavorite}
				onBrowseAll={handleBrowseAll}
				onSellClick={handleSellClick}
				{formatPrice}
				favoritesState={favoritesStore}
				showViewAllButton={true}
				onViewAll={() => goto('/search')}
				class="pt-3 sm:pt-4"
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
					condition_fair: i18n.sell_condition_fair(),
					categoryTranslation: translateCategory
				}}
			/>
		{:else}
			<!-- No products found - show call to action -->
			<div class="px-2 sm:px-4 lg:px-6 py-8 text-center">
				<div class="max-w-md mx-auto">
					<div class="w-16 h-16 bg-[color:var(--surface-brand-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-[color:var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-[color:var(--text-primary)] mb-2">Welcome to Driplo</h3>
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
								onclick={handleSellClick}
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

<!-- Bottom Navigation -->
<BottomNav
	currentPath={page.url.pathname}
	isNavigating={!!navigating}
	navigatingTo={navigating?.to?.url.pathname}
	unreadMessageCount={notificationStore.unreadCount}
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

<!-- Auth Popup -->
{#if authPopupStore.state.isOpen}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 max-w-sm mx-4">
			<h3 class="text-lg font-semibold mb-4">Sign In Required</h3>
			<p class="text-gray-600 mb-4">Please sign in to continue</p>
			<div class="flex gap-3">
				<button
					onclick={authPopupActions.close}
					class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
				>
					Cancel
				</button>
				<button
					onclick={() => goto('/auth/signin')}
					class="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
				>
					Sign In
				</button>
			</div>
		</div>
	</div>
{/if}

{/key}