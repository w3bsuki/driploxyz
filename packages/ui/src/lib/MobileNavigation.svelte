<script lang="ts">
  import Avatar from './Avatar.svelte';
  import CategoryGrid from './CategoryGrid.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import ThemeToggle from './ThemeToggle.svelte';

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
      whatLookingFor?: string;
      browseAll?: string;
      popularBrands?: string;
      newToday?: string;
      orders?: string;
      favorites?: string;
      categoryWomen?: string;
      categoryMen?: string;
      categoryKids?: string;
      categoryPets?: string;
      help?: string;
      privacy?: string;
      terms?: string;
      returns?: string;
      trustSafety?: string;
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
      whatLookingFor: '',
      browseAll: '',
      popularBrands: '',
      newToday: '',
      orders: '',
      favorites: '',
      categoryWomen: '',
      categoryMen: '',
      categoryKids: '',
      categoryPets: '',
      help: '',
      privacy: '',
      terms: '',
      returns: '',
      trustSafety: ''
    }
  }: Props = $props();
</script>

{#if isOpen}
  <!-- Backdrop overlay -->
  <div 
    class="sm:hidden fixed inset-0 bg-black/20 z-40" 
    onclick={onClose}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
    role="button"
    tabindex="0"
    aria-label="Close menu"
  ></div>
  
  <!-- Compact dropdown menu -->
  <div class="sm:hidden absolute top-full left-2 right-2 bg-white rounded-xl shadow-xl z-50 border border-gray-200 mt-2">
    <div class="px-4 py-4">
      <nav class="space-y-4">
        {#if isLoggedIn && user && profile}
          <!-- Account Section for Authenticated Users -->
          <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
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
        {/if}
        
        <!-- Shopping Categories - Primary Focus -->
        <div>
          <CategoryGrid 
            {onCategoryClick} 
            translations={{
              women: translations.categoryWomen,
              men: translations.categoryMen,
              kids: translations.categoryKids,
              pets: translations.categoryPets
            }}
          />
        </div>
        
        <!-- Quick Shopping Actions -->
        <div class="space-y-1">
          <a href="/search" class="flex items-center px-3 py-2.5 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-11" onclick={onClose}>
            <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="font-medium text-sm">{translations.browseAll}</span>
          </a>
          
          <a href="/brands" class="flex items-center px-3 py-2.5 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-11" onclick={onClose}>
            <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span class="font-medium text-sm">{translations.popularBrands}</span>
          </a>
          
          <a href="/new" class="flex items-center px-3 py-2.5 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-11" onclick={onClose}>
            <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium text-sm">{translations.newToday}</span>
          </a>
          
          {#if canSell}
            <a href="/sell" class="flex items-center px-3 py-2.5 text-green-700 hover:bg-green-50 rounded-lg transition-colors min-h-11 bg-green-25" onclick={onClose}>
              <svg class="w-4 h-4 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span class="font-semibold text-sm">{translations.sellItems}</span>
            </a>
          {:else}
            <a href="/become-seller" class="flex items-center px-3 py-2.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors min-h-11 bg-blue-25" onclick={onClose}>
              <svg class="w-4 h-4 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-semibold text-sm">{translations.startSelling}</span>
            </a>
          {/if}
        </div>
        
        <!-- Language & Theme -->
        <div class="pt-2 border-t border-gray-200">
          <div class="flex items-center gap-2">
            <LanguageSwitcher
              currentLanguage={currentLanguage}
              {languages}
              onLanguageChange={onLanguageChange}
              variant="inline"
              class="flex-1"
            />
            <ThemeToggle size="sm" tooltip="Toggle theme" />
          </div>
        </div>

        <!-- Legal Links -->
        <div class="pt-2 border-t border-gray-200">
          <div class="space-y-1">
            <a href="/help" class="flex items-center px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-sm" onclick={onClose}>
              <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{translations.help}</span>
            </a>
            
            <a href="/privacy" class="flex items-center px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-sm" onclick={onClose}>
              <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{translations.privacy}</span>
            </a>
            
            <a href="/terms" class="flex items-center px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-sm" onclick={onClose}>
              <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{translations.terms}</span>
            </a>
          </div>
        </div>
        
        <!-- Authentication Section -->
        {#if !isLoggedIn}
          <div class="pt-2 border-t border-gray-200">
            <div class="grid grid-cols-2 gap-2">
              <a href="/login" class="flex items-center justify-center px-3 py-3 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-11 border border-gray-200" onclick={onClose}>
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
