<!--
Admin Login Page - Extra secure with multiple verification steps
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let loading = $state(false);
	let email = $state('');
	let password = $state('');
	let twoFactorCode = $state('');
	let showTwoFactor = $state(false);
</script>

<div class="min-h-screen bg-gray-900 flex items-center justify-center">
	<div class="max-w-md w-full space-y-8">
		<!-- Security Notice -->
		<div class="bg-red-900/20 border border-red-800 rounded-lg p-4">
			<div class="flex items-center gap-3">
				<span class="text-2xl">🔒</span>
				<div class="text-red-200">
					<h3 class="font-semibold">Secure Admin Area</h3>
					<p class="text-sm">This area is monitored and logged</p>
				</div>
			</div>
		</div>

		<!-- Login Form -->
		<div class="bg-gray-800 rounded-lg shadow-2xl p-8">
			<div class="text-center mb-8">
				<h2 class="text-3xl font-bold text-white">Admin Login</h2>
				<p class="text-gray-400 mt-2">Driplo Marketplace Administration</p>
			</div>

			{#if form?.error}
				<div class="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
					<p class="text-red-200">{form.error}</p>
				</div>
			{/if}

			{#if form?.expired}
				<div class="bg-orange-900/50 border border-orange-700 rounded-lg p-4 mb-6">
					<p class="text-orange-200">Your session has expired. Please login again.</p>
				</div>
			{/if}

			<form method="POST" use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}>
				{#if !showTwoFactor}
					<!-- Email/Password Step -->
					<div class="space-y-4">
						<div>
							<label for="email" class="block text-sm font-medium text-gray-300">
								Admin Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								bind:value={email}
								required
								autocomplete="email"
								class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="admin@driplo.com"
							/>
						</div>

						<div>
							<label for="password" class="block text-sm font-medium text-gray-300">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								bind:value={password}
								required
								autocomplete="current-password"
								class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="••••••••"
							/>
						</div>
					</div>
				{:else}
					<!-- 2FA Step -->
					<div class="space-y-4">
						<div class="text-center">
							<div class="text-6xl mb-4">🔐</div>
							<h3 class="text-xl font-semibold text-white mb-2">Two-Factor Authentication</h3>
							<p class="text-gray-400 text-sm">Enter the 6-digit code from your authenticator app</p>
						</div>

						<div>
							<input
								name="twoFactorCode"
								type="text"
								bind:value={twoFactorCode}
								required
								maxlength="6"
								pattern="[0-9]{6}"
								autocomplete="one-time-code"
								class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="000000"
							/>
						</div>
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{#if loading}
						<span class="flex items-center gap-2">
							<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Verifying...
						</span>
					{:else if showTwoFactor}
						Verify Code
					{:else}
						Continue to 2FA
					{/if}
				</button>
			</form>
		</div>

		<!-- Security Info -->
		<div class="text-center text-gray-500 text-sm">
			<p>Your IP address: <span class="font-mono text-gray-400">{form?.ip || 'Checking...'}</span></p>
			<p class="mt-2">All login attempts are logged for security</p>
		</div>
	</div>
</div>

