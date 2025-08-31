<script lang="ts">
	import Dialog from './primitives/dialog/Dialog.svelte';
	import Button from './Button.svelte';
	
	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onSubmit: (rating: number, title: string, comment: string) => Promise<void>;
		orderDetails?: {
			seller?: string;
			buyer?: string;
			product?: string;
		};
		userType: 'buyer' | 'seller';
	}

	let { isOpen, onClose, onSubmit, orderDetails, userType }: Props = $props();
	
	let rating = $state(5);
	let title = $state('');
	let comment = $state('');
	let loading = $state(false);
	let error = $state('');
	
	const stars = [1, 2, 3, 4, 5];
	
	// Convert isOpen prop to bindable open for Dialog
	let dialogOpen = $state(isOpen);
	
	// Sync isOpen prop changes with dialog state
	$effect(() => {
		dialogOpen = isOpen;
	});
	
	// Handle dialog open/close changes
	function handleOpenChange(open: boolean) {
		if (!open && !loading) {
			// Reset form when closing
			rating = 5;
			title = '';
			comment = '';
			error = '';
			onClose();
		}
	}
	
	async function handleSubmit() {
		if (rating < 1 || rating > 5) {
			error = 'Please select a rating';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			await onSubmit(rating, title, comment);
			// Reset form
			rating = 5;
			title = '';
			comment = '';
			onClose();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to submit review';
		} finally {
			loading = false;
		}
	}
	
	function handleClose() {
		if (!loading) {
			rating = 5;
			title = '';
			comment = '';
			error = '';
			onClose();
		}
	}
</script>

<Dialog 
	open={dialogOpen} 
	onOpenChange={handleOpenChange}
>
	{#snippet title()}
		Leave a Review
	{/snippet}
	
	{#snippet children()}
		<div class="space-y-4">
			{#if orderDetails}
				<div class="bg-gray-50 rounded-lg p-3 text-sm">
					<p class="text-gray-500">
						Reviewing: <span class="font-medium text-gray-900">
							{userType === 'buyer' ? orderDetails.seller : orderDetails.buyer}
						</span>
					</p>
					{#if orderDetails.product}
						<p class="text-gray-500 mt-1">For: {orderDetails.product}</p>
					{/if}
				</div>
			{/if}
			
			<!-- Star Rating -->
			<div>
				<label class="block text-sm font-medium text-gray-900 mb-2">
					Rating
				</label>
				<div class="flex space-x-1">
					{#each stars as star}
						<button
							type="button"
							onclick={() => rating = star}
							class="p-1 hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
							disabled={loading}
						>
							<svg
								class="w-8 h-8 {star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
								/>
							</svg>
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Review Title -->
			<div>
				<label for="review-title" class="block text-sm font-medium text-gray-900 mb-1">
					Title (optional)
				</label>
				<input
					id="review-title"
					type="text"
					bind:value={title}
					disabled={loading}
					placeholder="Summarize your experience"
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
				/>
			</div>
			
			<!-- Review Comment -->
			<div>
				<label for="review-comment" class="block text-sm font-medium text-gray-900 mb-1">
					Comment (optional)
				</label>
				<textarea
					id="review-comment"
					bind:value={comment}
					disabled={loading}
					rows="4"
					placeholder="Share details about your experience..."
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
				/>
			</div>
			
			{#if error}
				<div class="p-3 bg-red-50 border border-red-200 rounded-lg">
					<p class="text-sm text-red-600">{error}</p>
				</div>
			{/if}
		</div>
	{/snippet}
	
	{#snippet actions()}
		<Button
			variant="primary"
			onclick={handleSubmit}
			disabled={loading}
			class="min-h-[44px]"
		>
			{loading ? 'Submitting...' : 'Submit Review'}
		</Button>
	{/snippet}
</Dialog>