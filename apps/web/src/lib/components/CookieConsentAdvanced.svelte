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
		privacyUrl = '/privacy/cookies',
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
		'RU': { code: 'ru', name: 'Русский', flag: '🇷🇺' },
		'CN': { code: 'zh', name: '中文', flag: '🇨🇳' },
		'JP': { code: 'ja', name: '日本語', flag: '🇯🇵' }
	};
	
	const availableLocales = [
		{ code: 'en', name: 'English', flag: '🇺🇸' },
		{ code: 'bg', name: 'Български', flag: '🇧🇬' },
		{ code: 'es', name: 'Español', flag: '🇪🇸' },
		{ code: 'fr', name: 'Français', flag: '🇫🇷' },
		{ code: 'de', name: 'Deutsch', flag: '🇩🇪' }
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
			showLocaleModal = true;
		}
		
		isLoading = false;
	});
	
	async function detectUserLocation() {
		try {
			// Try multiple IP geolocation services for redundancy
			const services = [
				'https://ipapi.co/json/',
				'https://ip-api.com/json/',
				'https://ipinfo.io/json'
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
	
	function acceptNecessary() {
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
	<!-- Glass morphism backdrop -->
	<div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" onclick={() => {}}>
		
		<!-- Locale Detection Modal (shows first if detected) -->
		{#if showLocaleModal && detectedLocation}
			<div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md">
				<div class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
					<div class="text-center mb-6">
						<div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-black to-gray-700 rounded-full mb-4">
							<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h2 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
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
									class="flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all hover:scale-105
										{selectedLocale === locale.code 
											? 'border-black bg-black/5' 
											: 'border-gray-200 hover:border-gray-300 bg-white'}"
								>
									<span class="text-2xl">{locale.flag}</span>
									<span class="font-medium">{locale.name}</span>
									{#if locale.code === detectedLocation.suggestedLocale}
										<span class="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
											Suggested
										</span>
									{/if}
								</button>
							{/each}
						</div>
						
						<button
							onclick={() => { showLocaleModal = false }}
							class="w-full mt-4 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
						>
							Continue with {availableLocales.find(l => l.code === selectedLocale)?.name || 'English'}
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Cookie Consent Banner with Glass Morphism -->
			<div class="fixed bottom-0 left-0 right-0 z-[101]">
				<div class="bg-white/90 backdrop-blur-2xl border-t border-white/20 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
					<div class="max-w-7xl mx-auto p-6">
						<div class="flex flex-col lg:flex-row gap-6">
							<!-- Main Content -->
							<div class="flex-1">
								<div class="flex items-start gap-4">
									<div class="hidden sm:block">
										<div class="w-12 h-12 bg-gradient-to-br from-black to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
											<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
										</div>
									</div>
									<div class="flex-1">
										<h3 class="text-xl font-bold mb-2">We value your privacy 🔒</h3>
										<p class="text-gray-600 text-sm leading-relaxed">
											We use cookies and similar technologies to help personalize content, tailor and measure ads, 
											and provide a better experience. By clicking accept, you agree to this, as outlined in our 
											<a href={privacyUrl} class="text-black font-semibold hover:underline">Cookie Policy</a>.
										</p>
									</div>
								</div>
								
								<!-- Cookie Categories -->
								{#if showDetails}
									<div class="mt-6 space-y-4">
										<!-- Necessary -->
										<div class="bg-white/70 backdrop-blur rounded-xl p-4 border border-gray-200/50">
											<label class="flex items-start gap-3">
												<input 
													type="checkbox" 
													checked 
													disabled 
													class="mt-1 w-5 h-5 rounded border-gray-300"
												/>
												<div class="flex-1">
													<div class="font-semibold text-gray-900">Essential Cookies</div>
													<p class="text-sm text-gray-600 mt-1">
														Required for the website to function. Cannot be disabled.
													</p>
												</div>
												<span class="text-xs bg-black/10 text-black px-2 py-1 rounded-full">
													Always On
												</span>
											</label>
										</div>
										
										<!-- Functional -->
										<div class="bg-white/70 backdrop-blur rounded-xl p-4 border border-gray-200/50">
											<label class="flex items-start gap-3">
												<input 
													type="checkbox" 
													bind:checked={preferences.functional}
													class="mt-1 w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
												/>
												<div class="flex-1">
													<div class="font-semibold text-gray-900">Functional Cookies</div>
													<p class="text-sm text-gray-600 mt-1">
														Enable enhanced functionality like language preferences and saved items.
													</p>
												</div>
											</label>
										</div>
										
										<!-- Analytics -->
										<div class="bg-white/70 backdrop-blur rounded-xl p-4 border border-gray-200/50">
											<label class="flex items-start gap-3">
												<input 
													type="checkbox" 
													bind:checked={preferences.analytics}
													class="mt-1 w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
												/>
												<div class="flex-1">
													<div class="font-semibold text-gray-900">Analytics Cookies</div>
													<p class="text-sm text-gray-600 mt-1">
														Help us understand how visitors interact with our website.
													</p>
												</div>
											</label>
										</div>
										
										<!-- Marketing -->
										<div class="bg-white/70 backdrop-blur rounded-xl p-4 border border-gray-200/50">
											<label class="flex items-start gap-3">
												<input 
													type="checkbox" 
													bind:checked={preferences.marketing}
													class="mt-1 w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
												/>
												<div class="flex-1">
													<div class="font-semibold text-gray-900">Marketing Cookies</div>
													<p class="text-sm text-gray-600 mt-1">
														Used to deliver personalized advertisements and measure campaigns.
													</p>
												</div>
											</label>
										</div>
									</div>
								{/if}
							</div>
							
							<!-- Actions -->
							<div class="flex flex-col gap-3 lg:w-64">
								<button
									onclick={acceptAll}
									class="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-lg"
								>
									Accept All
								</button>
								
								<button
									onclick={acceptNecessary}
									class="px-6 py-3 bg-white/90 backdrop-blur text-gray-700 rounded-xl font-medium border-2 border-gray-200 hover:border-gray-300 transition-all"
								>
									Necessary Only
								</button>
								
								{#if !showDetails}
									<button
										onclick={() => showDetails = true}
										class="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
									>
										Manage Preferences
									</button>
								{:else}
									<button
										onclick={acceptSelected}
										class="px-6 py-3 bg-gradient-to-r from-gray-700 to-black text-white rounded-xl font-medium hover:shadow-lg transition-all"
									>
										Save Preferences
									</button>
								{/if}
								
								<!-- GDPR Info -->
								<div class="text-xs text-gray-500 text-center mt-2">
									<p class="font-semibold">GDPR Compliant</p>
									<p>Your data, your choice</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}