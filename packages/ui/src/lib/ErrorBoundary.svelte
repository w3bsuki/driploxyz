<script lang="ts">
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	
	interface Props {
		children: Snippet;
		fallback?: Snippet<[error: Error, retry: () => void]>;
		onError?: (error: Error, errorInfo: ErrorInfo) => void;
		resetKeys?: unknown[];
		resetOnPropsChange?: boolean;
		isolate?: boolean;
	}
	
	interface ErrorInfo {
		componentStack?: string;
		errorBoundary?: boolean;
		errorBoundaryFound?: boolean;
		[key: string]: unknown;
	}
	
	let {
		children,
		fallback,
		onError,
		resetKeys = [],
		resetOnPropsChange = true,
		isolate = false
	}: Props = $props();
	
	let error = $state<Error | null>(null);
	let errorInfo = $state<ErrorInfo | null>(null);
	let previousResetKeys = $state<unknown[]>([]);
	
	// Reset error when reset keys change
	$effect(() => {
		if (resetOnPropsChange && resetKeys.length > 0) {
			const hasChanged = resetKeys.some((key, index) => key !== previousResetKeys[index]);
			if (hasChanged) {
				error = null;
				errorInfo = null;
				previousResetKeys = [...resetKeys];
			}
		}
	});
	
	// Capture errors in child components
	function captureError(err: Error, info: ErrorInfo) {
		error = err;
		errorInfo = info;
		
		// Log to console in development
		if (browser) {
			console.error('Error Boundary caught:', err, info);
		}
		
		// Call error handler if provided
		if (onError) {
			try {
				onError(err, info);
			} catch (handlerError) {
				console.error('Error in error handler:', handlerError);
			}
		}
	}
	
	// Retry function to reset the error boundary
	function retry() {
		error = null;
		errorInfo = null;
	}
	
	// Setup error handling
	$effect(() => {
		if (!browser) return;
		
		const handleError = (event: ErrorEvent) => {
			// Only capture if we're isolating this boundary
			if (isolate) {
				event.stopPropagation();
				captureError(event.error, {
					errorBoundary: true,
					errorBoundaryFound: true,
					message: event.message,
					filename: event.filename,
					lineno: event.lineno,
					colno: event.colno
				});
			}
		};
		
		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			if (isolate) {
				event.preventDefault();
				captureError(
					new Error(`Unhandled Promise Rejection: ${event.reason}`),
					{
						errorBoundary: true,
						errorBoundaryFound: true,
						reason: event.reason,
						promise: event.promise
					}
				);
			}
		};
		
		if (isolate) {
			window.addEventListener('error', handleError);
			window.addEventListener('unhandledrejection', handleUnhandledRejection);
			
			return () => {
				window.removeEventListener('error', handleError);
				window.removeEventListener('unhandledrejection', handleUnhandledRejection);
			};
		}
	});
	
	// Default fallback UI
	const defaultFallback: Snippet<[Error, () => void]> = (error, retry) => {
		return {
			render: () => `
				<div class="error-boundary-fallback">
					<div class="error-content">
						<svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="12" y1="8" x2="12" y2="12"></line>
							<line x1="12" y1="16" x2="12.01" y2="16"></line>
						</svg>
						<h2 class="error-title">Something went wrong</h2>
						<p class="error-message">${error.message || 'An unexpected error occurred'}</p>
						<div class="error-actions">
							<button onclick="${retry}" class="retry-button">
								Try again
							</button>
						</div>
					</div>
				</div>
			`
		};
	};
</script>

{#if error}
	<div class="error-boundary" data-testid="error-boundary">
		{#if fallback}
			{@render fallback(error, retry)}
		{:else}
			<div class="error-boundary-fallback">
				<div class="error-content">
					<svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="8" x2="12" y2="12"></line>
						<line x1="12" y1="16" x2="12.01" y2="16"></line>
					</svg>
					<h2 class="error-title">Something went wrong</h2>
					<p class="error-message">{error.message || 'An unexpected error occurred'}</p>
					{#if browser && window.location.hostname === 'localhost' && errorInfo}
						<details class="error-details">
							<summary>Error details</summary>
							<pre class="error-stack">{JSON.stringify(errorInfo, null, 2)}</pre>
							{#if error.stack}
								<pre class="error-stack">{error.stack}</pre>
							{/if}
						</details>
					{/if}
					<div class="error-actions">
						<button onclick={retry} class="retry-button">
							Try again
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.error-boundary {
		min-height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}
	
	.error-boundary-fallback {
		width: 100%;
		max-width: 500px;
		margin: 0 auto;
		text-align: center;
	}
	
	.error-content {
		background: var(--surface-base);
		border-radius: 0.75rem;
		padding: 2rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
		border: 1px solid var(--border-subtle);
	}
	
	.error-icon {
		width: 3rem;
		height: 3rem;
		color: var(--status-error-text);
		margin: 0 auto 1rem;
	}
	
	.error-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}
	
	.error-message {
		color: var(--text-secondary);
		margin-bottom: 1.5rem;
		line-height: 1.5;
	}
	
	.error-details {
		margin: 1rem 0;
		text-align: left;
		padding: 1rem;
		background: var(--surface-muted);
		border-radius: 0.5rem;
		border: 1px solid var(--border-subtle);
	}
	
	.error-details summary {
		cursor: pointer;
		font-weight: 500;
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
	}
	
	.error-stack {
		font-family: monospace;
		font-size: 0.75rem;
		color: var(--text-muted);
		white-space: pre-wrap;
		word-break: break-all;
		overflow-x: auto;
		margin-top: 0.5rem;
	}
	
	.error-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}
	
	.retry-button {
		padding: 0.625rem 1.25rem;
		background: var(--primary);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	.retry-button:hover {
		background: var(--primary-600);
	}
	
	.retry-button:active {
		transform: scale(0.98);
	}
</style>