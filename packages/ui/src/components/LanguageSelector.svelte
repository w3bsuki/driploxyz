<script lang="ts">
  import { browser } from '$app/environment';
  
  // Since this is in packages/ui, we'll accept these as props
  interface LanguageOption {
    code: string;
    name: string;
    nativeName: string;
  }

  interface Props {
    currentLanguage?: string;
    languages?: LanguageOption[];
    variant?: 'dropdown' | 'flags' | 'buttons';
    onLanguageChange?: (lang: string) => Promise<void> | void;
    class?: string;
  }

  let { 
    currentLanguage = 'en', 
    languages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'ua', name: 'Ukrainian', nativeName: 'Українська' }
    ],
    variant = 'dropdown', 
    onLanguageChange,
    class: className = '' 
  }: Props = $props();

  let isOpen = $state(false);
  let isChanging = $state(false);

  async function handleLanguageChange(lang: string) {
    if (lang === currentLanguage || isChanging) return;
    
    isChanging = true;
    try {
      await onLanguageChange?.(lang);
    } catch (error) {
      console.error('Failed to switch language:', error);
    } finally {
      isChanging = false;
      isOpen = false;
    }
  }

  function getLanguageFlag(code: string): string {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'bg': '🇧🇬', 
      'ru': '🇷🇺',
      'ua': '🇺🇦'
    };
    return flags[code] || '🌐';
  }

  const currentLang = $derived(languages.find(l => l.code === currentLanguage) || languages[0]);
</script>

{#if variant === 'dropdown'}
  <div class="relative {className}">
    <button
      onclick={() => isOpen = !isOpen}
      disabled={isChanging}
      class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      <span>{getLanguageFlag(currentLang.code)}</span>
      <span>{currentLang.nativeName}</span>
      <svg class="w-4 h-4 ml-1 transform transition-transform {isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    {#if isOpen}
      <div class="absolute right-0 z-10 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
        <div class="py-1">
          {#each languages as lang}
            <button
              onclick={() => handleLanguageChange(lang.code)}
              disabled={isChanging}
              class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 {lang.code === currentLanguage ? 'bg-blue-50 text-blue-700' : ''}"
            >
              <span class="mr-3">{getLanguageFlag(lang.code)}</span>
              <div class="flex flex-col items-start">
                <span class="font-medium">{lang.nativeName}</span>
                <span class="text-xs text-gray-500">{lang.name}</span>
              </div>
              {#if lang.code === currentLanguage}
                <svg class="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

{:else if variant === 'flags'}
  <div class="flex space-x-2 {className}">
    {#each languages as lang}
      <button
        onclick={() => handleLanguageChange(lang.code)}
        disabled={isChanging}
        title={lang.nativeName}
        class="text-2xl hover:scale-110 transition-transform disabled:opacity-50 {lang.code === currentLanguage ? 'ring-2 ring-blue-500 rounded' : ''}"
      >
        {getLanguageFlag(lang.code)}
      </button>
    {/each}
  </div>

{:else}
  <div class="flex flex-wrap gap-2 {className}">
    {#each languages as lang}
      <button
        onclick={() => handleLanguageChange(lang.code)}
        disabled={isChanging}
        class="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md border transition-colors disabled:opacity-50 {
          lang.code === currentLanguage 
            ? 'bg-blue-600 text-white border-blue-600' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }"
      >
        <span>{getLanguageFlag(lang.code)}</span>
        <span>{lang.nativeName}</span>
      </button>
    {/each}
  </div>
{/if}

{#if isChanging}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span class="text-sm font-medium">Switching language...</span>
    </div>
  </div>
{/if}