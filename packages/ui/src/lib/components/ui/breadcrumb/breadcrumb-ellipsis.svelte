<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef, type WithoutChildren } from "../../../utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLSpanElement>>> = $props();
</script>

<span
	bind:this={ref}
	data-slot="breadcrumb-ellipsis"
	role="presentation"
	aria-hidden="true"
	class={cn("flex size-9 items-center justify-center", className)}
	{...restProps}
>
	<svg class="size-4" viewBox="0 0 24 24" fill="currentColor" stroke="none">
		<circle cx="5" cy="12" r="2"/>
		<circle cx="12" cy="12" r="2"/>
		<circle cx="19" cy="12" r="2"/>
	</svg>
	<span class="sr-only">More</span>
</span>
