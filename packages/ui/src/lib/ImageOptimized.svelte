<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		class?: string;
		sizes?: string;
		width?: number;
		height?: number;
		loading?: 'eager' | 'lazy';
	}

	let {
		src,
		alt,
		class: className = '',
		sizes = '100vw',
		width,
		height,
		loading = 'lazy'
	}: Props = $props();
</script>

<img
	{src}
	{alt}
	{sizes}
	{width}
	{height}
	{loading}
	class={className}
/>