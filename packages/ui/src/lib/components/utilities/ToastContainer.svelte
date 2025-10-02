<!--
  Legacy ToastContainer - Backward Compatible
  
  This component maintains backward compatibility while internally using the new
  Melt UI toast system. Existing components can continue using this component
  without any changes.
  
  For new code, consider using the modern ToastProvider:
  import { ToastProvider } from '@repo/ui/primitives'
-->
<script lang="ts">
	// No lifecycle imports needed - using $effect
	import ToastProvider from '../../primitives/toast/ToastProvider.svelte';
	import { setToastProvider } from '../../primitives/toast/store';

	interface Toast {
		id: string;
		message: string;
		type?: 'success' | 'error' | 'info' | 'warning';
		duration?: number;
	}

	let toasts = $state<Toast[]>([]);
	let toastProvider: any;

	// Global toast function that other components can call (legacy support)
	function addToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
		const id = Math.random().toString(36).substring(2, 9);
		
		// Use ONLY the modern toast provider - no local toasts to prevent duplicates
		if (toastProvider?.addToastData) {
			return toastProvider.addToastData({
				id,
				type: type || 'info',
				description: message,
				duration
			});
		}
		
		// Fallback only if no modern provider available
		const toast: Toast = { id, message, type, duration };
		toasts = [...toasts, toast];
		
		setTimeout(() => {
			removeToast(id);
		}, duration);
		
		return id;
	}

	function removeToast(id: string) {
		toasts = toasts.filter(t => t.id !== id);
		
		// Also remove from modern provider if available
		if (toastProvider?.removeToastData) {
			toastProvider.removeToastData(id);
		}
	}

	// Expose the addToast function globally for other components (legacy support)
	$effect(() => {
		// Set up connection to modern toast system
		if (toastProvider) {
			setToastProvider(toastProvider);
		}

		// Only set window.showToast if not already set by modern store
		if (typeof window !== 'undefined' && !(window as any).showToast) {
			(window as any).showToast = addToast;
		}
	});

	function getToastStyles(type?: Toast['type']) {
		switch (type) {
			case 'success':
				return 'bg-green-500 text-white';
			case 'error':
				return 'bg-red-500 text-white';
			case 'warning':
				return 'bg-yellow-500 text-white';
			default:
				return 'bg-gray-800 text-white';
		}
	}
</script>

<!-- Use modern ToastProvider internally -->
<ToastProvider 
	bind:this={toastProvider}
	position="bottom-right"
	limit={5}
	duration={5000}
	class="toast-provider"
/>

<!-- Legacy Toast Container - Only shown for components still subscribing to legacy store -->
{#if toasts.length > 0}
<div class="fixed bottom-0 right-0 z-40 p-4 space-y-2 pointer-events-none">
	{#each toasts as toast (toast.id)}
		<div
			class="max-w-sm p-4 rounded-lg shadow-sm md:shadow-lg transform transition-colors duration-300 ease-out pointer-events-auto {getToastStyles(toast.type)}"
		>
			<div class="flex items-center justify-between">
				<p class="text-sm font-medium">{toast.message}</p>
				<button
					onclick={() => removeToast(toast.id)}
					class="ml-4 text-white/80 hover:text-white focus:outline-none min-h-[36px] min-w-[36px] flex items-center justify-center"
					aria-label="Close notification"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	{/each}
</div>
{/if}