<script lang="ts">
  import * as messages from '@repo/i18n';
  
  // Track current language
  let currentLang = $state<string>('en');
  
  // Force reactivity by creating a key
  let updateKey = $state(0);
  
  function switchLanguage(lang: string) {
    messages.setLanguageTag(lang as any);
    currentLang = lang;
    updateKey++; // Force re-render
  }
  
  // Initialize language
  messages.setLanguageTag('en');
</script>

{#key updateKey}
<div class="p-8 max-w-2xl mx-auto">
  <h1 class="text-3xl font-bold mb-4">{messages.welcome()}</h1>
  <p class="text-xl mb-4">{messages.test()}</p>
  <p class="mb-4">Current language: <span class="font-bold">{currentLang}</span></p>
  
  <div class="mb-6">
    <p class="mb-2">{messages.hello()}</p>
    <p class="mb-2">{messages.loading()}</p>
    <p class="mb-2">{messages.price()}: $99.99</p>
  </div>
  
  <div class="flex gap-2">
    {#each messages.availableLanguageTags as lang}
      <button 
        onclick={() => switchLanguage(lang)}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors {currentLang === lang ? 'ring-2 ring-blue-300' : ''}"
      >
        {messages.languageNames[lang as keyof typeof messages.languageNames]}
      </button>
    {/each}
  </div>
  
  <div class="mt-8 p-4 bg-gray-100 rounded">
    <p class="text-sm text-gray-600">Debug info:</p>
    <p class="text-xs">Language tag: {messages.languageTag()}</p>
    <p class="text-xs">Available: {messages.availableLanguageTags.join(', ')}</p>
    <p class="text-xs">Update key: {updateKey}</p>
  </div>
</div>
{/key}