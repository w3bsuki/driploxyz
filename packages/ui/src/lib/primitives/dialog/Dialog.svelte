<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		title?: Snippet;
		description?: Snippet;
		children?: Snippet;
		actions?: Snippet;
		class?: string;
		showCloseButton?: boolean;
		preventScroll?: boolean;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		title,
		description,
		children,
		actions,
		class: className = '',
		showCloseButton = true,
		preventScroll = true
	}: Props = $props();

	let dialogElement: HTMLDialogElement = $state()!;
	let previousOverflow = '';

	// Handle scroll prevention
	$effect(() => {
		if (preventScroll) {
			if (open) {
				previousOverflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = previousOverflow;
			}
		}

		return () => {
			if (preventScroll && previousOverflow) {
				document.body.style.overflow = previousOverflow;
			}
		};
	});

	// Handle open/close state
	$effect(() => {
		if (open && dialogElement) {
			dialogElement.showModal();
		} else if (!open && dialogElement) {
			dialogElement.close();
		}
	});

	function handleCancel() {
		open = false;
		onOpenChange?.(false);
	}

	function handleClickOutside(e: MouseEvent) {
		if (e.target === dialogElement) {
			handleCancel();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleCancel();
		}
	}
</script>

<dialog
	bind:this={dialogElement}
	class="fixed inset-0 z-50 bg-[var(--modal-overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 {className}"
	oncancel={handleCancel}
	onclick={handleClickOutside}
	onkeydown={handleKeydown}
>
	<div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
		<div class="p-6">
			<div class="flex items-start justify-between mb-4">
				<div class="flex-1">
					{#if title}
						<div class="text-lg font-semibold text-gray-900">
							{@render title()}
						</div>
					{/if}
					{#if description}
						<div class="text-sm text-gray-600 mt-1">
							{@render description()}
						</div>
					{/if}
				</div>
				{#if showCloseButton}
					<button
						type="button"
						class="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
						onclick={handleCancel}
						aria-label="Close dialog"
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 6L6 18M6 6l12 12"/>
						</svg>
					</button>
				{/if}
			</div>

			{#if children}
				<div class="mb-6">
					{@render children()}
				</div>
			{/if}

			{#if actions}
				<div class="flex justify-end space-x-3">
					{@render actions()}
				</div>
			{/if}
		</div>
	</div>
</dialog>