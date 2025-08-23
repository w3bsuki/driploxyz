<script lang="ts">
	/**
	 * LazyImage component
	 * Simple wrapper for native lazy loading with fallback UI
	 * For enhanced image optimization, use enhanced:img directly in apps
	 */
	
	interface Props {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		class?: string;
		loading?: 'lazy' | 'eager';
		srcset?: string;
		sizes?: string;
		fetchpriority?: 'high' | 'low' | 'auto';
		onload?: () => void;
		onerror?: () => void;
	}
	
	let { 
		src, 
		alt, 
		width, 
		height, 
		class: className = '',
		loading = 'lazy',
		srcset,
		sizes,
		fetchpriority = 'auto',
		onload,
		onerror
	}: Props = $props();
	
	let hasError = $state(false);
	let isLoaded = $state(false);
	
	function handleLoad() {
		isLoaded = true;
		hasError = false;
		onload?.();
	}
	
	function handleError() {
		hasError = true;
		isLoaded = false;
		onerror?.();
	}
</script>

{#if hasError}
	<div 
		class={`${className} bg-gray-100 flex items-center justify-center`}
		style:width={width ? `${width}px` : '100%'}
		style:height={height ? `${height}px` : 'auto'}
		aria-label={alt}
	>
		<svg 
			class="w-12 h-12 text-gray-400" 
			fill="none" 
			stroke="currentColor" 
			viewBox="0 0 24 24"
		>
			<path 
				stroke-linecap="round" 
				stroke-linejoin="round" 
				stroke-width="2" 
				d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>
	</div>
{:else}
	<img
		{src}
		{alt}
		{width}
		{height}
		{srcset}
		{sizes}
		{loading}
		{fetchpriority}
		class={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
		onload={handleLoad}
		onerror={handleError}
	/>
{/if}