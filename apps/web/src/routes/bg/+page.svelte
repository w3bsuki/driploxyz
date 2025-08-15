<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let currentLang = $state('bg');
  let welcomeText = $state('Добре дошли в Driplo');
  let homeText = $state('Начало');
  
  onMount(async () => {
    if (browser) {
      try {
        // Dynamic import to avoid SSR issues
        const { setLanguageTag, languageTag } = await import('@repo/i18n');
        const i18n = await import('@repo/i18n');
        
        setLanguageTag('bg');
        currentLang = languageTag();
        welcomeText = i18n.home_welcome();
        homeText = i18n.nav_home();
      } catch (e) {
        console.log('i18n not available:', e);
        // Fallback text
        welcomeText = 'Добре дошли в Driplo';
        homeText = 'Начало';
      }
    }
  });
</script>

<svelte:head>
  <title>Bulgarian Locale Test - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-3xl font-bold text-gray-900 mb-4">Bulgarian Locale Test</h1>
    <p class="text-lg text-gray-600 mb-4">Current language: {currentLang}</p>
    <p class="text-gray-600">{welcomeText}</p>
    <div class="mt-8">
      <a href="/" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        {homeText}
      </a>
    </div>
  </div>
</div>