<script lang="ts">
	interface RatingStats {
		averageRating: number;
		totalReviews: number;
		distribution: Record<number, number>;
	}
	
	interface Props {
		stats: RatingStats;
		class?: string;
		compact?: boolean;
	}

	let { stats, class: className = '', compact = false }: Props = $props();
	
	// Generate star display for average
	const stars = [1, 2, 3, 4, 5];
	
	// Calculate percentages for distribution
	const distributionPercentages = $derived(() => {
		if (stats.totalReviews === 0) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		
		return Object.fromEntries(
			Object.entries(stats.distribution).map(([rating, count]) => [
				rating,
				Math.round((count / stats.totalReviews) * 100)
			])
		);
	});
	
	// Format average rating display
	const formattedRating = $derived(() => {
		if (stats.totalReviews === 0) return '0.0';
		return stats.averageRating.toFixed(1);
	});
</script>

<div class="rating-summary {className}" class:compact>
	{#if compact}
		<!-- Compact Display -->
		<div class="flex items-center gap-2">
			<div class="flex items-center gap-1">
				{#each stars as star}
					<svg
						class="w-4 h-4 {star <= Math.round(stats.averageRating) ? 'text-yellow-500 fill-current' : 'text-[color:var(--border-subtle)]'}"
						fill={star <= Math.round(stats.averageRating) ? 'currentColor' : 'none'}
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
			</div>
			<span class="text-sm font-medium text-[color:var(--text-primary)]">
				{formattedRating}
			</span>
			<span class="text-sm text-[color:var(--text-muted)]">
				({stats.totalReviews} review{stats.totalReviews === 1 ? '' : 's'})
			</span>
		</div>
	{:else}
		<!-- Full Display -->
		<div class="space-y-4">
			<!-- Overall Rating -->
			<div class="flex items-center gap-4">
				<div class="text-center">
					<div class="text-3xl font-bold text-[color:var(--text-primary)]">
						{formattedRating}
					</div>
					<div class="flex items-center justify-center gap-1 mt-1">
						{#each stars as star}
							<svg
								class="w-5 h-5 {star <= Math.round(stats.averageRating) ? 'text-yellow-500 fill-current' : 'text-[color:var(--border-subtle)]'}"
								fill={star <= Math.round(stats.averageRating) ? 'currentColor' : 'none'}
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
					</div>
					<div class="text-sm text-[color:var(--text-muted)] mt-1">
						{stats.totalReviews} review{stats.totalReviews === 1 ? '' : 's'}
					</div>
				</div>
				
				<!-- Rating Distribution -->
				<div class="flex-1 space-y-2">
					{#each [5, 4, 3, 2, 1] as rating}
						<div class="flex items-center gap-2">
							<div class="flex items-center gap-1 w-12">
								<span class="text-sm text-[color:var(--text-primary)] font-medium">
									{rating}
								</span>
								<svg class="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 24 24">
									<path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
								</svg>
							</div>
							
							<!-- Progress bar -->
							<div class="flex-1 h-2 bg-[color:var(--surface-subtle)] rounded-full overflow-hidden">
								<div 
									class="h-full bg-yellow-500 rounded-full transition-all duration-300"
									style="width: {distributionPercentages[rating] || 0}%"
								></div>
							</div>
							
							<div class="w-12 text-right">
								<span class="text-sm text-[color:var(--text-muted)]">
									{distributionPercentages[rating] || 0}%
								</span>
							</div>
							
							<div class="w-8 text-right">
								<span class="text-xs text-[color:var(--text-muted)]">
									({stats.distribution[rating] || 0})
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.rating-summary:not(.compact) {
		padding: var(--space-4);
		background: var(--surface-base);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
	}
</style>