<script lang="ts">
	import { ProductCard } from '@repo/ui';
	import type { PageData } from './$types';

	export let data: PageData;
	
	let { products = [] } = data;
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold mb-2">Trending Now 📈</h1>
			<p class="text-gray-600">
				Most viewed and favorited items. See what everyone's talking about!
			</p>
		</div>

		{#if products.length > 0}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
				{#each products as product}
					<ProductCard
						id={product.id}
						title={product.title}
						price={product.price}
						imageUrl={product.product_images?.[0]?.image_url || '/placeholder.jpg'}
						sellerName={product.profiles?.username || 'Unknown'}
						sellerAvatar={product.profiles?.avatar_url}
						viewCount={product.view_count}
						favoriteCount={product.favorites?.length || 0}
					/>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16">
				<svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
				</svg>
				<h2 class="text-xl font-semibold text-gray-600 mb-2">No trending items yet</h2>
				<p class="text-gray-500">Start exploring and help create trends!</p>
			</div>
		{/if}
	</div>
</div>