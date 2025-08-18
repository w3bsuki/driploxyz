<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Button } from '@repo/ui';
	import * as i18n from '@repo/i18n';
	
	interface Props {
		privacyUrl?: string;
		onLocaleChange?: (locale: string) => void;
		onConsentChange?: (consent: CookieConsent) => void;
	}
	
	interface CookieConsent {
		necessary: boolean;
		functional: boolean;
		analytics: boolean;
		marketing: boolean;
		timestamp: string;
		locale?: string;
		ipCountry?: string;
	}
	
	interface GeoLocation {
		country: string;
		countryCode: string;
		city?: string;
		region?: string;
		timezone?: string;
		suggestedLocale?: string;
	}
	
	let { 
		privacyUrl = '/privacy',
		onLocaleChange,
		onConsentChange
	}: Props = $props();
	
	let showBanner = $state(false);
	let showDetails = $state(false);
	let showLocaleModal = $state(false);
	let detectedLocation = $state<GeoLocation | null>(null);
	let selectedLocale = $state('en');
	let isLoading = $state(true);
	
	let preferences = $state<CookieConsent>({
		necessary: true,
		functional: false,
		analytics: false,
		marketing: false,
		timestamp: '',
		locale: 'en'
	});
	
	// Locale mappings
	const localeMap: Record<string, { code: string; name: string; flag: string }> = {
		'US': { code: 'en', name: 'English', flag: '🇺🇸' },
		'GB': { code: 'en', name: 'English', flag: '🇬🇧' },
		'BG': { code: 'bg', name: 'Български', flag: '🇧🇬' },
		'ES': { code: 'es', name: 'Español', flag: '🇪🇸' },
		'FR': { code: 'fr', name: 'Français', flag: '🇫🇷' },
		'DE': { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
		'IT': { code: 'it', name: 'Italiano', flag: '🇮🇹' },
		'RU': { code: 'ru', name: 'Русский', flag: '🇷🇺' }
	};
	
	const availableLocales = [
		{ code: 'en', name: 'English', flag: '🇺🇸' },
		{ code: 'bg', name: 'Български', flag: '🇧🇬' },
		{ code: 'es', name: 'Español', flag: '🇪🇸' },
		{ code: 'fr', name: 'Français', flag: '🇫🇷' },
		{ code: 'de', name: 'Deutsch', flag: '🇩🇪' },
		{ code: 'it', name: 'Italiano', flag: '🇮🇹' }
	];
	
	onMount(async () => {
		if (!browser) return;
		
		// Check existing consent
		const existingConsent = getCookieConsent();
		
		if (existingConsent) {
			preferences = existingConsent;
			selectedLocale = existingConsent.locale || 'en';
			
			// Check if consent is older than 365 days (GDPR renewal)
			const consentAge = Date.now() - new Date(existingConsent.timestamp).getTime();
			const oneYear = 365 * 24 * 60 * 60 * 1000;
			
			if (consentAge > oneYear) {
				showBanner = true;
				showLocaleModal = true;
			}
		} else {
			// First visit - detect location
			await detectUserLocation();
			showBanner = true;
			// Show locale modal only if we detected a non-English country
			if (detectedLocation && detectedLocation.suggestedLocale !== 'en') {
				showLocaleModal = true;
			}
		}
		
		isLoading = false;
	});
	
	async function detectUserLocation() {
		try {
			// Try multiple IP geolocation services for redundancy
			const services = [
				'https://ipapi.co/json/',
				'https://ip-api.com/json/'
			];
			
			for (const service of services) {
				try {
					const response = await fetch(service);
					const data = await response.json();
					
					detectedLocation = {
						country: data.country_name || data.country,
						countryCode: data.country_code || data.countryCode || data.country,
						city: data.city,
						region: data.region || data.regionName,
						timezone: data.timezone,
						suggestedLocale: localeMap[data.country_code || data.countryCode]?.code || 'en'
					};
					
					if (detectedLocation.suggestedLocale) {
						selectedLocale = detectedLocation.suggestedLocale;
					}
					
					break; // Success, stop trying other services
				} catch (err) {
					console.warn(`Failed to fetch from ${service}:`, err);
				}
			}
		} catch (error) {
			console.error('Failed to detect location:', error);
			// Fallback to browser language
			const browserLang = navigator.language.split('-')[0];
			selectedLocale = availableLocales.find(l => l.code === browserLang)?.code || 'en';
		}
	}
	
	function getCookieConsent(): CookieConsent | null {
		if (!browser) return null;
		
		const consent = localStorage.getItem('cookie-consent-v2');
		if (consent) {
			try {
				return JSON.parse(consent);
			} catch {
				return null;
			}
		}
		return null;
	}
	
	function saveCookieConsent(consent: CookieConsent) {
		if (!browser) return;
		
		const consentWithMeta = {
			...consent,
			timestamp: new Date().toISOString(),
			locale: selectedLocale,
			ipCountry: detectedLocation?.countryCode
		};
		
		localStorage.setItem('cookie-consent-v2', JSON.stringify(consentWithMeta));
		
		// Set actual cookies based on consent
		if (consent.functional) {
			document.cookie = `locale=${selectedLocale}; path=/; max-age=31536000; SameSite=Lax`;
		}
		
		if (consent.analytics) {
			// Enable analytics cookies (GA, etc)
			// @ts-ignore
			window.gtag?.('consent', 'update', {
				'analytics_storage': 'granted'
			});
		}
		
		if (consent.marketing) {
			// Enable marketing cookies
			// @ts-ignore
			window.gtag?.('consent', 'update', {
				'ad_storage': 'granted',
				'ad_user_data': 'granted',
				'ad_personalization': 'granted'
			});
		}
		
		// Dispatch events
		window.dispatchEvent(new CustomEvent('cookieConsent', { detail: consentWithMeta }));
		onConsentChange?.(consentWithMeta);
		
		showBanner = false;
		showLocaleModal = false;
	}
	
	function acceptAll() {
		if (showLocaleModal) {
			onLocaleChange?.(selectedLocale);
			i18n.setLanguageTag(selectedLocale);
		}
		
		saveCookieConsent({
			necessary: true,
			functional: true,
			analytics: true,
			marketing: true,
			timestamp: new Date().toISOString()
		});
	}
	
	function rejectAll() {
		if (showLocaleModal) {
			onLocaleChange?.(selectedLocale);
			i18n.setLanguageTag(selectedLocale);
		}
		
		saveCookieConsent({
			necessary: true,
			functional: false,
			analytics: false,
			marketing: false,
			timestamp: new Date().toISOString()
		});
	}
	
	function acceptSelected() {
		if (showLocaleModal) {
			onLocaleChange?.(selectedLocale);
			i18n.setLanguageTag(selectedLocale);
		}
		
		saveCookieConsent(preferences);
	}
	
	function selectLocale(locale: string) {
		selectedLocale = locale;
		showLocaleModal = false;
		onLocaleChange?.(locale);
		i18n.setLanguageTag(locale);
	}
</script>

{#if showBanner && !isLoading}
	<!-- Locale Detection Modal (shows first if detected) -->
	{#if showLocaleModal && detectedLocation}
		<!-- Modal Backdrop -->
		<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" onclick={() => {}}></div>
		
		<div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md animate-scale-in">
			<div class="bg-white rounded-2xl shadow-2xl p-6">
				<div class="text-center mb-6">
					<div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
						<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h2 class="text-2xl font-bold text-gray-900">
						Welcome to Driplo
					</h2>
					<p class="text-gray-600 mt-2">
						We detected you're visiting from <strong>{detectedLocation.country}</strong>
					</p>
				</div>
				
				<div class="space-y-3">
					<p class="text-sm text-gray-600 text-center">Choose your preferred language:</p>
					
					<div class="grid grid-cols-2 gap-2">
						{#each availableLocales as locale}
							<button
								onclick={() => selectLocale(locale.code)}
								class="flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all hover:shadow-md
									{selectedLocale === locale.code 
										? 'border-blue-500 bg-blue-50' 
										: 'border-gray-200 hover:border-gray-300 bg-white'}"
							>
								<span class="text-2xl">{locale.flag}</span>
								<span class="font-medium text-sm">{locale.name}</span>
								{#if locale.code === detectedLocation.suggestedLocale}
									<span class="ml-auto text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
										Suggested
									</span>
								{/if}
							</button>
						{/each}
					</div>
					
					<button
						onclick={() => { showLocaleModal = false }}
						class="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
					>
						Continue with {availableLocales.find(l => l.code === selectedLocale)?.name || 'English'}
					</button>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Cookie Consent Banner - Professional Bottom Sheet -->
	{#if !showLocaleModal}
		<div class="fixed bottom-0 left-0 right-0 z-[100] animate-slide-up">
			<div class="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
				<div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
					<div class="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-start">
						<!-- Main Content -->
						<div class="flex-1">
							<div class="flex items-start gap-3">
								<div class="hidden sm:block">
									<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
										<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
									</div>
								</div>
								<div class="flex-1">
									<h3 class="text-lg font-semibold text-gray-900 mb-1">Privacy Settings</h3>
									<p class="text-gray-600 text-sm">
										We use cookies to provide you with the best experience. You can manage your preferences below.
										<button onclick={() => showDetails = !showDetails} class="text-blue-600 hover:underline ml-1">
											{showDetails ? 'Hide' : 'Learn more'}
										</button>
									</p>
								</div>
							</div>
							
							<!-- Cookie Categories -->
							{#if showDetails}
								<div class="mt-4 space-y-2">
									<!-- Necessary -->
									<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
										<div class="flex items-center gap-3">
											<input 
												type="checkbox" 
												checked 
												disabled 
												class="w-4 h-4 rounded border-gray-300"
											/>
											<div>
												<div class="font-medium text-sm text-gray-900">Essential</div>
												<p class="text-xs text-gray-500">Required for core site functionality</p>
											</div>
										</div>
										<span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Always active</span>
									</div>
									
									<!-- Functional -->
									<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
										<div class="flex items-center gap-3">
											<input 
												type="checkbox" 
												bind:checked={preferences.functional}
												class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
											/>
											<div>
												<div class="font-medium text-sm text-gray-900">Preferences</div>
												<p class="text-xs text-gray-500">Remember your settings and choices</p>
											</div>
										</div>
									</div>
									
									<!-- Analytics -->
									<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
										<div class="flex items-center gap-3">
											<input 
												type="checkbox" 
												bind:checked={preferences.analytics}
												class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
											/>
											<div>
												<div class="font-medium text-sm text-gray-900">Statistics</div>
												<p class="text-xs text-gray-500">Help us improve with anonymous data</p>
											</div>
										</div>
									</div>
									
									<!-- Marketing -->
									<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
										<div class="flex items-center gap-3">
											<input 
												type="checkbox" 
												bind:checked={preferences.marketing}
												class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
											/>
											<div>
												<div class="font-medium text-sm text-gray-900">Marketing</div>
												<p class="text-xs text-gray-500">Personalized ads and content</p>
											</div>
										</div>
									</div>
								</div>
							{/if}
						</div>
						
						<!-- Actions -->
						<div class="flex flex-row lg:flex-col gap-2 lg:w-auto">
							<button
								onclick={acceptAll}
								class="flex-1 lg:flex-none px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
							>
								Accept all
							</button>
							
							<button
								onclick={rejectAll}
								class="flex-1 lg:flex-none px-5 py-2.5 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
							>
								Reject all
							</button>
							
							{#if showDetails}
								<button
									onclick={acceptSelected}
									class="flex-1 lg:flex-none px-5 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors text-sm whitespace-nowrap"
								>
									Save choices
								</button>
							{/if}
						</div>
					</div>
					
					<!-- Footer Links -->
					<div class="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
						<div class="flex items-center gap-4 text-xs text-gray-500">
							<a href={privacyUrl} class="hover:text-gray-700 hover:underline">Privacy Policy</a>
							<a href="/terms" class="hover:text-gray-700 hover:underline">Terms of Service</a>
							<a href="/cookies" class="hover:text-gray-700 hover:underline">Cookie Policy</a>
						</div>
						<div class="text-xs text-gray-400">
							GDPR Compliant
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	@keyframes slide-up {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	@keyframes scale-in {
		from {
			transform: translate(-50%, -50%) scale(0.9);
			opacity: 0;
		}
		to {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
	}
	
	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
	
	.animate-scale-in {
		animation: scale-in 0.2s ease-out;
	}
</style>