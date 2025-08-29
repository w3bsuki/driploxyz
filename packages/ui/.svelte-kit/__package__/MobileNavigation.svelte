<script lang="ts">
  import Avatar from './Avatar.svelte';
  import CategoryGrid from './CategoryGrid.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  interface Props {
    isOpen: boolean;
    isLoggedIn: boolean;
    user?: any;
    profile?: any;
    userDisplayName?: string;
    initials?: string;
    canSell?: boolean;
    currentLanguage: string;
    languages: any[];
    onClose: () => void;
    onSignOut: () => void;
    onCategoryClick: (category: string) => void;
    onLanguageChange: (lang: string) => void;
    signingOut?: boolean;
    translations?: {
      sellItems?: string;
      myProfile?: string;
      startSelling?: string;
      settings?: string;
      signOut?: string;
      signingOut?: string;
      signIn?: string;
      signUp?: string;
      browseCategories?: string;
      orders?: string;
      favorites?: string;
      categoryWomen?: string;
      categoryMen?: string;
      categoryKids?: string;
      categoryPets?: string;
    };
  }

  let { 
    isOpen, 
    isLoggedIn, 
    user, 
    profile, 
    userDisplayName, 
    initials, 
    canSell,
    currentLanguage,
    languages,
    onClose, 
    onSignOut, 
    onCategoryClick,
    onLanguageChange,
    signingOut = false,
    translations = {
      sellItems: '',
      myProfile: '',
      startSelling: '',
      settings: '',
      signOut: '',
      signingOut: '',
      signIn: '',
      signUp: '',
      browseCategories: '',
      orders: '',
      favorites: '',
      categoryWomen: '',
      categoryMen: '',
      categoryKids: '',
      categoryPets: ''
    }
  }: Props = $props();
</script>

{#if isOpen}
  <div class="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-sm md:shadow-xl z-50">
    <div class="px-3 py-3">
      <nav class="space-y-3">
        {#if isLoggedIn && user && profile}
          <!-- User Profile Section -->
          <div class="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div class="flex items-center space-x-3">
              <Avatar 
                name={userDisplayName} 
                src={profile?.avatar_url} 
                size="sm"
                fallback={initials}
              />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 truncate text-sm">{userDisplayName}</p>
              </div>
            </div>
          </div>
          
          <!-- Categories -->
          <CategoryGrid 
            {onCategoryClick} 
            translations={{
              women: translations.categoryWomen,
              men: translations.categoryMen,
              kids: translations.categoryKids,
              pets: translations.categoryPets
            }}
          />
          
          <!-- Essential Actions -->
          <div class="space-y-2">
            {#if canSell}
              <a href="/sell" class="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-11" onclick={onClose}>
                <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span class="font-medium text-sm">{translations.sellItems}</span>
              </a>
            {/if}
            
            <a href="/profile/me" class="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-11" onclick={onClose}>
              <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="font-medium text-sm">{translations.myProfile}</span>
            </a>
            
            <a href="/orders" class="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-11" onclick={onClose}>
              <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span class="font-medium text-sm">{translations.orders}</span>
            </a>
            
            <a href="/favorites" class="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-11" onclick={onClose}>
              <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span class="font-medium text-sm">{translations.favorites}</span>
            </a>
            
            {#if !canSell}
              <a href="/become-seller" class="flex items-center px-3 py-2.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors min-h-11 bg-blue-25" onclick={onClose}>
                <svg class="w-4 h-4 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-semibold text-sm">{translations.startSelling}</span>
              </a>
            {/if}
          </div>
          
          <!-- Language Switcher -->
          <div class="pt-2 border-t border-gray-200">
            <div class="px-3 py-2">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{translations.settings}</p>
              <LanguageSwitcher
                currentLanguage={currentLanguage}
                {languages}
                onLanguageChange={onLanguageChange}
                variant="inline"
                class="w-full"
              />
            </div>
          </div>
          
          <!-- Sign Out -->
          <div class="pt-2 border-t border-gray-200">
            <button
              onclick={onSignOut}
              disabled={signingOut}
              class="flex items-center w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-11 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if signingOut}
                <svg class="animate-spin w-4 h-4 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="font-semibold text-sm">{translations.signingOut}</span>
              {:else}
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="font-semibold text-sm">{translations.signOut}</span>
              {/if}
            </button>
          </div>
          
        {:else}
          <!-- Logged Out Menu -->
          <div class="space-y-3">
            <!-- Categories Grid -->
            <CategoryGrid 
              {onCategoryClick}
              translations={{
                women: translations.categoryWomen,
                men: translations.categoryMen,
                kids: translations.categoryKids,
                pets: translations.categoryPets
              }}
            />
            
            <!-- Language Switcher -->
            <div class="px-3 py-2">
              <LanguageSwitcher
                currentLanguage={currentLanguage}
                {languages}
                onLanguageChange={onLanguageChange}
                variant="inline"
                class="w-full"
              />
            </div>
            
            <!-- Authentication -->
            <div class="grid grid-cols-2 gap-2">
              <a href="/login" class="flex items-center justify-center px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-11 border border-gray-200" onclick={onClose}>
                <span class="font-semibold text-sm">{translations.signIn}</span>
              </a>
              <a href="/signup" class="flex items-center justify-center px-3 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors min-h-11" onclick={onClose}>
                <span class="text-sm">{translations.signUp}</span>
              </a>
            </div>
          </div>
        {/if}
      </nav>
    </div>
  </div>
{/if}