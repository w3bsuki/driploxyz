<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll, goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '@repo/ui';

	// Admin-specific error handling with proper typing
	// eslint-disable-next-line no-undef
	const error = $derived(page.error as App.Error);
	const status = $derived(page.status);

	// Admin error titles with security focus
	const errorTitle = $derived.by(() => {
		if (status === 403) return 'Admin Access Denied';
		if (status === 401) return 'Admin Authentication Required';
		if (status === 404) return 'Admin Resource Not Found';
		if (status === 429) return 'Rate Limited';
		if (status >= 500) return 'Admin System Error';
		return 'Admin Panel Error';
	});

	// Security-focused error messages for admin context
	const errorMessage = $derived.by(() => {
		switch (status) {
			case 401:
				return 'You must be logged in as an administrator to access this section.';
			case 403:
				return 'Your account does not have the required administrator privileges.';
			case 404:
				return 'The requested admin resource was not found or has been moved.';
			case 429:
				return 'Too many requests. Admin accounts have enhanced security limits.';
			case 500:
				return 'An internal error occurred in the admin system. The incident has been logged.';
			case 502:
			case 503:
				return 'Admin services are temporarily unavailable. Please try again shortly.';
			case 504:
				return 'The admin request timed out. Please try again.';
			default:
				return error?.message || 'An unexpected error occurred in the admin panel.';
		}
	});

	let isRetrying = $state(false);

	async function handleRetry() {
		isRetrying = true;
		try {
			await invalidateAll();
		} catch {
			// Retry failed, stay on error page
		} finally {
			isRetrying = false;
		}
	}

	function handleBackToAdmin() {
		goto('/admin');
	}

	function handleBackToApp() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Admin Error {status} | Driplo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-error-container min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-16">
	<div class="max-w-2xl mx-auto text-center">
		<!-- Admin Security Icon -->
		<div class="mx-auto flex items-center justify-center w-24 h-24 mb-8">
			{#if status === 403 || status === 401}
				<svg class="w-full h-full text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
				</svg>
			{:else if status >= 500}
				<svg class="w-full h-full text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
			{:else}
				<svg class="w-full h-full text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{/if}
		</div>

		<!-- Status Code -->
		<div class="text-6xl font-bold text-red-600 mb-4">
			{status}
		</div>

		<!-- Error Title -->
		<h1 class="text-3xl font-bold text-gray-900 mb-4">
			{errorTitle}
		</h1>

		<!-- Error Message -->
		<p class="text-lg text-gray-600 mb-8 leading-relaxed">
			{errorMessage}
		</p>

		<!-- Error Details for Admins -->
		{#if error?.id}
			<div class="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-8">
				<h3 class="font-medium text-gray-900 mb-2">Error Details</h3>
				<div class="text-sm text-gray-600 space-y-1">
					<div class="flex items-center gap-2">
						<span class="font-medium">ID:</span>
						<code class="bg-white px-2 py-1 rounded text-xs font-mono border">{error.id}</code>
						<button
							type="button"
							class="text-blue-600 hover:text-blue-800 text-xs"
							onclick={() => {
								if (browser) {
									navigator.clipboard?.writeText(error.id || '');
								}
							}}
						>
							Copy
						</button>
					</div>
					<div>
						<span class="font-medium">Time:</span> {new Date().toLocaleString()}
					</div>
					<div>
						<span class="font-medium">Path:</span> {page.url.pathname}
					</div>
				</div>
			</div>
		{/if}

		<!-- Action Buttons -->
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			{#if status === 401 || status === 403}
				<Button
					href="/login"
					variant="primary"
					size="lg"
				>
					Sign In to Admin
				</Button>
				<Button
					onclick={handleBackToApp}
					variant="outline"
					size="lg"
				>
					Back to Main App
				</Button>
			{:else if status >= 500}
				<Button
					onclick={handleRetry}
					variant="primary"
					size="lg"
					disabled={isRetrying}
				>
					{#if isRetrying}
						<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Retrying...
					{:else}
						Try Again
					{/if}
				</Button>
				<Button
					onclick={handleBackToAdmin}
					variant="outline"
					size="lg"
				>
					Admin Dashboard
				</Button>
			{:else}
				<Button
					onclick={handleBackToAdmin}
					variant="primary"
					size="lg"
				>
					Admin Dashboard
				</Button>
				<Button
					onclick={handleBackToApp}
					variant="outline"
					size="lg"
				>
					Back to Main App
				</Button>
			{/if}
		</div>

		<!-- Admin Help -->
		<div class="mt-12 pt-8 border-t border-gray-200">
			<p class="text-sm text-gray-500 mb-4">
				Administrator Support
			</p>
			<div class="flex justify-center gap-6 text-sm">
				<a
					href="mailto:admin@driplo.com?subject=Admin Error {status}&body=Error ID: {error?.id || 'N/A'}"
					class="text-blue-600 hover:text-blue-800 font-medium"
				>
					Contact Technical Support
				</a>
				<span class="text-gray-300">•</span>
				<a
					href="/admin/logs"
					class="text-blue-600 hover:text-blue-800 font-medium"
				>
					View System Logs
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.admin-error-container {
		background-image:
			radial-gradient(at 40% 20%, rgba(239, 68, 68, 0.1) 0px, transparent 50%),
			radial-gradient(at 80% 0%, rgba(249, 115, 22, 0.1) 0px, transparent 50%);
	}
</style>