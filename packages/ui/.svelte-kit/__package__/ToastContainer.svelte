<script lang="ts">
	import { onMount } from 'svelte';

	interface Toast {
		id: string;
		message: string;
		type?: 'success' | 'error' | 'info' | 'warning';
		duration?: number;
	}

	let toasts = $state<Toast[]>([]);

	// Global toast function that other components can call
	function addToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
		const id = Math.random().toString(36).substring(2, 9);
		const toast: Toast = { id, message, type, duration };
		toasts = [...toasts, toast];

		// Auto-remove after duration
		setTimeout(() => {
			removeToast(id);
		}, duration);
	}

	function removeToast(id: string) {
		toasts = toasts.filter(t => t.id !== id);
	}

	// Expose the addToast function globally for other components
	onMount(() => {
		if (typeof window !== 'undefined') {
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

<!-- Toast Container -->
<div class="fixed bottom-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
	{#each toasts as toast (toast.id)}
		<div
			class="max-w-sm p-4 rounded-lg shadow-sm md:shadow-lg transform transition-colors duration-300 ease-out pointer-events-auto {getToastStyles(toast.type)}"
		>
			<div class="flex items-center justify-between">
				<p class="text-sm font-medium">{toast.message}</p>
				<button
					onclick={() => removeToast(toast.id)}
					class="ml-4 text-white/80 hover:text-white focus:outline-none"
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