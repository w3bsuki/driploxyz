<script lang="ts">
	import { browser } from '$app/environment';
	import { mode } from "mode-watcher";
	import type { ToasterProps as SonnerProps } from "svelte-sonner";

	let { ...restProps }: SonnerProps = $props();
	
	// Dynamic import to avoid SSR issues
	let SonnerComponent: any = $state(null);
	
	$effect(() => {
		if (browser) {
			import('svelte-sonner').then(({ Toaster }) => {
				SonnerComponent = Toaster;
			});
		}
	});
</script>

{#if browser && SonnerComponent}
	<SonnerComponent
		theme={mode.current}
		class="toaster group"
		style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);"
		{...restProps}
	/>
{/if}
