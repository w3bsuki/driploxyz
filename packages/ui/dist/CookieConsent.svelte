<script lang="ts">
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	
	interface Props {
		privacyUrl?: string;
		showLanguageSwitcher?: boolean;
		onLanguageChange?: (lang: string) => void;
	}
	
	let { 
		privacyUrl = '/privacy/cookies',
		showLanguageSwitcher = false,
		onLanguageChange
	}: Props = $props();
	
	let showBanner = $state(false);
	let preferences = $state({
		necessary: true,
		functional: false,
		analytics: false,
		marketing: false
	});
	
	onMount(() => {
		const consent = localStorage.getItem('cookie-consent');
		if (!consent) {
			showBanner = true;
		} else {
			preferences = JSON.parse(consent);
		}
	});
	
	function acceptAll() {
		const allAccepted = {
			necessary: true,
			functional: true,
			analytics: true,
			marketing: true,
			timestamp: new Date().toISOString()
		};
		localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
		showBanner = false;
		window.dispatchEvent(new CustomEvent('cookieConsent', { detail: allAccepted }));
	}
	
	function acceptNecessary() {
		const onlyNecessary = {
			necessary: true,
			functional: false,
			analytics: false,
			marketing: false,
			timestamp: new Date().toISOString()
		};
		localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary));
		showBanner = false;
		window.dispatchEvent(new CustomEvent('cookieConsent', { detail: onlyNecessary }));
	}
	
	function savePreferences() {
		const saved = {
			...preferences,
			timestamp: new Date().toISOString()
		};
		localStorage.setItem('cookie-consent', JSON.stringify(saved));
		showBanner = false;
		window.dispatchEvent(new CustomEvent('cookieConsent', { detail: saved }));
	}
</script>

{#if showBanner}
	<div class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 md:p-6">
		<div class="max-w-7xl mx-auto">
			<div class="flex flex-col gap-4">
				<div class="flex justify-between items-start">
					<div class="flex-1">
						<h3 class="text-lg font-semibold mb-2">We value your privacy</h3>
						<p class="text-sm text-gray-600">
							We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
							By clicking "Accept All", you consent to our use of cookies.
						</p>
					</div>
				</div>
				
				<details class="text-sm">
					<summary class="cursor-pointer font-medium mb-2">Customize preferences</summary>
					<div class="space-y-2 mt-3">
						<label class="flex items-center gap-2">
							<input type="checkbox" checked disabled class="rounded-sm" />
							<span>Necessary (always enabled)</span>
						</label>
						<label class="flex items-center gap-2">
							<input type="checkbox" bind:checked={preferences.functional} class="rounded-sm" />
							<span>Functional</span>
						</label>
						<label class="flex items-center gap-2">
							<input type="checkbox" bind:checked={preferences.analytics} class="rounded-sm" />
							<span>Analytics</span>
						</label>
						<label class="flex items-center gap-2">
							<input type="checkbox" bind:checked={preferences.marketing} class="rounded-sm" />
							<span>Marketing</span>
						</label>
					</div>
					<button onclick={savePreferences} class="mt-3 text-blue-600 hover:underline">
						Save preferences
					</button>
				</details>
				
				<div class="flex flex-wrap gap-3">
					<Button variant="primary" onclick={acceptAll}>
						Accept All
					</Button>
					<Button variant="secondary" onclick={acceptNecessary}>
						Necessary Only
					</Button>
					<a href={privacyUrl} class="inline-flex items-center text-sm text-gray-500 hover:underline">
						Privacy Policy
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}