<script lang="ts">
	import { onMount } from 'svelte';
	
	interface Props {
		show: boolean;
		title: string;
		message: string;
		type: 'sale' | 'purchase';
		onView?: () => void;
		onDismiss?: () => void;
	}

	let { 
		show = false, 
		title, 
		message,
		type,
		onView,
		onDismiss 
	}: Props = $props();

	let visible = $state(false);

	$effect(() => {
		if (show) {
			visible = true;
			// Auto-hide after 5 seconds
			const timer = setTimeout(() => {
				visible = false;
				setTimeout(() => onDismiss?.(), 300);
			}, 5000);
			
			return () => clearTimeout(timer);
		}
	});

	function handleView() {
		visible = false;
		onView?.();
	}

	function handleDismiss() {
		visible = false;
		onDismiss?.();
	}
</script>

{#if show}
	<div 
		class="fixed bottom-4 right-4 z-50 transition-transform transition-opacity duration-300 {visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}"
	>
		<div class="flex max-w-md items-start gap-3 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5">
			<div class="flex-shrink-0">
				{#if type === 'sale'}
					<svg class="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else}
					<svg class="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
					</svg>
				{/if}
			</div>
			
			<div class="flex-1">
				<p class="text-sm font-semibold text-gray-900">{title}</p>
				<p class="mt-1 text-sm text-gray-600">{message}</p>
				
				<div class="mt-3 flex gap-2">
					<button
						onclick={handleView}
						class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
					>
						View {type === 'sale' ? 'Sale' : 'Purchase'}
					</button>
					<button
						onclick={handleDismiss}
						class="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
					>
						Dismiss
					</button>
				</div>
			</div>
			
			<button
				onclick={handleDismiss}
				class="flex-shrink-0 text-gray-400 hover:text-gray-500"
			>
				<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			</button>
		</div>
	</div>
{/if}