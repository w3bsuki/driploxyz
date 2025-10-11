<script lang="ts">
	import Dialog from '../../primitives/dialog/Dialog.svelte';
	import Button from '../../primitives/button/Button.svelte';
	import ImageUploader from '../../compositions/media/ImageUploader.svelte';
	
	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onSubmit: (data: {
			rating: number;
			title: string;
			comment: string;
			imageUrls: string[];
		}) => Promise<void>;
		orderDetails?: {
			orderId?: string;
			seller?: string;
			buyer?: string;
			product?: string;
			productImage?: string;
		};
		userType: 'buyer' | 'seller';
		loading?: boolean;
	}

	let { isOpen, onClose, onSubmit, orderDetails, userType, loading: externalLoading = false }: Props = $props();
	
	let rating = $state(0);
	let title = $state('');
	let comment = $state('');
	let imageUrls = $state<string[]>([]);
	let loading = $state(false);
	let error = $state('');
	let uploadError = $state('');
	
	const stars = [1, 2, 3, 4, 5];
	
	// Convert isOpen prop to bindable open for Dialog
	let dialogOpen = $state(isOpen);
	
	// Sync isOpen prop changes with dialog state
	$effect(() => {
		dialogOpen = isOpen;
	});
	
	// Handle dialog open/close changes
	function handleOpenChange(open: boolean) {
		if (!open && !loading && !externalLoading) {
			resetForm();
			onClose();
		}
	}
	
	function resetForm() {
		rating = 0;
		title = '';
		comment = '';
		imageUrls = [];
		error = '';
		uploadError = '';
	}
	
	async function handleSubmit() {
		if (rating < 1 || rating > 5) {
			error = 'Please select a rating';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			await onSubmit({
				rating,
				title: title.trim(),
				comment: comment.trim(),
				imageUrls: imageUrls.filter(Boolean)
			});
			resetForm();
			onClose();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to submit review';
		} finally {
			loading = false;
		}
	}
	
	function handleClose() {
		if (!loading && !externalLoading) {
			resetForm();
			onClose();
		}
	}
	
	function handleImageUpload(urls: string[]) {
		imageUrls = urls;
		uploadError = '';
	}
	
	function handleImageUploadError(errorMsg: string) {
		uploadError = errorMsg;
	}
	
	// Computed state for submit button
	const isSubmitting = $derived(loading || externalLoading);
	const canSubmit = $derived(rating >= 1 && rating <= 5 && !isSubmitting);
</script>

<Dialog 
	open={dialogOpen} 
	onOpenChange={handleOpenChange}
