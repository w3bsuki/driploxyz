<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let showBanner = $state(false);
	
	onMount(() => {
		if (!browser) return;
		
		// Check if user already consented
		const hasConsent = localStorage.getItem('cookie-consent');
		if (!hasConsent) {
			showBanner = true;
		}
	});
	
	function acceptCookies() {
		if (!browser) return;
		localStorage.setItem('cookie-consent', 'true');
		showBanner = false;
	}
	
	function rejectCookies() {
		if (!browser) return;
		localStorage.setItem('cookie-consent', 'false');
		showBanner = false;
	}
</script>

{#if showBanner}
	<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 sm:bottom-4 sm:left-4 sm:right-4 sm:rounded-lg sm:max-w-md">
		<div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
			<p class="text-sm text-gray-600 flex-1">
				We use cookies to improve your experience. By continuing, you agree to our use of cookies.
			</p>
			<div class="flex gap-2">
				<button
					onclick={rejectCookies}
					class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
				>
					Reject
				</button>
				<button
					onclick={acceptCookies}
					class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
				>
					Accept
				</button>
			</div>
		</div>
	</div>
{/if}