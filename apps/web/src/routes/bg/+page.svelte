<script>
  import * as i18n from '@repo/i18n';
  import { languageTag, setLanguageTag } from '@repo/i18n';
  import { onMount } from 'svelte';
  
  onMount(() => {
    // Set Bulgarian locale
    setLanguageTag('bg');
  });
</script>

<svelte:head>
  <title>Bulgarian Locale Test - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-3xl font-bold text-gray-900 mb-4">Bulgarian Locale Test</h1>
    <p class="text-lg text-gray-600 mb-4">Current language: {languageTag()}</p>
    <p class="text-gray-600">{i18n.home_welcome()}</p>
    <div class="mt-8">
      <a href="/" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        {i18n.nav_home()}
      </a>
    </div>
  </div>
</div>