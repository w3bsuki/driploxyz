<script lang="ts">
  import Avatar from './Avatar.svelte';
  import MegaMenuCategories from './MegaMenuCategories.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import { portal } from './actions/portal';

  interface Props {
    id?: string;
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
    onCategoryClick: (category: string, level?: number, path?: string[]) => void;
    onLanguageChange: (lang: string) => void;
    signingOut?: boolean;
    variant?: 'dropdown' | 'drawer';
    placement?: 'left' | 'right';
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
      categoryUnisex?: string;
      help?: string;
      privacy?: string;
      terms?: string;
      returns?: string;
      trustSafety?: string;
    };
  }

  let { 
    id,
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
    variant = 'dropdown',
    placement = 'left',
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
      categoryUnisex: '',
      help: '',
      privacy: '',
      terms: '',
      returns: '',
      trustSafety: ''
    }
  }: Props = $props();

  // Handle menu state effects
  $effect(() => {
    if (typeof document === 'undefined') return;
    
    if (isOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    // Cleanup function
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  });

  // Enhanced category click handler
  function handleCategoryClick(category: string, level: number = 1, path: string[] = [category]) {
    onCategoryClick(category, level, path);
  }

</script>

{#if isOpen}
  <!-- Backdrop overlay -->
  <div 
    use:portal
    class="sm:hidden fixed inset-0 bg-black/20 z-[99998]" 
    onclick={onClose}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
    role="button"
    tabindex="0"
    aria-label="Close menu"
  ></div>
  {#if variant === 'drawer'}
    <!-- Slide-out drawer -->
    <div {id} use:portal class="sm:hidden fixed inset-y-0 {placement === 'right' ? 'right-0' : 'left-0'} z-[2147483647]" role="dialog" aria-modal="true" aria-label="Mobile menu">
      <div class="h-full w-[calc(100vw-3.5rem)] max-w-[22rem] bg-white shadow-2xl border border-gray-100 backdrop-blur-xl bg-white/95 safe-area-x safe-area-y overflow-y-auto">
        <div class="px-5 py-5">
          <nav class="space-y-3">
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

            <!-- Shopping Categories - Mega Menu Navigation -->
            <div class="-mx-5">
              <MegaMenuCategories 
                onCategoryClick={handleCategoryClick}
                {onClose}
                translations={{
                  women: translations.categoryWomen,
                  men: translations.categoryMen,
                  kids: translations.categoryKids,
                  unisex: translations.categoryUnisex
                }}
              />
            </div>

            <!-- Quick Actions - Compact Layout -->
            <div class="pt-4 border-t border-gray-200">
              <div class="grid grid-cols-3 gap-2">
                <a href="/search" class="flex flex-col items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center" onclick={onClose}>
                  <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span class="text-xs font-medium">{translations.browseAll}</span>
                </a>
                
                <a href="/brands" class="flex flex-col items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center" onclick={onClose}>
                  <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span class="text-xs font-medium">{translations.popularBrands}</span>
                </a>
                
                <a href="/new" class="flex flex-col items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center" onclick={onClose}>
                  <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-xs font-medium">{translations.newToday}</span>
                </a>
              </div>
              
              {#if isLoggedIn}
                <a href="/orders" class="flex flex-col items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center" onclick={onClose}>
                  <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                  </svg>
                  <span class="text-xs font-medium">{translations.orders}</span>
                </a>
                
                <a href="/favorites" class="flex flex-col items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center" onclick={onClose}>
                  <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span class="text-xs font-medium">{translations.favorites}</span>
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
              <div class="pt-3 border-t border-gray-200">
                <div class="grid grid-cols-2 gap-3">
                  <a href="/login" class="flex items-center justify-center px-4 py-4 text-gray-900 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all duration-200 min-h-12 border border-gray-200 touch-manipulation" onclick={onClose}>
                    <span class="font-bold text-sm">{translations.signIn}</span>
                  </a>
                  <a href="/signup" class="flex items-center justify-center px-4 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 min-h-12 touch-manipulation" onclick={onClose}>
                    <span class="text-sm font-bold">{translations.signUp}</span>
                  </a>
                </div>
              </div>
            {/if}
          </nav>
        </div>
      </div>
    </div>
  {:else}
    <!-- Mobile dropdown menu (default) -->
    <div {id} use:portal class="sm:hidden fixed top-[72px] left-1 right-1 bg-white rounded-2xl shadow-2xl z-[2147483647] border border-gray-100 backdrop-blur-xl bg-white/95 safe-area-x">
      <div class="px-5 py-5">
        <nav class="space-y-3">
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
        
        <!-- Shopping Categories - Mega Menu Navigation -->
        <div class="-mx-5">
          <MegaMenuCategories 
            onCategoryClick={handleCategoryClick}
            {onClose}
            translations={{
              women: translations.categoryWomen,
              men: translations.categoryMen,
              kids: translations.categoryKids,
              unisex: translations.categoryUnisex
            }}
          />
        </div>
        
        <!-- Quick Actions - Compact Layout -->
        <div class="pt-4 border-t border-gray-200">
          <div class="grid grid-cols-3 gap-2">
            <a href="/search" class="flex flex-col items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center" onclick={onClose}>
              <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="text-xs font-medium">{translations.browseAll}</span>
            </a>
            
            <a href="/brands" class="flex flex-col items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center" onclick={onClose}>
              <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span class="text-xs font-medium">{translations.popularBrands}</span>
            </a>
            
            <a href="/new" class="flex flex-col items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center" onclick={onClose}>
              <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-xs font-medium">{translations.newToday}</span>
            </a>
          </div>
          
          {#if isLoggedIn}
            <a href="/orders" class="flex flex-col items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center" onclick={onClose}>
              <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
              <span class="text-xs font-medium">{translations.orders}</span>
            </a>
            
            <a href="/favorites" class="flex flex-col items-center px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center" onclick={onClose}>
              <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span class="text-xs font-medium">{translations.favorites}</span>
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
          <div class="pt-3 border-t border-gray-200">
            <div class="grid grid-cols-2 gap-3">
              <a href="/login" class="flex items-center justify-center px-4 py-4 text-gray-900 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all duration-200 min-h-12 border border-gray-200 touch-manipulation" onclick={onClose}>
                <span class="font-bold text-sm">{translations.signIn}</span>
              </a>
              <a href="/signup" class="flex items-center justify-center px-4 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 min-h-12 touch-manipulation" onclick={onClose}>
                <span class="text-sm font-bold">{translations.signUp}</span>
              </a>
            </div>
          </div>
        {/if}
        </nav>
      </div>
    </div>
  {/if}
{/if}

<style>
  /* Hide bottom navigation when mobile menu is open */
  :global(body.mobile-menu-open .bottom-nav),
  :global(body.mobile-menu-open [data-bottom-nav]) {
    display: none !important;
  }
</style>
