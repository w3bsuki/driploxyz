<script lang="ts">
	import { Button, SearchBar, ProductCard, Avatar } from '@repo/ui';
	import Header from '$lib/components/Header.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import QuickViewDialog from '$lib/components/QuickViewDialog.svelte';
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
		name: seller.full_name || seller.username,
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
		<!-- Sticky Search & Categories Container -->
		<div class="sticky top-14 sm:top-16 z-30 bg-gray-50 border-b border-gray-200">
			<div class="px-4 sm:px-6 lg:px-8 py-4 space-y-3">
				<!-- Search Bar -->
				<SearchBar 
					bind:value={searchQuery}
					onSearch={handleSearch}
					onFilter={handleFilter}
					showCategoryDropdown={true}
					placeholder="Search for anything..."
					suggestions={['Vintage jackets', 'Designer bags', 'Summer dresses', 'Sneakers']}
				/>
				
				<!-- Category Pills - Scrollable on mobile -->
				<div class="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
					{#each mainCategories as category}
						<button 
							onclick={() => navigateToCategory(category.slug)}
							class="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
						>
							{category.name}
						</button>
					{/each}
					<button 
						onclick={() => goto('/search')}
						class="flex-shrink-0 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-900 transition-colors"
					>
						View all
					</button>
				</div>
			</div>
		</div>

		<!-- Promoted Listings / Highlights -->
		<div class="bg-white border-b border-gray-200">
			<div class="px-4 py-4 overflow-x-auto scrollbar-hide">
				<div class="flex space-x-3">
					<!-- Your Story -->
					<a 
						href="/sell"
						class="relative flex-shrink-0 group"
					>
						<div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
							<svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
						</div>
						<span class="block text-xs text-center mt-1 font-medium">Sell</span>
					</a>

					<!-- Promoted Products -->
					{#if promotedProducts && promotedProducts.length > 0}
						{#each promotedProducts as product}
							<button 
								onclick={() => goto(`/product/${product.id}`)}
								class="relative flex-shrink-0 group"
							>
								<div class="relative">
									<!-- Promoted badge -->
									<div class="absolute -top-1 -right-1 z-10 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
										<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
										</svg>
									</div>
									<!-- Product image -->
									<div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-purple-400 group-hover:scale-105 transition-transform">
										<img 
											src={product.images[0]?.image_url || '/placeholder-product.svg'} 
											alt={product.title}
											class="w-full h-full object-cover"
										/>
									</div>
								</div>
								<span class="block text-xs text-center mt-1 font-medium truncate max-w-[64px] sm:max-w-[80px]">
									${product.price}
								</span>
							</button>
						{/each}
					{/if}

					<!-- Top Sellers (if no promoted products) -->
					{#if (!promotedProducts || promotedProducts.length === 0) && sellers.length > 0}
						{#each sellers as seller}
							<div class="relative flex-shrink-0">
								<Avatar 
									size="lg" 
									name={seller.name} 
									src={seller.avatar}
									premium={seller.premium}
									variant="square"
									onclick={() => handleSellerClick(seller)}
								/>
								{#if seller.premium}
									<div class="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full border border-white shadow-lg flex items-center justify-center">
										<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
										</svg>
									</div>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>

		<!-- Product Grid -->
		<div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
			
			<!-- Featured Products Grid -->
			{#if products.length > 0}
				<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
					{#each products as product}
						<ProductCard 
							{product}
							onclick={() => handleProductClick(product)}
							onFavorite={handleFavorite}
							favorited={false}
						/>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5m14 14H5" />
					</svg>
					<h3 class="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
					<p class="mt-1 text-sm text-gray-500">Get started by listing your first item!</p>
					<div class="mt-6">
						<Button 
							variant="primary" 
							onclick={() => goto('/sell')}
						>
							List an item
						</Button>
					</div>
				</div>
			{/if}

			<!-- Load More - Simple -->
			{#if products.length > 0}
				<div class="text-center mt-8">
					<Button 
						variant="ghost" 
						size="lg" 
						class="text-gray-600"
						onclick={() => goto('/search')}
					>
						Browse all items
					</Button>
				</div>
			{/if}
			
			<!-- Error Messages -->
			{#if data.errors.products}
				<div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
					<p class="text-sm text-red-800">
						{data.errors.products}
					</p>
				</div>
			{/if}
		</div>
	</main>
</div>

<BottomNav />

<!-- Quick View Dialog for Premium Sellers -->
<QuickViewDialog 
	seller={selectedSeller} 
	onclose={() => selectedSeller = null} 
/>

