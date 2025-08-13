<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import QuickViewDialog from '$lib/components/QuickViewDialog.svelte';
	import HeroSearch from '$lib/components/HeroSearch.svelte';
	import PromotedHighlights from '$lib/components/PromotedHighlights.svelte';
	import FeaturedProducts from '$lib/components/FeaturedProducts.svelte';
	import { goto } from '$app/navigation';
	import { serviceUtils } from '$lib/services';
	import type { PageData } from './$types';
	import type { ProductWithImages } from '$lib/services';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedSeller = $state<any>(null);

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
		createdAt: product.created_at,
		location: product.location
	})));

	// Transform sellers for display
	const sellers = $derived(data.topSellers.map(seller => ({
		id: seller.id,
		name: seller.username || seller.full_name,
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
			goto(`/profile/${seller.id}`);
		}
	}

	function handleFilter() {
		goto('/search');
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
</script>

<div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
	<Header />

	<main class="max-w-7xl mx-auto">
		<HeroSearch 
			bind:searchQuery
			categories={mainCategories}
			onSearch={handleSearch}
			onFilter={handleFilter}
		/>

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

