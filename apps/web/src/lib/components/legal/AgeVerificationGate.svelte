<script lang="ts">
	/**
	 * Age Verification Gate Component
	 * 
	 * Displays a modal asking users to confirm they are 18+ years old.
	 * Required for marketplace platforms that may contain adult-oriented content.
	 * Persists verification in localStorage for 30 days.
	 */
	
	import { ageVerification } from '$lib/stores/age-verification.js';
	import { fade, scale } from 'svelte/transition';
	import { Button } from '@repo/ui';
	import * as i18n from '@repo/i18n';
	
	interface Props {
		/** Whether to show the gate (controlled externally) */
		show?: boolean;
		/** Callback when user verifies their age */
		onVerify?: () => void;
		/** Callback when user declines */
		onDecline?: () => void;
	}
	
	let { show = true, onVerify, onDecline }: Props = $props();
	
	let isVisible = $derived(show && !$ageVerification.isVerified && !$ageVerification.isChecking);
	
	function handleVerify() {
		ageVerification.verify();
		onVerify?.();
	}
	
	function handleDecline() {
		ageVerification.decline();
		onDecline?.();
		// Redirect to a safe page or show a message
		if (typeof window !== 'undefined') {
			window.location.href = 'https://www.google.com';
		}
	}
</script>

{#if isVisible}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000]"
		transition:fade={{ duration: 200 }}
		aria-hidden="true"
	></div>
	
	<!-- Modal -->
	<div 
		class="fixed inset-0 z-[10001] flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="age-verification-title"
		aria-describedby="age-verification-description"
	>
		<div 
			class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Header -->
			<div class="bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-700 p-6 text-center">
				<div class="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
					<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>
				<h2 id="age-verification-title" class="text-xl font-bold text-white">
					{i18n.age_verification_title?.() || 'Age Verification Required'}
				</h2>
			</div>
			
			<!-- Content -->
			<div class="p-6">
				<p id="age-verification-description" class="text-center text-gray-600 dark:text-gray-300 mb-6">
					{i18n.age_verification_description?.() || 'This marketplace may contain items intended for adults. Please confirm that you are at least 18 years of age to continue.'}
				</p>
				
				<div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
					<div class="flex items-start gap-3">
						<svg class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
						</svg>
						<div class="text-sm text-amber-800 dark:text-amber-200">
							<p class="font-medium mb-1">
								{i18n.age_verification_warning_title?.() || 'Important Notice'}
							</p>
							<p class="text-amber-700 dark:text-amber-300">
								{i18n.age_verification_warning?.() || 'By clicking "I am 18 or older", you confirm that you meet the minimum age requirement and agree to our Terms of Service.'}
							</p>
						</div>
					</div>
				</div>
				
				<!-- Actions -->
				<div class="flex flex-col sm:flex-row gap-3">
					<Button 
						variant="primary"
						class="flex-1 py-3 font-semibold"
						onclick={handleVerify}
					>
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						{i18n.age_verification_confirm?.() || 'I am 18 or older'}
					</Button>
					
					<Button 
						variant="outline"
						class="flex-1 py-3"
						onclick={handleDecline}
					>
						{i18n.age_verification_decline?.() || 'Leave Site'}
					</Button>
				</div>
				
				<!-- Legal Links -->
				<div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
					<p class="text-xs text-gray-500 dark:text-gray-400">
						{i18n.age_verification_legal?.() || 'By continuing, you agree to our'}{' '}
						<a href="/terms" class="text-[var(--brand-primary)] hover:underline">
							{i18n.footer_terms?.() || 'Terms of Service'}
						</a>{' '}
						{i18n.auth_and?.() || 'and'}{' '}
						<a href="/privacy" class="text-[var(--brand-primary)] hover:underline">
							{i18n.footer_privacy?.() || 'Privacy Policy'}
						</a>
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Prevent body scroll when modal is open */
	:global(body:has([aria-modal="true"])) {
		overflow: hidden;
	}
</style>
