<script lang="ts">
	import { ProductCard } from '@repo/ui';
	import type { PageData } from './$types';

	export let data: PageData;
	
	let { products = [] } = data;
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold mb-2">Hot Deals 🔥</h1>
			<p class="text-gray-600">
				Discover amazing discounts on quality clothing. Limited time offers!
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
						discount={product.discount_percentage}
					/>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16">
				<svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
				</svg>
				<h2 class="text-xl font-semibold text-gray-600 mb-2">No deals available right now</h2>
				<p class="text-gray-500">Check back soon for amazing offers!</p>
			</div>
		{/if}
	</div>
</div>