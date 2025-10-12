<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Button } from '@repo/ui';
	import type { App } from '@sveltejs/kit';

	const error = $derived(page.error as App.Error);
	const status = $derived(page.status);

	const errorTitle = $derived.by(() => {
		if (status === 429) return 'Too Many Attempts';
		if (status === 400) return 'Authentication Failed';
		if (status === 500) return 'Service Unavailable';
		return 'Authentication Error';
	});

	const errorMessage = $derived.by(() => {
		switch (status) {
			case 429:
				return 'Too many authentication attempts. Please wait a moment and try again.';
			case 400:
				return 'Invalid credentials or authentication data. Please check your information.';
			case 500:
				return 'Our authentication service is temporarily unavailable. Please try again later.';
			default:
				return error?.message || 'An error occurred during authentication.';
		}
	});

	async function handleRetryAuth() {
		// Clear any cached auth state and try again
		await goto('/login');
	}
</script>

<svelte:head>
	<title>{status} - {errorTitle} | Driplo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
	<div class="max-w-md w-full">
		<div class="bg-white rounded-lg shadow-lg p-8 text-center">
			<div class="mb-6">
				{#if status === 429}
					<svg class="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				{:else if status >= 500}
					<svg class="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else}
					<svg class="w-16 h-16 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
					</svg>
				{/if}
			</div>

			<h1 class="text-2xl font-bold text-gray-900 mb-4">
				{errorTitle}
			</h1>

			<p class="text-gray-600 mb-8">
				{errorMessage}
			</p>

			<div class="space-y-3">
				{#if status === 429}
					<p class="text-sm text-gray-500 mb-4">
						Please wait 60 seconds before trying again
					</p>
				{/if}

				<Button onclick={handleRetryAuth} variant="primary" class="w-full">
					{status === 429 ? 'Try Again Later' : 'Try Again'}
				</Button>

				<Button href="/" variant="outline" class="w-full">
					Back to Home
				</Button>
			</div>
		</div>
	</div>
</div>