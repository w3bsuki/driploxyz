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
		<!-- Close button -->
		<div class="flex justify-end mb-2">
			<button
				onclick={onClose}
				class="p-1 hover:bg-gray-100 rounded-full"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Product image -->
		<div class="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
			<img 
				src={product.images?.[0] || '/placeholder-product.svg'} 
				alt={product.title}
				class="w-full h-full object-cover"
			/>
		</div>

		<!-- Product info -->
		<h3 class="font-semibold text-sm mb-1">{product.title}</h3>
		<p class="text-lg font-bold mb-3">£{product.price.toFixed(2)}</p>

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