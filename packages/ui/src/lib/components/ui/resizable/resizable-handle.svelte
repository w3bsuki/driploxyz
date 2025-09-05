<script lang="ts">
	import * as ResizablePrimitive from "paneforge";
	import { cn, type WithoutChildrenOrChild } from "../../../utils.js";

	let {
		ref = $bindable(null),
		class: className,
		withHandle = false,
		...restProps
	}: WithoutChildrenOrChild<ResizablePrimitive.PaneResizerProps> & {
		withHandle?: boolean;
	} = $props();
</script>

<ResizablePrimitive.PaneResizer
	bind:ref
	data-slot="resizable-handle"
	class={cn(
		"bg-border focus-visible:ring-ring focus-visible:outline-none relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:-translate-y-1/2 data-[direction=vertical]:after:translate-x-0 [&[data-direction=vertical]>div]:rotate-90",
		className
	)}
	{...restProps}
>
	{#if withHandle}
		<div class="bg-border rounded-xs z-10 flex h-4 w-3 items-center justify-center border">
			<svg class="size-2.5" viewBox="0 0 24 24" fill="currentColor" stroke="none">
				<circle cx="9" cy="5" r="1"/>
				<circle cx="9" cy="12" r="1"/>
				<circle cx="9" cy="19" r="1"/>
				<circle cx="15" cy="5" r="1"/>
				<circle cx="15" cy="12" r="1"/>
				<circle cx="15" cy="19" r="1"/>
			</svg>
		</div>
	{/if}
</ResizablePrimitive.PaneResizer>
