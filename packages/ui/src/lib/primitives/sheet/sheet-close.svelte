<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import { cn } from "../../utils/cn.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: SheetPrimitive.CloseProps = $props();
</script>

<SheetPrimitive.Close bind:ref class={cn(className)} {...restProps}>
	{@render children?.()}
</SheetPrimitive.Close>
