<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '@repo/ui';
	import { onMount } from 'svelte';
	
	let email = $state($page.url.searchParams.get('email') || '');
	let resendSuccess = $state(false);
	let resendError = $state('');
	let resending = $state(false);
	
	async function resendVerificationEmail() {
		resending = true;
		resendError = '';
		resendSuccess = false;
		
		try {
			const response = await fetch('/api/auth/resend-verification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email })
			});
			
			const data = await response.json();
			
			if (response.ok) {
				resendSuccess = true;
			} else {
				resendError = data.error || 'Failed to resend verification email';
			}
		} catch (error) {
			resendError = 'Network error. Please try again.';
		} finally {
			resending = false;
		}
	}
</script>

<svelte:head>
	<title>Verify Your Email - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<!-- Email Icon -->
			<div class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-blue-100 mb-4">
				<svg class="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
			</div>
			
			<h2 class="text-3xl font-bold text-gray-900">Check your email</h2>
			<p class="mt-2 text-sm text-gray-600">
				We've sent a verification email to
			</p>
			<p class="font-medium text-gray-900">{email || 'your email address'}</p>
		</div>
		
		<div class="bg-white shadow rounded-lg p-6 space-y-4">
			<div class="space-y-3 text-sm text-gray-600">
				<p>
					<strong>Please check your inbox</strong> and click the verification link to activate your account.
				</p>
				<p>
					The link will expire in 24 hours for security reasons.
				</p>
				<p>
					If you don't see the email, check your spam folder.
				</p>
			</div>
			
			<div class="border-t pt-4">
				{#if resendSuccess}
					<div class="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
						<p class="text-sm text-green-800">
							Verification email resent successfully!
						</p>
					</div>
				{/if}
				
				{#if resendError}
					<div class="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
						<p class="text-sm text-red-800">
							{resendError}
						</p>
					</div>
				{/if}
				
				<div class="flex flex-col gap-3">
					<button
						onclick={resendVerificationEmail}
						disabled={resending || !email}
						class="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{resending ? 'Resending...' : 'Resend verification email'}
					</button>
					
					<div class="text-center">
						<a href="/login" class="text-sm text-gray-500 hover:text-gray-700">
							Back to login
						</a>
					</div>
				</div>
			</div>
		</div>
		
		<div class="text-center text-xs text-gray-500">
			<p>
				Having trouble? Contact us at{' '}
				<a href="mailto:hi@driplo.xyz" class="text-blue-600 hover:underline">
					hi@driplo.xyz
				</a>
			</p>
		</div>
	</div>
</div>