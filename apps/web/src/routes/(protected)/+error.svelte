<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Button } from '@repo/ui';

	const error = $derived(page.error as App.Error);
	const status = $derived(page.status);

	const errorTitle = $derived.by(() => {
		if (status === 401) return 'Authentication Required';
		if (status === 403) return 'Access Denied';
		if (status === 404) return 'Page Not Found';
		return 'Error';
	});

	const errorMessage = $derived.by(() => {
		switch (status) {
			case 401:
				return 'Your session has expired. Please sign in again to continue.';
			case 403:
				return 'You need to complete your profile setup to access this area.';
			case 404:
				return 'The page you\'re looking for in your account area doesn\'t exist.';
			default:
				return error?.message || 'An error occurred in your account area.';
		}
	});

	async function handleSignIn() {
		await goto('/login');
	}

	async function handleDashboard() {
		await goto('/dashboard');
	}
</script>

<svelte:head>
	<title>{status} - {errorTitle} | Driplo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-[60vh] flex items-center justify-center px-4">
	<div class="max-w-lg mx-auto text-center">
		<div class="mb-8">
			{#if status === 401 || status === 403}
				<svg class="w-16 h-16 mx-auto mb-4 text-[color:var(--text-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
				</svg>
			{:else}
				<svg class="w-16 h-16 mx-auto mb-4 text-[color:var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{/if}
		</div>

		<h1 class="text-2xl font-bold text-[color:var(--text-primary)] mb-4">
			{errorTitle}
		</h1>

		<p class="text-[color:var(--text-secondary)] mb-8">
			{errorMessage}
		</p>

		<div class="flex flex-col sm:flex-row gap-3 justify-center">
			{#if status === 401}
				<Button onclick={handleSignIn} variant="primary">
					Sign In
				</Button>
			{:else if status === 403}
				<Button href="/onboarding" variant="primary">
					Complete Setup
				</Button>
			{:else}
				<Button onclick={handleDashboard} variant="primary">
					Go to Dashboard
				</Button>
			{/if}

			<Button href="/" variant="outline">
				Home
			</Button>
		</div>
	</div>
</div>