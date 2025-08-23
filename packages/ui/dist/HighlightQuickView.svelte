<script lang="ts">
	import type { Product } from './types.js';

	interface Props {
		product: Product;
		onClose: () => void;
		onAddToCart?: (productId: string, selectedSize?: string) => void;
		onToggleFavorite?: (productId: string) => void;
		isFavorited?: boolean;
		isLoadingFavorite?: boolean;
	}

	let { product, onClose, onAddToCart, onToggleFavorite, isFavorited = false, isLoadingFavorite = false }: Props = $props();

	let selectedSize = $state<string>('');
	
	// Auto-select first size if available
	$effect(() => {
		if (product.sizes && product.sizes.length > 0 && !selectedSize) {
			selectedSize = product.sizes[0];
		}
	});
	let showSellerInfo = $state(false);

	const handleBackdropClick = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};
	
	const toggleSellerInfo = (e: MouseEvent) => {
		e.stopPropagation();
		showSellerInfo = !showSellerInfo;
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
		<div class="aspect-square rounded-lg mb-3 relative overflow-hidden bg-gray-100">
			<img 
				src={product.images?.[0] || '/placeholder-product.svg'} 
				alt={product.title}
				class="w-full h-full object-cover"
			/>
			<!-- Close button overlaying image -->
			<button
				onclick={onClose}
				class="absolute top-2 right-2 p-1 bg-white/90 hover:bg-white rounded-full shadow-sm"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			<!-- Seller info in bottom left -->
			{#if product.seller_name}
				<button 
					onclick={toggleSellerInfo}
					class="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all duration-200 {showSellerInfo ? 'px-2.5 py-1.5' : 'pr-2'}"
				>
					<div class="w-7 h-7 rounded-full border-2 border-white bg-gray-200 overflow-hidden flex-shrink-0">
						{#if product.seller_avatar}
							<img src={product.seller_avatar} alt={product.seller_name} class="w-full h-full object-cover" />
						{:else}
							<div class="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 font-semibold">
								{product.seller_name.charAt(0).toUpperCase()}
							</div>
						{/if}
					</div>
					<div class="overflow-hidden transition-all duration-200 {showSellerInfo ? 'max-w-40' : 'max-w-20'}">
						{#if showSellerInfo}
							<div class="text-left">
								<p class="text-xs font-medium text-gray-900">{product.seller_name}</p>
								{#if product.seller_rating}
									<div class="flex items-center gap-0.5">
										<svg class="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
											<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
										</svg>
										<span class="text-xs text-gray-600">{product.seller_rating}</span>
									</div>
								{/if}
							</div>
						{:else}
							<span class="text-xs text-gray-700 font-medium whitespace-nowrap">{product.seller_name}</span>
						{/if}
					</div>
				</button>
			{/if}
		</div>

		<!-- Product info -->
		<h3 class="font-semibold text-sm mb-1">{product.title}</h3>
		<div class="flex items-center justify-between mb-3">
			<p class="text-lg font-bold">£{product.price.toFixed(2)}</p>
			{#if product.favorite_count && product.favorite_count > 0}
				<div class="flex items-center gap-1 text-xs text-gray-500">
					<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
						<path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
					</svg>
					<span>{product.favorite_count}</span>
				</div>
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
				onclick={() => onAddToCart?.(product.id, selectedSize)}
				disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
				class="flex-1 bg-black text-white text-sm py-2.5 px-4 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-900 transition-colors"
			>
				Buy Now
			</button>
			<button 
				onclick={() => onToggleFavorite?.(product.id)}
				disabled={isLoadingFavorite}
				class="p-2 border rounded-lg transition-all duration-200 {isLoadingFavorite ? 'opacity-50' : ''} {isFavorited ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-300 hover:bg-gray-50'}"
			>
				{#if isLoadingFavorite}
					<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				{:else}
					<svg class="w-4 h-4 transition-colors" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
</div>