<script lang="ts">
	import { Button } from '@repo/ui';
</script>

<svelte:head>
	<title>You're offline - Driplo</title>
	<meta name="description" content="You're currently offline. Please check your internet connection." />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full space-y-8 text-center px-4">
		<!-- Offline Icon -->
		<div class="flex justify-center">
			<div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
				<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v6m0 8v6M2 12h6m8 0h6"/>
				</svg>
			</div>
		</div>

		<!-- Title and Message -->
		<div>
			<h1 class="text-2xl font-bold text-gray-900 mb-4">You're offline</h1>
			<p class="text-gray-600 mb-8">
				Please check your internet connection and try again.
			</p>
		</div>

		<!-- Actions -->
		<div class="space-y-4">
			<Button
				variant="primary"
				onclick={() => window.location.reload()}
			>
				Try again
			</Button>

			<Button
				variant="ghost"
				onclick={() => window.history.back()}
			>
				Go back
			</Button>
		</div>

		<!-- Additional Help -->
		<div class="text-sm text-gray-500">
			<p>You can still browse cached pages while offline.</p>
		</div>
	</div>
</div>