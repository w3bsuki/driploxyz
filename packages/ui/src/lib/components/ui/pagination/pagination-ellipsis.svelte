<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from "../../../utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLSpanElement>>> = $props();
</script>

<span
	bind:this={ref}
	aria-hidden="true"
	data-slot="pagination-ellipsis"
	class={cn("flex size-9 items-center justify-center", className)}
	{...restProps}
>
	<svg class="size-4" viewBox="0 0 24 24" fill="currentColor" stroke="none">
		<circle cx="5" cy="12" r="2"/>
		<circle cx="12" cy="12" r="2"/>
		<circle cx="19" cy="12" r="2"/>
	</svg>
	<span class="sr-only">More pages</span>
</span>
