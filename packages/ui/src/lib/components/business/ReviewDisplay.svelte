<script lang="ts">
	// Using Svelte images
	
	interface Review {
		id: string;
		rating: number;
		title: string | null;
		comment: string | null;
		image_urls: string[] | null;
		created_at: string;
		reviewer: {
			id: string;
			username: string;
			full_name: string | null;
			avatar_url: string | null;
		};
		product: {
			id: string;
			title: string;
			product_images: Array<{ image_url: string }>;
		} | null;
	}
	
	interface Props {
		review: Review;
		showProduct?: boolean;
		class?: string;
	}

	let { review, showProduct = false, class: className = '' }: Props = $props();
	
	// Format date
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
		
		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;
		if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) === 1 ? '' : 's'} ago`;
		if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) === 1 ? '' : 's'} ago`;
		
		return date.toLocaleDateString();
	}
	
	// Generate star display
	const stars = [1, 2, 3, 4, 5];
</script>

<article class="review-display {className}">
	<!-- Reviewer Info & Rating -->
	<header class="flex items-start gap-3 mb-4">
		<div class="flex-shrink-0">
			{#if review.reviewer.avatar_url}
				<img 
					src={review.reviewer.avatar_url} 
					alt={review.reviewer.username}
					class="w-10 h-10 rounded-full object-cover bg-[color:var(--surface-subtle)]"
				/>
			{:else}
				<div class="w-10 h-10 rounded-full bg-[color:var(--surface-subtle)] flex items-center justify-center">
					<span class="text-sm font-medium text-[color:var(--text-muted)]">
						{review.reviewer.username.charAt(0).toUpperCase()}
					</span>
				</div>
			{/if}
		</div>
		
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2 mb-1">
				<h3 class="font-medium text-[color:var(--text-primary)] text-sm">
					{review.reviewer.full_name || review.reviewer.username}
				</h3>
				<time class="text-xs text-[color:var(--text-muted)]" datetime={review.created_at}>
					{formatDate(review.created_at)}
				</time>
			</div>
			
			<!-- Star Rating -->
			<div class="flex items-center gap-1">
				{#each stars as star}
					<svg
						class="w-4 h-4 {star <= review.rating ? 'text-yellow-500 fill-current' : 'text-[color:var(--border-subtle)]'}"
						fill={star <= review.rating ? 'currentColor' : 'none'}
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
				{/each}
				<span class="text-xs text-[color:var(--text-muted)] ml-1">
					({review.rating}/5)
				</span>
			</div>
		</div>
	</header>
	
	<!-- Review Content -->
	<div class="space-y-3">
		{#if review.title}
			<h4 class="font-medium text-[color:var(--text-primary)] text-sm leading-relaxed">
				{review.title}
			</h4>
		{/if}
		
		{#if review.comment}
			<p class="text-[color:var(--text-primary)] text-sm leading-relaxed whitespace-pre-wrap">
				{review.comment}
			</p>
		{/if}
		
		<!-- Review Images -->
		{#if review.image_urls && review.image_urls.length > 0}
			<div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
				{#each review.image_urls.slice(0, 6) as imageUrl}
					<div class="aspect-square relative rounded-lg overflow-hidden bg-[color:var(--surface-subtle)]">
						<img
							src={imageUrl}
							alt="Review attachment"
							class="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
							loading="lazy"
						/>
					</div>
				{/each}
				{#if review.image_urls.length > 6}
					<div class="aspect-square rounded-lg bg-[color:var(--surface-subtle)] flex items-center justify-center">
						<span class="text-sm font-medium text-[color:var(--text-muted)]">
							+{review.image_urls.length - 6}
						</span>
					</div>
				{/if}
			</div>
		{/if}
		
		<!-- Product Context (if enabled) -->
		{#if showProduct && review.product}
			<div class="flex items-center gap-3 p-3 bg-[color:var(--surface-subtle)] rounded-lg border border-[color:var(--border-subtle)] mt-4">
				{#if review.product.product_images?.[0]}
					<img
						src={review.product.product_images[0].image_url}
						alt={review.product.title}
						class="w-12 h-12 rounded-lg object-cover bg-[color:var(--surface-base)]"
					/>
				{/if}
				<div class="min-w-0 flex-1">
					<p class="text-sm font-medium text-[color:var(--text-primary)] truncate">
						{review.product.title}
					</p>
					<p class="text-xs text-[color:var(--text-muted)]">
						Reviewed product
					</p>
				</div>
			</div>
		{/if}
	</div>
</article>

<style>
	.review-display {
		padding: var(--space-4);
		background: var(--surface-base);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
	}
</style>