<script lang="ts">
	import type { Product } from './types.js';

	interface Props {
		product: Product;
		onClose: () => void;
		onAddToCart?: () => void;
		onToggleFavorite?: () => void;
	}

	let { product, onClose, onAddToCart, onToggleFavorite }: Props = $props();

	let selectedSize = $state<string>('');

	const handleBackdropClick = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};
</script>

<div
	class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
	onclick={handleBackdropClick}
	role="button"
	tabindex="-1"
>
	<!-- ACTUALLY COMPACT MODAL -->
	<div class="bg-white rounded-xl w-full max-w-[280px] p-3 shadow-xl">
		<!-- Product image with close button -->
		<div class="aspect-square bg-gray-100 rounded-lg mb-3 relative">
			<div class="w-full h-full rounded-lg overflow-hidden">
				<img 
					src={product.images?.[0] || '/placeholder-product.svg'} 
					alt={product.title}
					class="w-full h-full object-cover"
				/>
			</div>
			<!-- Close button overlaying image -->
			<button
				onclick={onClose}
				class="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white rounded-full shadow-sm z-10"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			<!-- Seller avatar in bottom left -->
			{#if product.seller_name}
				<div class="absolute bottom-2 left-2 w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm z-10">
					{#if product.seller_avatar}
						<img src={product.seller_avatar} alt={product.seller_name} class="w-full h-full object-cover" />
					{:else}
						<div class="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 font-semibold">
							{product.seller_name.charAt(0).toUpperCase()}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Product info -->
		<h3 class="font-semibold text-sm mb-1">{product.title}</h3>
		<div class="flex items-center justify-between mb-3">
			<p class="text-lg font-bold">£{product.price.toFixed(2)}</p>
			{#if product.seller_name}
				<p class="text-xs text-gray-500">by {product.seller_name}</p>
			{/if}
		</div>

		<!-- Sizes if available -->
		{#if product.sizes && product.sizes.length > 0}
			<div class="mb-3">
				<p class="text-xs text-gray-600 mb-1.5">Size</p>
				<div class="flex gap-1 flex-wrap">
					{#each product.sizes as size}
						<button
							onclick={() => selectedSize = size}
							class="px-2 py-1 text-xs border rounded {selectedSize === size ? 'bg-black text-white border-black' : 'border-gray-300'}"
						>
							{size}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Actions -->
		<div class="flex gap-2">
			<button 
				onclick={onAddToCart}
				disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
				class="flex-1 bg-black text-white text-sm py-2 px-3 rounded-lg font-medium disabled:opacity-50"
			>
				Add to Bag
			</button>
			<button 
				onclick={onToggleFavorite}
				class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
				</svg>
			</button>
		</div>
	</div>
</div>