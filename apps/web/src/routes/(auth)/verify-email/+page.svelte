<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '@repo/ui';
	
	let resending = $state(false);
	let resendSuccess = $state(false);
	let resendError = $state('');
	
	const email = $derived($page.url.searchParams.get('email') || '');
	
	async function handleResend() {
		if (!email || resending) return;
		
		resending = true;
		resendError = '';
		resendSuccess = false;
		
		try {
			const response = await fetch('/api/auth/resend-verification', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});
			
			const data = await response.json();
			
			if (response.ok) {
				resendSuccess = true;
			} else {
				resendError = data.error || 'Failed to resend verification email';
			}
		} catch (error) {
			resendError = 'An error occurred. Please try again.';
		} finally {
			resending = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<h2 class="mt-6 text-3xl font-extrabold text-gray-900">
				Check your email
			</h2>
			<p class="mt-2 text-sm text-gray-600">
				We've sent a verification link to
			</p>
			{#if email}
				<p class="mt-1 text-sm font-medium text-gray-900">
					{email}
				</p>
			{/if}
		</div>
		
		<div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
			<div class="space-y-6">
				<div class="text-center">
					<svg
						class="mx-auto h-12 w-12 text-green-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
					
					<p class="mt-4 text-sm text-gray-600">
						Click the link in the email to verify your account and get started.
					</p>
					
					<p class="mt-4 text-xs text-gray-500">
						Can't find the email? Check your spam folder.
					</p>
				</div>
				
				{#if resendSuccess}
					<div class="rounded-md bg-green-50 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg
									class="h-5 w-5 text-green-400"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
							<div class="ml-3">
								<p class="text-sm font-medium text-green-800">
									Verification email resent successfully!
								</p>
							</div>
						</div>
					</div>
				{/if}
				
				{#if resendError}
					<div class="rounded-md bg-red-50 p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg
									class="h-5 w-5 text-red-400"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
							<div class="ml-3">
								<p class="text-sm font-medium text-red-800">
									{resendError}
								</p>
							</div>
						</div>
					</div>
				{/if}
				
				<div class="flex flex-col space-y-4">
					{#if email}
						<Button
							variant="secondary"
							onclick={handleResend}
							disabled={resending || !email}
							class="w-full"
						>
							{resending ? 'Resending...' : 'Resend verification email'}
						</Button>
					{/if}
					
					<a
						href="/login"
						class="text-center text-sm text-indigo-600 hover:text-indigo-500"
					>
						Back to login
					</a>
				</div>
			</div>
		</div>
	</div>
</div>