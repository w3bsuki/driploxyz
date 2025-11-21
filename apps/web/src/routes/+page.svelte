<script lang="ts">
	import { MainPageSearchBar, BottomNav, FeaturedProducts, PromotedListingsSection } from '@repo/ui';
	import type { Product } from '@repo/ui/types';
	import { mapProduct, mapCategory } from '$lib/types/domain';
	import * as i18n from '@repo/i18n';
	import { notificationStore } from '$lib/stores/notifications.svelte';
	import { goto, preloadCode, preloadData } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { favoritesActions, favoritesStore } from '$lib/stores/favorites.svelte';
	import { authPopupActions, authPopupStore } from '$lib/stores/auth-popup.svelte';
	import type { PageData } from './$types';
	// Removed unused Seller type import
	import { logInfo, logError } from '$lib/utils/error-logger';
	import { createBrowserSupabaseClient } from '$lib/supabase/client';

	let { data }: { data: PageData } = $props();

	// Simple state management with Svelte 5
	let searchQuery = $state('');
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

	// Initialize data - using proper TypeScript narrowing per official docs
	let featuredProducts = $derived(data.featuredProducts || []);
	let categories = $derived(data.categories || []);
	
	// Create Supabase client for client-side quick searches
	const supabase = browser ? createBrowserSupabaseClient() : null;

			// No local modal state needed; we navigate directly to seller profile

	type QuickSearchResult = {
		id: string;
		title: string;
		price: number;
		images: Array<{ image_url: string }>;
		slug?: string | null;
		first_image_url?: string | null;
		[key: string]: unknown;
	};

	// Main categories for navigation
	const mainCategories = $derived(
		(categories || [])
			.filter((cat: NonNullable<typeof categories>[number]) => !cat.parent_id)
			.sort((a: NonNullable<typeof categories>[number], b: NonNullable<typeof categories>[number]) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
			.slice(0, 4)
			.map((cat: NonNullable<typeof categories>[number]) => {
				const mapped = mapCategory(cat);
				// Translate category names from database
				return {
					...mapped,
					name: translateCategory(mapped.name)
				};
			})
	);

	// Virtual categories
	const virtualCategories = $derived(
		[
			{ slug: 'clothing', name: i18n.category_clothing(), product_count: 0 },
			{ slug: 'shoes', name: i18n.category_shoesType(), product_count: 0 },
			{ slug: 'bags', name: i18n.category_bags(), product_count: 0 },
			{ slug: 'accessories', name: i18n.category_accessories(), product_count: 0 }
		].map((c: { slug: string; name: string; product_count: number }) => mapCategory(c))
	);


	// Transform products for display
	const displayProducts = $derived(featuredProducts.map((product: NonNullable<typeof featuredProducts>[number]) => ({
		// Normalize using the canonical mapper so we satisfy Product UI shapes
		...mapProduct(product),
		currency: i18n.common_currency()
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

	async function handleMainPageQuickSearch(query: string): Promise<{ data: QuickSearchResult[]; error: string | null }> {
		if (!query?.trim() || !supabase) {
			return { data: [], error: null };
		}

		try {
			const { data: searchResults, error } = await (supabase.rpc as any)(
				'search_products_fast',
				{
					query_text: query.trim(),
					result_limit: 6
				}
			);

			if (error) {
				logError('Main page quick search failed', new Error(error.message), { query });
				return { data: [], error: error.message };
			}

			const normalizedResults = Array.isArray(searchResults) ? searchResults : [];
			const transformed = normalizedResults.map((result: QuickSearchResult) => ({
				...result,
				images: result.first_image_url ? [{ image_url: result.first_image_url }] : []
			}));

			return { data: transformed, error: null };
		} catch (err) {
			logError('Main page quick search failed', err as Error, { query });
			return { data: [], error: 'Search failed' };
		}
	}

	function handleMainPageNavigateToBrand(brandName: string) {
		if (!brandName?.trim()) return;
		goto(`/search?brand=${encodeURIComponent(brandName.trim())}`);
	}

	function handleMainPageNavigateToSeller(identifier: string) {
		if (!identifier?.trim()) return;
		// Navigate directly to profile - sellers list is now in global discover modal
		goto(`/profile/${identifier.trim()}`);
	}

	function handleMainPageNavigateToQuickShop(filter: string) {
		if (!filter) {
			goto('/search');
			return;
		}

		const params = new URLSearchParams();
		for (const segment of filter.split('&')) {
			const [key, value] = segment.split('=');
			if (key && value) {
				params.set(key, value);
			}
		}

		const queryString = params.toString();
		goto(queryString ? `/search?${queryString}` : '/search');
	}

	function handleMainPageNavigateToDrip() {
		goto('/drip');
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

	async function handleMainPagePrefetchCategory(categorySlug: string) {
		if (!browser) return;

		const path = `/category/${categorySlug}`;

		try {
			await preloadCode(path);
			preloadData(path).catch(() => {});
		} catch (error) {
			logError('Failed to prefetch category page', error as Error, { categorySlug });
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
			'Unisex': i18n.category_unisex(),
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

	// Quick condition filters
	const quickConditionFilters = [
		{ key: 'brand_new_with_tags', label: i18n.sell_condition_brandNewWithTags(), shortLabel: i18n.condition_newWithTags?.() ?? i18n.sell_condition_brandNewWithTags() },
		{ key: 'like_new', label: i18n.condition_likeNew(), shortLabel: i18n.condition_likeNew() },
		{ key: 'good', label: i18n.condition_good(), shortLabel: i18n.condition_good() }
	];
</script>

{#key currentLang}
<!-- Main Page Search Bar -->
<MainPageSearchBar
	bind:searchQuery
	topBrands={[]}
	topSellers={[]}
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
	currentPath={page.url.pathname}
	onNavigateToBrand={handleMainPageNavigateToBrand}
	onNavigateToSeller={handleMainPageNavigateToSeller}
	onNavigateToQuickShop={handleMainPageNavigateToQuickShop}
	onNavigateToDrip={handleMainPageNavigateToDrip}
  onNavigateToSellersList={() => goto('/sellers')}
  onNavigateToBrandsList={() => goto('/brands')}
/>

<!-- Reverted: using existing quick pills under the search bar (no additional pills injected here) -->

	<!-- Main Content Area -->
	<div class="min-h-screen bg-[color:var(--surface-base)] pb-[var(--space-20)] sm:pb-0">
		<main aria-label="Main content">
			<!-- Regular Products -->
			{#if displayProducts.length > 0}
				<PromotedListingsSection
					promotedProducts={displayProducts.slice(0, 8) as unknown as Product[]}
					onProductClick={handleProductClick}
					onFavorite={handleFavorite}
					favoritesState={favoritesStore}
					{formatPrice}
					translations={{
						promoted_listings: i18n.home_promotedListings(),
						promoted_description: i18n.home_promotedDescription(),
						common_currency: i18n.common_currency(),
						product_addToFavorites: i18n.product_addToFavorites(),
						seller_unknown: i18n.seller_unknown(),
						condition_brandNewWithTags: i18n.sell_condition_brandNewWithTags(),
						condition_newWithoutTags: i18n.sell_condition_newWithoutTags(),
						condition_new: i18n.condition_new(),
						condition_likeNew: i18n.condition_likeNew(),
						condition_good: i18n.condition_good(),
						condition_worn: i18n.sell_condition_worn(),
						condition_fair: i18n.sell_condition_fair(),
						categoryTranslation: translateCategory,
						banner_curatedPicks: i18n.banner_curatedPicks?.(),
						banner_defaultCopy: i18n.banner_defaultCopy?.(),
						banner_tabSellers: i18n.banner_tabSellers?.(),
						banner_tabBrands: i18n.banner_tabBrands?.(),
						banner_viewAll: i18n.banner_viewAll?.(),
						banner_ariaPrevious: i18n.banner_ariaPrevious?.(),
						banner_ariaNext: i18n.banner_ariaNext?.()
					}}
					class="home-promoted-section"
				/>

				<FeaturedProducts
					products={displayProducts as unknown as Product[]}
					errors={data.errors ? { products: data.errors.products ?? undefined } : undefined}
					sectionTitle={i18n.home_newestListings()}
					onProductClick={handleProductClick}
					onFavorite={handleFavorite}
					onBrowseAll={handleBrowseAll}
					onSellClick={handleSellClick}
					{formatPrice}
					favoritesState={favoritesStore}
					showViewAllButton={true}
					onViewAll={() => goto('/search')}
					class="home-newest-section"
					translations={{
						empty_noProducts: i18n.empty_noProducts(),
						empty_startBrowsing: i18n.empty_startBrowsing(),
						nav_sell: i18n.nav_sell(),
						home_browseAll: i18n.home_browseAll(),
						home_itemCount: i18n.home_itemCount(),
						home_itemCountNew: i18n.home_itemCountNew,
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
						condition_fair: i18n.sell_condition_fair(),
						categoryTranslation: translateCategory,
						banner_viewAll: i18n.banner_viewAll?.()
					}}
				/>
			{:else}
			<!-- No products found - show call to action -->
			<div class="px-[var(--space-2)] sm:px-[var(--space-4)] lg:px-[var(--space-6)] py-[var(--space-8)] text-center">
				<div class="max-w-md mx-auto">
					<div class="w-[var(--space-16)] h-[var(--space-16)] bg-[color:var(--surface-brand-subtle)] rounded-full flex items-center justify-center mx-auto mb-[var(--space-4)]">
						<svg class="w-[var(--space-8)] h-[var(--space-8)] text-[color:var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-[color:var(--text-primary)] mb-[var(--space-2)]">Welcome to Driplo</h3>
					<p class="text-[color:var(--text-secondary)] mb-[var(--space-6)]">
						{data.user ?
							'No products available yet. Check back soon for new listings!' :
							'Discover amazing second-hand fashion and unique finds from sellers across Bulgaria and the UK.'
						}
					</p>
					<div class="space-y-[var(--space-3)]">
						<button
							onclick={() => goto('/search')}
							class="w-full bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)] px-[var(--space-6)] py-[var(--space-3)] rounded-[var(--radius-md)] font-medium hover:bg-[color:var(--brand-primary)]/90 transition-colors"
						>
							{i18n.home_browseAll()}
						</button>
						{#if data.user}
							<button
								onclick={handleSellClick}
								class="w-full border border-[color:var(--border-primary)] text-[color:var(--brand-primary)] px-[var(--space-6)] py-[var(--space-3)] rounded-[var(--radius-md)] font-medium hover:bg-[color:var(--surface-secondary)] transition-colors"
							>
								{i18n.nav_sell()}
							</button>
						{:else}
							<button
								onclick={() => authPopupActions.showForSignUp()}
								class="w-full border border-[color:var(--border-primary)] text-[color:var(--brand-primary)] px-[var(--space-6)] py-[var(--space-3)] rounded-[var(--radius-md)] font-medium hover:bg-[color:var(--surface-secondary)] transition-colors"
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
	unreadMessageCount={notificationStore.unreadCount}
	profileHref={'/account'}
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
		<div class="bg-white rounded-[var(--radius-lg)] p-[var(--space-6)] max-w-sm mx-[var(--space-4)]">
			<h3 class="text-lg font-semibold mb-[var(--space-4)]">Sign In Required</h3>
			<p class="text-[color:var(--text-secondary)] mb-[var(--space-4)]">Please sign in to continue</p>
			<div class="flex gap-[var(--space-3)]">
				<button
					onclick={authPopupActions.close}
					class="flex-1 px-[var(--space-4)] py-[var(--space-2)] border border-[color:var(--border-default)] rounded-[var(--radius-md)] hover:bg-[color:var(--surface-subtle)]"
				>
					Cancel
				</button>
				<button
					onclick={() => goto('/auth/signin')}
					class="flex-1 px-[var(--space-4)] py-[var(--space-2)] bg-[color:var(--surface-inverse)] text-[color:var(--text-inverse)] rounded-[var(--radius-md)] hover:bg-[color:var(--surface-inverse)]/90"
				>
					Sign In
				</button>
			</div>
		</div>
	</div>
{/if}

{/key}