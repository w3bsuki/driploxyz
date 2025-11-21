<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll, goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '@repo/ui';
	import { parseError } from '$lib/utils/error-handling.svelte.ts';
	import { toast } from '@repo/ui';

	// Typed error from our App.Error interface - Svelte 5 runes
	// eslint-disable-next-line no-undef
	const error = $derived(page.error as App.Error);
	const status = $derived(page.status);

	// Parse error for better categorization
	const errorDetails = $derived.by(() => {
		if (!error) return null;
		return parseError(error, {
			statusCode: status,
			url: page.url.pathname
		});
	});

	// Determine error title and message based on status code - Svelte 5 runes
	const errorTitle = $derived.by(() => {
		if (status === 404) return 'Page not found';
		if (status === 403) return 'Access denied';
		if (status === 401) return 'Authentication required';
		if (status === 429) return 'Too many requests';
		if (status >= 500) return 'Server error';
		return 'Error';
	});

	const errorMessage = $derived.by(() => {
		const details = errorDetails;
		if (details) {
			return details.userMessage;
		}

		switch (status) {
			case 404:
				return "The page you're looking for doesn't exist or has been moved.";
			case 401:
				return "You need to be logged in to access this page.";
			case 403:
				return "You don't have permission to access this resource.";
			case 429:
				return "Too many requests. Please wait a moment before trying again.";
			case 500:
				return "We're experiencing technical difficulties. Our team has been notified.";
			case 502:
			case 503:
				return "Our service is temporarily unavailable. Please try again later.";
			case 504:
				return "The request took too long to process. Please try again.";
			default:
				return error?.message || 'An unexpected error occurred.';
		}
	});

	const suggestions = $derived.by(() => {
		let baseSuggestions: string[] = [];

		if (status === 404) {
			baseSuggestions = [
				'Check the URL for typos',
				'Use the search function to find what you\'re looking for',
				'Browse our categories to discover products'
			];
		} else if (status === 401) {
			baseSuggestions = [
				'Sign in to your account',
				'Check if your session has expired',
				'Create a new account if you don\'t have one'
			];
		} else if (status === 403) {
			baseSuggestions = [
				'Verify you have the necessary permissions',
				'Contact support if you believe this is an error',
				'Try signing out and back in'
			];
		} else if (status >= 500) {
			baseSuggestions = [
				'Refresh the page',
				'Check your internet connection',
				'Try again in a few minutes'
			];
		}

		return baseSuggestions;
	});

	let isRetrying = $state(false);

	async function handleRetry() {
		isRetrying = true;

		try {
			if (status === 401) {
				// For auth errors, go to login
				await goto('/login');
			} else if (status >= 500 || errorDetails?.retryable) {
				// For server errors, try to reload data
				await invalidateAll();
				toast.info('Page refreshed successfully');
			} else {
				// Default retry - reload page
				if (browser) {
					location.reload();
				}
			}
		} catch {
			toast.error('Retry failed. Please try again later.');
		} finally {
			isRetrying = false;
		}
	}

	function handleGoHome() {
		goto('/');
	}

	function handleGoBack() {
		if (browser && window.history.length > 1) {
			window.history.back();
		} else {
			goto('/');
		}
	}

	function handleContactSupport() {
		// Generate support context
	    const supportContext = {
		    errorId: (errorDetails?.code as string | undefined) || undefined,
			statusCode: status,
			timestamp: new Date().toISOString(),
			userAgent: browser ? navigator.userAgent : 'unknown',
			url: page.url.href
		};

		const mailtoLink = `mailto:support@driplo.com?subject=Error Report - ${status}&body=Error Details:%0A${encodeURIComponent(JSON.stringify(supportContext, null, 2))}`;

		if (browser) {
			window.location.href = mailtoLink;
		}
	}
</script>

<svelte:head>
	<title>{status} - {errorTitle} | Driplo</title>
	<meta name="robots" content="noindex, nofollow" />
	<meta name="description" content="{errorMessage}" />
