<script lang="ts">
	import Button from '../../primitives/button/Button.svelte';
	import ReviewModal from '../../compositions/modals/ReviewModal.svelte';
	
	interface Order {
		id: string;
		product: {
			id: string;
			title: string;
			image_url?: string;
		};
		seller: {
			id: string;
			username: string;
		};
		delivered_at: string;
		buyer_rated: boolean;
	}
	
	interface Props {
		orders: Order[];
		onReviewSubmit?: (orderId: string) => void;
		class?: string;
	}

	let { orders = [], onReviewSubmit, class: className = '' }: Props = $props();
	
	let selectedOrder = $state<Order | null>(null);
	let showReviewModal = $state(false);
	let submitting = $state(false);
	let error = $state('');
	
	function openReviewModal(order: Order) {
		selectedOrder = order;
		showReviewModal = true;
		error = '';
	}
	
	function closeReviewModal() {
		showReviewModal = false;
		selectedOrder = null;
		error = '';
	}
	
	async function handleReviewSubmit(data: {
		rating: number;
		title: string;
		comment: string;
		imageUrls: string[];
	}) {
		if (!selectedOrder) return;
		
		submitting = true;
		error = '';
		
		try {
			const response = await fetch('/api/reviews', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					order_id: selectedOrder.id,
					rating: data.rating,
					title: data.title || null,
					comment: data.comment || null,
					image_urls: data.imageUrls.length > 0 ? data.imageUrls : null
				})
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to submit review');
			}
			
			// Success - notify parent and close modal
			onReviewSubmit?.(selectedOrder.id);
			closeReviewModal();
			
		} catch (err) {
			
			error = err instanceof Error ? err.message : 'Failed to submit review';
		} finally {
			submitting = false;
		}
	}
	
	// Filter orders that can be reviewed
	const reviewableOrders = $derived(
		orders.filter(order => !order.buyer_rated && order.delivered_at)
	);
	
	// Format delivery date
	function formatDeliveryDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
		
		if (diffInDays === 0) return 'today';
		if (diffInDays === 1) return 'yesterday';
		return `${diffInDays} days ago`;
	}
</script>

{#if reviewableOrders.length > 0}
	<div class="review-prompt {className}">
		<header class="mb-4">
			<h3 class="text-lg font-semibold text-[color:var(--text-primary)]">
				Rate Your Recent Purchases
			</h3>
			<p class="text-sm text-[color:var(--text-muted)] mt-1">
				Help other buyers by sharing your experience
			</p>
		</header>
		
		<div class="space-y-3">
			{#each reviewableOrders.slice(0, 3) as order}
				<div class="flex items-center gap-4 p-3 bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] rounded-lg">
					<!-- Product Image -->
					<div class="flex-shrink-0">
						{#if order.product.image_url}
							<img
								src={order.product.image_url}
								alt={order.product.title}
								class="w-16 h-16 rounded-lg object-cover bg-[color:var(--surface-subtle)]"
							/>
						{:else}
							<div class="w-16 h-16 rounded-lg bg-[color:var(--surface-subtle)] flex items-center justify-center">
								<svg class="w-8 h-8 text-[color:var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
						{/if}
					</div>
					
					<!-- Order Info -->
					<div class="min-w-0 flex-1">
						<h4 class="font-medium text-[color:var(--text-primary)] text-sm truncate">
							{order.product.title}
						</h4>
						<p class="text-xs text-[color:var(--text-muted)] mt-1">
							From {order.seller.username} • Delivered {formatDeliveryDate(order.delivered_at)}
						</p>
					</div>
					
					<!-- Review Button -->
					<Button
						variant="outline"
						size="sm"
						onclick={() => openReviewModal(order)}
						class="flex-shrink-0"
					>
						Review
					</Button>
				</div>
			{/each}
			
			{#if reviewableOrders.length > 3}
				<div class="text-center pt-2">
					<p class="text-sm text-[color:var(--text-muted)]">
						+{reviewableOrders.length - 3} more order{reviewableOrders.length - 3 === 1 ? '' : 's'} ready to review
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Review Modal -->
{#if selectedOrder}
	<ReviewModal
		isOpen={showReviewModal}
		onClose={closeReviewModal}
		onSubmit={handleReviewSubmit}
		loading={submitting}
		orderDetails={{
			orderId: selectedOrder.id,
			seller: selectedOrder.seller.username,
			product: selectedOrder.product.title,
			productImage: selectedOrder.product.image_url
		}}
		_userType="buyer"
	/>
{/if}

<!-- Error Display -->
{#if error}
	<div class="mt-4 p-3 bg-[color:var(--surface-error-subtle)] border border-[color:var(--border-error)] rounded-lg">
		<p class="text-sm text-[color:var(--text-error)]">{error}</p>
	</div>
{/if}

<style>
	.review-prompt {
		background: var(--surface-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}
</style>