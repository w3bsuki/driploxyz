<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import { cn } from "../../utils/cn.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: SheetPrimitive.DescriptionProps = $props();
</script>

<SheetPrimitive.Description
	bind:ref
	class={cn("text-sm text-zinc-500", className)}
	{...restProps}
>
	{@render children?.()}
</SheetPrimitive.Description>
