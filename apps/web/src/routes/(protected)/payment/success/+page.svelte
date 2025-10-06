<script lang="ts">
	import { Button } from '@repo/ui';
	import { Check } from '@lucide/svelte';

	function handleContinue() {
		// Navigate to dashboard or home
		window.location.href = '/dashboard';
	}
</script>

<svelte:head>
	<title>Payment Successful - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-8">
	<div class="max-w-md mx-auto px-4">
		<div class="bg-white rounded-lg shadow-lg p-8 text-center">
			<!-- Success Icon -->
			<div class="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
				<Check class="w-10 h-10 text-green-600" />
			</div>

			<!-- Success Message -->
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Order confirmed</h1>
			<p class="text-gray-600 mb-8">Your payment has been successfully processed.</p>

			<!-- Continue Button -->
			<Button
				onclick={handleContinue}
				variant="primary"
				class="w-full"
			>
				Continue Shopping
			</Button>
		</div>
	</div>
</div>