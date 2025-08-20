<script lang="ts">
	import { ProductCard } from '@repo/ui';
	import type { PageData } from './$types';

	export let data: PageData;
	
	let { products = [] } = data;
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold mb-2">New Arrivals ✨</h1>
			<p class="text-gray-600">
				Fresh styles just added. Be the first to grab these new listings!
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
						isNew={true}
					/>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16">
				<svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				<h2 class="text-xl font-semibold text-gray-600 mb-2">No new arrivals yet</h2>
				<p class="text-gray-500">Check back soon for the latest additions!</p>
			</div>
		{/if}
	</div>
</div>