</svelte:head>

<div class="error-container min-h-screen flex items-center justify-center px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8" role="main">
	<div class="max-w-4xl mx-auto">
		<main class="text-center sm:text-left">
			<div class="sm:flex sm:items-start">
				<!-- Status Code with Icon -->
				<div class="flex-shrink-0 flex flex-col items-center sm:items-start">
					<div class="error-icon-wrapper mb-4" aria-hidden="true">
						{#if status === 404}
							<svg class="w-24 h-24 text-[color:var(--text-link)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.008-5.224-2.563M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						{:else if status === 401 || status === 403}
							<svg class="w-24 h-24 text-[color:var(--text-link)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						{:else if status >= 500}
							<svg class="w-24 h-24 text-[color:var(--text-link)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						{:else}
							<svg class="w-24 h-24 text-[color:var(--text-link)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						{/if}
					</div>
					<p class="text-[length:var(--text-4xl)] font-extrabold text-[color:var(--text-link)] sm:text-[length:var(--text-5xl)]" aria-label="Error {status}">
						{status}
					</p>
				</div>

				<div class="mt-6 sm:mt-0 sm:ml-8 flex-1">
					<!-- Error Title -->
					<h1 class="text-[length:var(--text-3xl)] font-extrabold text-[color:var(--text-primary)] tracking-tight sm:text-[length:var(--text-4xl)] lg:text-[length:var(--text-5xl)]">
						{errorTitle}
					</h1>

					<!-- Error Message -->
					<p class="mt-4 text-lg text-[color:var(--text-secondary)] leading-relaxed">
						{errorMessage}
					</p>

					<!-- Error Context -->
					<div class="mt-6 space-y-2">
						{#if errorDetails?.code}
							<p class="text-sm text-[color:var(--text-muted)] flex items-center gap-2">
									<span class="font-medium">Error Code:</span>
									<code class="font-mono bg-[color:var(--surface-muted)] px-2 py-1 rounded text-xs">{errorDetails.code}</code>
								<button
									type="button"
									class="text-[color:var(--text-link)] hover:text-[color:var(--text-link-hover)] text-xs"
									onclick={() => {
										if (browser) {
												navigator.clipboard?.writeText(String(errorDetails?.code ?? ''));
												toast.success('Error code copied to clipboard');
										}
									}}
									aria-label="Copy error ID to clipboard"
								>
									Copy
								</button>
							</p>
						{/if}

						{#if errorDetails?.code}
							<p class="text-sm text-[color:var(--text-muted)]">
								<span class="font-medium">Code:</span> {errorDetails?.code}
							</p>
						{/if}

						<p class="text-sm text-[color:var(--text-muted)]">
							<span class="font-medium">Time:</span> {new Date().toLocaleString()}
						</p>
					</div>

					<!-- Suggestions -->
					{#if suggestions.length > 0}
						<div class="mt-8 p-4 bg-[color:var(--surface-muted)] rounded-lg border border-[color:var(--border-subtle)]">
							<h2 class="text-sm font-medium text-[color:var(--text-primary)] mb-3">Try these suggestions:</h2>
							<ul class="space-y-2 text-sm text-[color:var(--text-secondary)]">
								{#each suggestions as suggestion}
									<li class="flex items-start gap-2">
										<span class="w-1 h-1 bg-[color:var(--text-muted)] rounded-full mt-2 flex-shrink-0" aria-hidden="true"></span>
										{suggestion}
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<!-- Action Buttons -->
					<div class="mt-10 flex flex-col sm:flex-row gap-3">
						{#if status === 404}
							<Button
								onclick={handleGoHome}
								variant="primary"
								size="lg"
								class="w-full sm:w-auto"
							>
								Go to homepage
							</Button>
							<Button
								href="/search"
								variant="outline"
								size="lg"
								class="w-full sm:w-auto"
							>
								Search products
							</Button>
							<Button
								onclick={handleGoBack}
								variant="ghost"
								size="lg"
								class="w-full sm:w-auto"
							>
								Go back
							</Button>
						{:else if status === 401}
							<Button
								href="/login"
								variant="primary"
								size="lg"
								class="w-full sm:w-auto"
							>
								Sign in
							</Button>
							<Button
								onclick={handleGoHome}
								variant="outline"
								size="lg"
								class="w-full sm:w-auto"
							>
								Go to homepage
							</Button>
						{:else if status >= 500 || (errorDetails?.retryable)}
							<Button
								onclick={handleRetry}
								variant="primary"
								size="lg"
								class="w-full sm:w-auto"
								disabled={isRetrying}
							>
								{#if isRetrying}
									<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Retrying...
								{:else}
									Try again
								{/if}
							</Button>
							<Button
								onclick={handleGoHome}
								variant="outline"
								size="lg"
								class="w-full sm:w-auto"
							>
								Go to homepage
							</Button>
							<Button
								onclick={handleContactSupport}
								variant="ghost"
								size="lg"
								class="w-full sm:w-auto"
							>
								Contact support
							</Button>
						{:else}
							<Button
								onclick={handleGoHome}
								variant="primary"
								size="lg"
								class="w-full sm:w-auto"
							>
								Go to homepage
							</Button>
							<Button
								onclick={handleGoBack}
								variant="outline"
								size="lg"
								class="w-full sm:w-auto"
							>
								Go back
							</Button>
						{/if}
					</div>
				</div>
			</div>
		</main>

		<!-- Additional Help -->
		<footer class="mt-16 border-t border-[color:var(--border-subtle)] pt-8">
			<div class="text-center">
				<h2 class="text-lg font-medium text-[color:var(--text-primary)] mb-4">Need more help?</h2>
				<div class="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-[color:var(--text-secondary)]">
					<a
						href="/support"
						class="font-medium text-[color:var(--text-link)] hover:text-[color:var(--text-link-hover)] flex items-center gap-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
						</svg>
						Contact support
					</a>
					<span class="hidden sm:inline text-[color:var(--text-muted)]">•</span>
					<a
						href="/status"
						class="font-medium text-[color:var(--text-link)] hover:text-[color:var(--text-link-hover)] flex items-center gap-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
						System status
					</a>
					{#if status >= 500}
						<span class="hidden sm:inline text-[color:var(--text-muted)]">•</span>
						<button
							type="button"
							onclick={handleContactSupport}
							class="font-medium text-[color:var(--text-link)] hover:text-[color:var(--text-link-hover)] flex items-center gap-2"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
							Report this error
						</button>
					{/if}
				</div>
			</div>
		</footer>
	</div>
</div>

<style>
	.error-container {
		background: linear-gradient(
			135deg,
			rgba(239, 246, 255, 0.3) 0%,
			rgba(255, 255, 255, 0.8) 100%
		);
		backdrop-filter: blur(10px);
	}

	.error-icon-wrapper {
		animation: gentle-float 3s ease-in-out infinite;
	}

	@keyframes gentle-float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	/* Accessibility improvements */
	.error-container :focus {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	/* Reduce motion for users who prefer it */
	@media (prefers-reduced-motion: reduce) {
		.error-icon-wrapper {
			animation: none;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.error-container {
			background: var(--surface-base);
			border: 2px solid var(--border-strong);
		}
	}

	/* Dark mode adjustments */
	@media (prefers-color-scheme: dark) {
		.error-container {
			background: linear-gradient(
				135deg,
				rgba(17, 24, 39, 0.8) 0%,
				rgba(31, 41, 55, 0.9) 100%
			);
		}
	}

	/* Improved mobile layout */
	@media (max-width: 640px) {
		.error-container {
			padding: 1rem;
			min-height: 100vh;
			display: flex;
			align-items: center;
		}
	}

	/* Print styles */
	@media print {
		.error-container {
			background: white;
			color: black;
		}

		.error-icon-wrapper,
		svg {
			display: none;
		}
	}
</style>