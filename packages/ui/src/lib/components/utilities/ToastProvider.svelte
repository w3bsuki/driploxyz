<!--
  ToastProvider - Context Provider for Toast System using Flowbite

  This component provides toast context to child components and renders
  the toast container. It should wrap the entire application or layout.
-->
<script lang="ts">
	import { setContext } from 'svelte';

	interface ToastData {
		id: string;
		message: string;
		type?: 'success' | 'error' | 'info' | 'warning';
		duration?: number;
	}

	let toasts = $state<ToastData[]>([]);

	function addToast(message: string, type: ToastData['type'] = 'info', duration = 3000) {
		const id = Math.random().toString(36).substring(2, 9);
		const toast: ToastData = { id, message, type, duration };

		toasts = [...toasts, toast];

		setTimeout(() => {
			removeToast(id);
		}, duration);

		return id;
	}

	function removeToast(id: string) {
		toasts = toasts.filter(t => t.id !== id);
	}

	// Provide toast context to child components
	setContext('toast', {
		addToast,
		removeToast,
		toasts: () => toasts
	});

	// Also expose globally for legacy components
	if (typeof window !== 'undefined') {
		(window as any).showToast = addToast;
	}

	let { children } = $props();
</script>

<!-- Render children -->
{@render children?.()}

<!-- Simple toast container - we'll handle toasts manually for now -->