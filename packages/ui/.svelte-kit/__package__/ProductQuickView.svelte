<script lang="ts">
	import type { Product } from '../types';
	import { formatCurrency } from './utils/format.js';

	interface Props {
		product: Product;
		isOpen: boolean;
		onClose: () => void;
		onView?: () => void;
		onBuy?: () => void;
		onToggleFavorite?: () => void;
		isFavorite?: boolean;
	}

	let { 
		product, 
		isOpen, 
		onClose, 
		onView,
		onBuy,
		onToggleFavorite,
		isFavorite = false
	}: Props = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('keydown', handleKeydown);
			document.body.style.overflow = 'hidden';
			return () => {
				document.removeEventListener('keydown', handleKeydown);
				document.body.style.overflow = '';
			};
		}
	});
</script>

{#if isOpen && product}
	{@const imageUrl = Array.isArray(product?.images) 
		? (typeof product?.images?.[0] === 'string' ? product?.images?.[0] : product?.images?.[0]?.image_url)
		: '/placeholder-product.svg'}
	<div
		class="fixed inset-0 z-50 overflow-y-auto"
		aria-labelledby="modal-title"
		role="dialog"
		aria-modal="true"
	>
		<div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
			<div
				class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				aria-hidden="true"
				onclick={handleBackdropClick}
			></div>

			<div class="relative inline-block w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all">
				<button
					onclick={onClose}
					class="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-600 backdrop-blur-sm transition-all hover:bg-white hover:text-gray-900 hover:shadow-lg"
					aria-label="Close"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<div class="grid md:grid-cols-2">
					<div class="relative aspect-square overflow-hidden bg-gray-50">
						{#if product?.badge}
							<span class="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
								{product?.badge}
							</span>
						{/if}
						
						{#if product?.discount}
							<span class="absolute right-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
								-{product?.discount}%
							</span>
						{/if}

						<img
							src={imageUrl}
							alt={product?.title || 'Product'}
							class="h-full w-full object-cover"
						/>

						{#if Array.isArray(product?.images) && product?.images?.length > 1}
							<div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
								{#each product?.images?.slice(0, 4) || [] as image, index}
									<div class="h-2 w-2 rounded-full bg-white/60 {index === 0 ? 'bg-white' : ''}"></div>
								{/each}
							</div>
						{/if}
					</div>

					<div class="flex flex-col p-6 md:p-8">
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-2 text-sm text-gray-500">
								<span class="font-medium">{product?.brand || ''}</span>
								{#if product?.condition}
									<span class="text-gray-400">•</span>
									<span>{product?.condition}</span>
								{/if}
							</div>

							<h3 id="modal-title" class="mb-4 text-2xl font-bold text-gray-900">
								{product?.title || ''}
							</h3>

							<div class="mb-6 flex items-baseline gap-3">
								<span class="text-3xl font-bold text-gray-900">
									{formatCurrency(product?.price || 0)}
								</span>
								{#if product?.originalPrice && product?.originalPrice > (product?.price || 0)}
									<span class="text-lg text-gray-400 line-through">
										{formatCurrency(product?.originalPrice || 0)}
									</span>
								{/if}
							</div>

							{#if product?.description}
								<p class="mb-6 text-gray-600 line-clamp-3">
									{product?.description}
								</p>
							{/if}

							<div class="mb-6 space-y-3">
								{#if product?.size}
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium text-gray-500">Size:</span>
										<span class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
											{product?.size}
										</span>
									</div>
								{/if}

								<div class="flex flex-wrap gap-2">
									<div class="flex items-center gap-1.5 text-sm text-gray-600">
										<svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
										</svg>
										<span>Trending Item</span>
									</div>
									<div class="flex items-center gap-1.5 text-sm text-gray-600">
										<svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
										</svg>
										<span>Buyer Protection</span>
									</div>
									<div class="flex items-center gap-1.5 text-sm text-gray-600">
										<svg class="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
										</svg>
										<span>Fast Shipping</span>
									</div>
								</div>
							</div>

							{#if product?.sellerName}
								<div class="flex items-center gap-3 border-t pt-6">
									<div class="flex items-center gap-2">
										{#if product.sellerAvatar}
											<img
												src={product.sellerAvatar}
												alt={product.sellerName || 'Seller'}
												class="h-10 w-10 rounded-full object-cover ring-2 ring-white"
											/>
										{:else}
											<div class="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold ring-2 ring-white">
												{(product.sellerName || 'S').charAt(0).toUpperCase()}
											</div>
										{/if}
										<div>
											<p class="text-sm font-medium text-gray-900">{product.sellerName || 'Seller'}</p>
											{#if product.sellerRating}
												<div class="flex items-center gap-1">
													<span class="text-xs text-yellow-500">★</span>
													<span class="text-xs text-gray-500">{product.sellerRating}</span>
												</div>
											{/if}
										</div>
									</div>
								</div>
							{/if}
						</div>

						<div class="mt-6 flex gap-3">
							<button
								onclick={onBuy}
								class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-gray-800"
							>
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
								</svg>
								Quick Buy
							</button>
							
							<button
								onclick={onView}
								class="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
							>
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
								View Details
							</button>

							<button
								onclick={onToggleFavorite}
								class="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white p-3 text-gray-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
								aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
							>
								<svg class="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}