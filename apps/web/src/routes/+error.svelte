<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '@repo/ui';
	
	// Typed error from our App.Error interface - Svelte 5 runes
	const error = $derived($page.error as App.Error);
	const status = $derived($page.status);
	
	// Determine error title and message based on status code - Svelte 5 runes
	const errorTitle = $derived(status === 404 
		? 'Page not found' 
		: status >= 500 
			? 'Something went wrong' 
			: 'Error');
	
	const errorMessage = $derived(status === 404
		? "The page you're looking for doesn't exist."
		: status >= 500
			? "We're sorry, but something unexpected happened."
			: error?.message || 'An error occurred');
	
	function handleRetry() {
		location.reload();
	}
</script>

<svelte:head>
	<title>{status} - {errorTitle} | Driplo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="error-container min-h-screen flex items-center justify-center px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
	<div class="max-w-max mx-auto">
		<main class="sm:flex">
			<!-- Status Code -->
			<p class="text-[length:var(--text-4xl)] font-extrabold text-[color:var(--text-link)] sm:text-[length:var(--text-5xl)]">{status}</p>
			
			<div class="sm:ml-6">
				<div class="sm:border-l sm:border-gray-200 sm:pl-6">
					<!-- Error Title -->
					<h1 class="text-[length:var(--text-4xl)] font-extrabold text-[color:var(--text-primary)] tracking-tight sm:text-[length:var(--text-5xl)]">
						{errorTitle}
					</h1>
					
					<!-- Error Message -->
					<p class="mt-1 text-base text-[color:var(--text-secondary)]">
						{errorMessage}
					</p>
					
					<!-- Error ID (for support) -->
					{#if error?.id}
						<p class="mt-2 text-sm text-[color:var(--text-muted)]">
							Error ID: <code class="font-mono">{error.id}</code>
						</p>
					{/if}
				</div>
				
				<!-- Action Buttons -->
				<div class="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
					{#if status === 404}
						<Button
							href="/"
							variant="primary"
							size="lg"
						>
							Go back home
						</Button>
						<Button
							href="/search"
							variant="outline"
							size="lg"
						>
							Browse products
						</Button>
					{:else if status >= 500}
						<Button
							onclick={handleRetry}
							variant="primary"
							size="lg"
						>
							Try again
						</Button>
						<Button
							href="/"
							variant="outline"
							size="lg"
						>
							Go back home
						</Button>
					{:else}
						<Button
							href="/"
							variant="primary"
							size="lg"
						>
							Go back home
						</Button>
					{/if}
				</div>
			</div>
		</main>
		
		<!-- Additional Help -->
		<div class="mt-16 text-center">
			<p class="text-sm text-[color:var(--text-secondary)]">
				{#if status === 404}
					If you think this is a mistake, please 
					<a href="/support" class="font-medium text-[color:var(--text-link)] hover:text-[color:var(--text-link-hover)]">
						contact support
					</a>.
				{:else if status >= 500}
					Our team has been notified. If the problem persists, please 
					<a href="/support" class="font-medium text-[color:var(--text-link)] hover:text-[color:var(--text-link-hover)]">
						contact support
					</a>.
				{:else}
					Need help? 
					<a href="/support" class="font-medium text-[color:var(--text-link)] hover:text-[color:var(--text-link-hover)]">
						Contact support
					</a>.
				{/if}
			</p>
		</div>
	</div>
</div>

<style>
	.error-container {
		background: linear-gradient(
			135deg,
			rgba(239, 246, 255, 0.5) 0%,
			rgba(255, 255, 255, 0.9) 100%
		);
	}
	
	code {
		background-color: #f3f4f6;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}
</style>