>
	{#snippet title()}
		Leave a Review
	{/snippet}
	
	{#snippet children()}
		<div class="space-y-6">
			{#if orderDetails}
				<div class="bg-[color:var(--surface-subtle)] rounded-lg p-4 border border-[color:var(--border-subtle)]">
					<div class="flex items-start gap-3">
						{#if orderDetails.productImage}
							<img 
								src={orderDetails.productImage} 
								alt={orderDetails.product || 'Product'} 
								class="w-12 h-12 rounded-lg object-cover bg-[color:var(--surface-base)]"
							/>
						{/if}
						<div class="min-w-0 flex-1">
							<p class="text-sm font-medium text-[color:var(--text-primary)]">
								{orderDetails.product || 'Product Review'}
							</p>
							<p class="text-xs text-[color:var(--text-muted)] mt-1">
								Seller: <span class="font-medium">{orderDetails.seller || 'Unknown'}</span>
							</p>
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Star Rating -->
			<div>
				<label for="rating-input" class="block text-sm font-medium text-[color:var(--text-primary)] mb-3">
					Rating <span class="text-[color:var(--text-error)]">*</span>
				</label>
				<div class="flex items-center gap-2" role="radiogroup" aria-labelledby="rating-input">
					{#each stars as star}
						<button
							type="button"
							onclick={() => rating = star}
							class="p-2 hover:scale-110 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg {star <= rating ? 'bg-yellow-50' : ''}"
							disabled={isSubmitting}
							aria-label="{star} star{star === 1 ? '' : 's'} rating"
							role="radio"
							aria-checked={rating === star}
						>
							<svg
								class="w-7 h-7 transition-colors {star <= rating ? 'text-yellow-500 fill-current' : 'text-[color:var(--border-default)] hover:text-yellow-300'}"
								fill={star <= rating ? 'currentColor' : 'none'}
								stroke="currentColor"
								viewBox="0 0 24 24"
								stroke-width="1.5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
								/>
							</svg>
						</button>
					{/each}
					{#if rating > 0}
						<span class="ml-3 text-sm text-[color:var(--text-muted)]">
							{rating} star{rating === 1 ? '' : 's'}
						</span>
					{/if}
				</div>
				{#if rating === 0}
					<p class="text-xs text-[color:var(--text-muted)] mt-2">
						Tap a star to rate your experience
					</p>
				{/if}
			</div>
			
			<!-- Review Title -->
			<div>
				<label for="review-title" class="block text-sm font-medium text-[color:var(--text-primary)] mb-2">
					Title (optional)
				</label>
				<input
					id="review-title"
					type="text"
					bind:value={title}
					disabled={isSubmitting}
					maxlength="255"
					placeholder="Summarize your experience"
					class="w-full h-[--touch-standard] px-3 border border-[color:var(--border-default)] rounded-lg focus:ring-2 focus:ring-[color:var(--state-focus)] focus:border-[color:var(--state-focus)] bg-[color:var(--surface-base)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-placeholder)] disabled:opacity-50"
				/>
				<div class="flex justify-between mt-1">
					<span class="text-xs text-[color:var(--text-muted)]">
						Help others understand your experience
					</span>
					<span class="text-xs text-[color:var(--text-muted)]">
						{title?.length || 0}/255
					</span>
				</div>
			</div>
			
			<!-- Review Comment -->
			<div>
				<label for="review-comment" class="block text-sm font-medium text-[color:var(--text-primary)] mb-2">
					Comment (optional)
				</label>
				<textarea
					id="review-comment"
					bind:value={comment}
					disabled={isSubmitting}
					rows="4"
					maxlength="2000"
					placeholder="Share details about your experience, product quality, shipping, communication..."
					class="w-full px-3 py-3 border border-[color:var(--border-default)] rounded-lg focus:ring-2 focus:ring-[color:var(--state-focus)] focus:border-[color:var(--state-focus)] resize-none bg-[color:var(--surface-base)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-placeholder)] disabled:opacity-50"
				></textarea>
				<div class="flex justify-between mt-1">
					<span class="text-xs text-[color:var(--text-muted)]">
						Be specific and honest to help other buyers
					</span>
					<span class="text-xs text-[color:var(--text-muted)]">
						{comment.length}/2000
					</span>
				</div>
			</div>
			
			<!-- Image Upload -->
			<div>
				<div class="block text-sm font-medium text-[color:var(--text-primary)] mb-2">
					Photos (optional)
				</div>
				<ImageUploader
					maxImages={5}
					onImagesChange={handleImageUpload}
					onError={handleImageUploadError}
					disabled={isSubmitting}
										class="w-full"
				/>
				<p class="text-xs text-[color:var(--text-muted)] mt-2">
					Add up to 5 photos to show the product condition or packaging
				</p>
			</div>
			
			<!-- Error Messages -->
			{#if error || uploadError}
				<div class="space-y-2">
					{#if error}
						<div class="p-3 bg-[color:var(--surface-error-subtle)] border border-[color:var(--border-error)] rounded-lg">
							<p class="text-sm text-[color:var(--text-error)]">{error}</p>
						</div>
					{/if}
					{#if uploadError}
						<div class="p-3 bg-[color:var(--surface-warning-subtle)] border border-[color:var(--border-warning)] rounded-lg">
							<p class="text-sm text-[color:var(--text-warning)]">{uploadError}</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/snippet}
	
	{#snippet actions()}
		<div class="flex gap-3">
			<Button
				variant="ghost"
				onclick={handleClose}
				disabled={isSubmitting}
				class="min-h-[--touch-standard] flex-1"
			>
				Cancel
			</Button>
			<Button
				variant="primary"
				onclick={handleSubmit}
				disabled={!canSubmit}
				loading={isSubmitting}
				class="min-h-[--touch-standard] flex-2"
			>
				{isSubmitting ? 'Submitting...' : 'Submit Review'}
			</Button>
		</div>
	{/snippet}
</Dialog>

