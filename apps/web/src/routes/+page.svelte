<script lang="ts">
	import { Button, SearchBar, ProductCard, Avatar, type Product } from '@repo/ui';
	import Header from '$lib/components/Header.svelte';

	let searchQuery = $state('');

	// Mock premium sellers/ads data
	const premiumSellers = [
		{ id: 1, name: 'Vintage Store', premium: true, avatar: '/placeholder-product.svg' },
		{ id: 2, name: 'Designer Outlet', premium: true, avatar: '/placeholder-product.svg' },
		{ id: 3, name: 'Sarah M.', premium: true, avatar: null },
		{ id: 4, name: 'Fashion Hub', premium: true, avatar: '/placeholder-product.svg' },
		{ id: 5, name: 'Alex K.', premium: false, avatar: null },
		{ id: 6, name: 'Luxury Finds', premium: true, avatar: '/placeholder-product.svg' },
		{ id: 7, name: 'Emma\'s Closet', premium: false, avatar: null },
		{ id: 8, name: 'Top Seller', premium: true, avatar: '/placeholder-product.svg' },
		{ id: 9, name: 'Mike\'s Shop', premium: false, avatar: null },
		{ id: 10, name: 'Premium Deals', premium: true, avatar: '/placeholder-product.svg' },
	];

	// Mock product data
	const mockProducts: Product[] = Array.from({ length: 8 }, (_, i) => ({
		id: `product-${i + 1}`,
		title: `Vintage Denim Jacket ${i + 1}`,
		description: 'A beautiful vintage denim jacket in excellent condition',
		price: 35 + (i * 10),
		images: ['/placeholder-product.svg'],
		brand: i % 2 === 0 ? 'Levi\'s' : 'Calvin Klein',
		size: ['XS', 'S', 'M', 'L', 'XL'][i % 5],
		condition: (['new', 'like-new', 'good', 'fair'] as const)[i % 4],
		category: 'Jackets',
		sellerId: `seller-${i + 1}`,
		sellerName: `Seller ${i + 1}`,
		sellerRating: 4.2 + (i * 0.1),
		createdAt: new Date().toISOString(),
		location: 'New York, NY'
	}));

	function handleSearch(query: string) {
		console.log('Searching for:', query);
	}

	function handleProductClick(product: Product) {
		console.log('Clicked product:', product.title);
	}

	function handleFavorite(product: Product) {
		console.log('Favorited:', product.title);
	}

	function handleSellerClick(seller: any) {
		console.log('Clicked seller:', seller.name);
	}

	function handleFilter() {
		console.log('Open filters');
	}
</script>

<div class="min-h-screen bg-gray-50">
	<Header />

	<main class="max-w-7xl mx-auto">
		<!-- Premium Sellers / Ads Horizontal Scroll (Instagram Story Style) - MOVED TO TOP -->
		<div class="bg-white border-b border-gray-200">
			<div class="px-4 py-4 overflow-x-auto scrollbar-hide">
				<div class="flex space-x-3">
					<!-- Your Story -->
					<div class="relative flex-shrink-0">
						<Avatar size="lg" name="You" />
						<button 
							class="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center"
							aria-label="Add to your shop"
						>
							<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
						</button>
					</div>

					<!-- Premium Sellers -->
					{#each premiumSellers as seller}
						<Avatar 
							size="lg" 
							name={seller.name} 
							src={seller.avatar}
							premium={seller.premium}
							onclick={() => handleSellerClick(seller)}
						/>
					{/each}
				</div>
			</div>
		</div>

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
				
				<!-- Category Pills -->
				<div class="flex gap-2">
					{#each [
						{ name: 'Women', slug: 'women' },
						{ name: 'Men', slug: 'men' },
						{ name: 'Kids', slug: 'kids' },
						{ name: 'Pets', slug: 'pets' }
					] as category}
						<a 
							href="/category/{category.slug}"
							class="flex-1 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-800 hover:border-black hover:bg-gray-50 transition-all text-center"
						>
							{category.name}
						</a>
					{/each}
					<a 
						href="/search"
						class="flex-1 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors text-center"
					>
						View all
					</a>
				</div>
			</div>
		</div>

		<!-- Product Grid -->
		<div class="px-4 sm:px-6 lg:px-8 pb-8">
			
			<!-- Clean Product Grid -->
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
				{#each mockProducts as product}
					<ProductCard 
						{product}
						onclick={() => window.location.href = `/product/${product.id}`}
						onFavorite={handleFavorite}
						favorited={false}
					/>
				{/each}
			</div>

			<!-- Load More - Simple -->
			<div class="text-center mt-8">
				<Button variant="ghost" size="lg" class="text-gray-600 hover:text-gray-900">
					Show more
				</Button>
			</div>
		</div>
	</main>
</div>
