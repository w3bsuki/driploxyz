<script lang="ts">
  import Avatar from './Avatar.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import { portal } from './actions/portal';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  interface CategoryL1 {
    key: string;
    label: string;
    emoji: string;
    subcategories?: CategoryL2[];
  }

  interface CategoryL2 {
    key: string;
    label: string;
    items?: CategoryL3[];
  }

  interface CategoryL3 {
    key: string;
    label: string;
  }

  interface NavigationItem {
    href: string;
    label: string;
    icon?: string;
    action?: () => void;
  }

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
      back?: string;
      close?: string;
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
    translations = {
      sellItems: 'Sell Items',
      myProfile: 'My Profile',
      startSelling: 'Start Selling',
      settings: 'Settings',
      signOut: 'Sign Out',
      signingOut: 'Signing Out...',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      browseCategories: 'Browse Categories',
      browseAll: 'Browse All',
      popularBrands: 'Popular Brands',
      newToday: 'New Today',
      orders: 'Orders',
      favorites: 'Favorites',
      categoryWomen: 'Women',
      categoryMen: 'Men',
      categoryKids: 'Kids',
      categoryUnisex: 'Unisex',
      help: 'Help',
      privacy: 'Privacy',
      terms: 'Terms',
      back: 'Back',
      close: 'Close'
    }
  }: Props = $props();

  // Svelte 5 runes for state management
  let currentLevel = $state<number>(0); // 0: main menu, 1: categories, 2: subcategories, 3: items
  let navigationPath = $state<string[]>([]);
  let selectedL1 = $state<CategoryL1 | null>(null);
  let selectedL2 = $state<CategoryL2 | null>(null);

  // Category data structure
  const categories = $derived<CategoryL1[]>([
    {
      key: 'women',
      label: translations.categoryWomen || 'Women',
      emoji: '👗',
      subcategories: [
        {
          key: 'clothing',
          label: 'Clothing',
          items: [
            { key: 't-shirts', label: 'T-Shirts' },
            { key: 'dresses', label: 'Dresses' },
            { key: 'jeans', label: 'Jeans' },
            { key: 'tops', label: 'Tops' },
            { key: 'sweaters', label: 'Sweaters' },
            { key: 'jackets', label: 'Jackets' }
          ]
        },
        {
          key: 'shoes',
          label: 'Shoes',
          items: [
            { key: 'sneakers', label: 'Sneakers' },
            { key: 'heels', label: 'Heels' },
            { key: 'boots', label: 'Boots' },
            { key: 'sandals', label: 'Sandals' },
            { key: 'flats', label: 'Flats' }
          ]
        },
        {
          key: 'accessories',
          label: 'Accessories',
          items: [
            { key: 'jewelry', label: 'Jewelry' },
            { key: 'watches', label: 'Watches' },
            { key: 'scarves', label: 'Scarves' },
            { key: 'belts', label: 'Belts' },
            { key: 'sunglasses', label: 'Sunglasses' }
          ]
        },
        {
          key: 'bags',
          label: 'Bags',
          items: [
            { key: 'handbags', label: 'Handbags' },
            { key: 'backpacks', label: 'Backpacks' },
            { key: 'clutches', label: 'Clutches' },
            { key: 'totes', label: 'Totes' }
          ]
        }
      ]
    },
    {
      key: 'men',
      label: translations.categoryMen || 'Men',
      emoji: '👔',
      subcategories: [
        {
          key: 'clothing',
          label: 'Clothing',
          items: [
            { key: 't-shirts', label: 'T-Shirts' },
            { key: 'shirts', label: 'Shirts' },
            { key: 'jeans', label: 'Jeans' },
            { key: 'jackets', label: 'Jackets' },
            { key: 'sweaters', label: 'Sweaters' },
            { key: 'suits', label: 'Suits' }
          ]
        },
        {
          key: 'shoes',
          label: 'Shoes',
          items: [
            { key: 'sneakers', label: 'Sneakers' },
            { key: 'dress-shoes', label: 'Dress Shoes' },
            { key: 'boots', label: 'Boots' },
            { key: 'sandals', label: 'Sandals' },
            { key: 'loafers', label: 'Loafers' }
          ]
        },
        {
          key: 'accessories',
          label: 'Accessories',
          items: [
            { key: 'watches', label: 'Watches' },
            { key: 'belts', label: 'Belts' },
            { key: 'wallets', label: 'Wallets' },
            { key: 'ties', label: 'Ties' },
            { key: 'sunglasses', label: 'Sunglasses' }
          ]
        }
      ]
    },
    {
      key: 'kids',
      label: translations.categoryKids || 'Kids',
      emoji: '👶',
      subcategories: [
        {
          key: 'clothing',
          label: 'Clothing',
          items: [
            { key: 't-shirts', label: 'T-Shirts' },
            { key: 'dresses', label: 'Dresses' },
            { key: 'jeans', label: 'Jeans' },
            { key: 'pajamas', label: 'Pajamas' },
            { key: 'jackets', label: 'Jackets' }
          ]
        },
        {
          key: 'shoes',
          label: 'Shoes',
          items: [
            { key: 'sneakers', label: 'Sneakers' },
            { key: 'sandals', label: 'Sandals' },
            { key: 'boots', label: 'Boots' },
            { key: 'school-shoes', label: 'School Shoes' }
          ]
        },
        {
          key: 'accessories',
          label: 'Accessories',
          items: [
            { key: 'backpacks', label: 'Backpacks' },
            { key: 'hats', label: 'Hats' },
            { key: 'toys', label: 'Toys' },
            { key: 'watches', label: 'Watches' }
          ]
        }
      ]
    },
    {
      key: 'unisex',
      label: translations.categoryUnisex || 'Unisex',
      emoji: '👕',
      subcategories: [
        {
          key: 'clothing',
          label: 'Clothing',
          items: [
            { key: 't-shirts', label: 'T-Shirts' },
            { key: 'hoodies', label: 'Hoodies' },
            { key: 'sweatshirts', label: 'Sweatshirts' },
            { key: 'joggers', label: 'Joggers' }
          ]
        },
        {
          key: 'accessories',
          label: 'Accessories',
          items: [
            { key: 'sunglasses', label: 'Sunglasses' },
            { key: 'hats', label: 'Hats' },
            { key: 'watches', label: 'Watches' },
            { key: 'backpacks', label: 'Backpacks' }
          ]
        }
      ]
    }
  ]);

  // Main navigation items for authenticated users
  const authNavigationItems = $derived<NavigationItem[]>([
    { href: '/orders', label: translations.orders || 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z' },
    { href: '/favorites', label: translations.favorites || 'Favorites', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { href: '/account', label: translations.myProfile || 'My Profile', icon: 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0Z' },
    { href: '/settings', label: translations.settings || 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
  ]);

  // Quick action items
  const quickActionItems = $derived<NavigationItem[]>([
    { href: '/search', label: translations.browseAll || 'Browse All', icon: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z' },
    { href: '/brands', label: translations.popularBrands || 'Popular Brands', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { href: '/new', label: translations.newToday || 'New Today', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
  ]);

  // Legal navigation items
  const legalNavigationItems = $derived<NavigationItem[]>([
    { href: '/help', label: translations.help || 'Help', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { href: '/privacy', label: translations.privacy || 'Privacy', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { href: '/terms', label: translations.terms || 'Terms', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
  ]);

  // Navigation functions using Svelte 5 state
  function selectL1Category(category: CategoryL1) {
    selectedL1 = category;
    selectedL2 = null;
    currentLevel = 1;
    navigationPath = [category.key];
  }

  function selectL2Category(category: CategoryL2) {
    selectedL2 = category;
    currentLevel = 2;
    navigationPath = [...navigationPath, category.key];
  }

  function selectL3Item(item: CategoryL3) {
    const fullPath = [...navigationPath, item.key];
    onCategoryClick(item.key, 2, fullPath);
    onClose();
  }

  function goBack() {
    if (currentLevel === 2) {
      selectedL2 = null;
      currentLevel = 1;
      navigationPath = navigationPath.slice(0, -1);
    } else if (currentLevel === 1) {
      selectedL1 = null;
      selectedL2 = null;
      currentLevel = 0;
      navigationPath = [];
    }
  }

  function handleClose() {
    // Reset navigation state
    currentLevel = 0;
    navigationPath = [];
    selectedL1 = null;
    selectedL2 = null;
    // Force close the menu
    onClose();
  }

  function handleNavigationClick(item: NavigationItem) {
    if (item.action) {
      item.action();
    } else {
      window.location.href = item.href;
    }
    onClose();
  }

  function handleL1Click(category: CategoryL1) {
    if (!category.subcategories || category.subcategories.length === 0) {
      onCategoryClick(category.key, 1, [category.key]);
      onClose();
    } else {
      selectL1Category(category);
    }
  }

  function handleL2Click(category: CategoryL2) {
    if (!category.items || category.items.length === 0) {
      const fullPath = [...navigationPath, category.key];
      onCategoryClick(category.key, 1, fullPath);
      onClose();
    } else {
      selectL2Category(category);
    }
  }

  // Handle ESC key
  $effect(() => {
    if (typeof document === 'undefined') return;

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.classList.remove('overflow-hidden');
    };
  });
</script>

{#if isOpen}
  <!-- Single portal container -->
  <div use:portal class="fixed inset-0 z-[9999]">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black/50" 
      onclick={onClose}
      onkeydown={(e) => e.key === 'Escape' && onClose()}
      role="button"
      tabindex="0"
      aria-label={translations.close || 'Close menu'}
      transition:fade={{ duration: 200, easing: cubicOut }}
    ></div>

    <!-- Navigation drawer -->
    <div 
      {id}
      class="fixed inset-0 flex z-10"
      role="dialog" 
      aria-modal="true" 
      aria-label="Mobile navigation menu"
      transition:fly={{ y: -24, duration: 220, easing: cubicOut }}
    >
    <!-- Drawer content -->
    <div class="w-full h-full bg-[color:var(--surface-base)] flex flex-col safe-area-x safe-area-y">
      <!-- Header - Only show back button when navigating -->
      {#if currentLevel > 0}
        <div class="flex items-center p-4 border-b border-[color:var(--border-subtle)]">
          <button
            onclick={goBack}
            class="flex items-center gap-2 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors duration-200 min-h-11 px-2 -ml-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
            aria-label={translations.back || 'Go back'}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="font-semibold">{translations.back || 'Back'}</span>
          </button>
        </div>
      {/if}

      <!-- Content with smooth level transitions -->
      <div class="flex-1 overflow-y-auto">
        {#key currentLevel}
          {#if currentLevel === 0}
          <!-- Main menu -->
          <div 
            class="p-4 space-y-6"
            in:fly={{ x: currentLevel > 0 ? -50 : 50, duration: 250, easing: cubicOut }}
            out:fly={{ x: currentLevel > 0 ? 50 : -50, duration: 200, easing: cubicOut }}
          >
            <!-- User section with embedded close button -->
            {#if isLoggedIn && user && profile}
              <div class="relative bg-[color:var(--surface-subtle)] rounded-xl p-4 border border-[color:var(--border-subtle)] shadow-sm">
                <!-- Header with avatar and close -->
                <div class="flex items-start gap-3 mb-3">
                  <Avatar 
                    name={userDisplayName} 
                    src={profile?.avatar_url} 
                    size="md"
                    fallback={initials}
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-base font-semibold text-[color:var(--text-primary)] truncate">Hey, {userDisplayName}! 👋</p>
                    {#if canSell}
                      <div class="flex items-center gap-1 mt-1">
                        <svg class="w-3 h-3 text-[color:var(--status-success-text)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.53a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                        </svg>
                        <span class="text-xs font-medium text-[color:var(--status-success-text)]">Verified Seller</span>
                      </div>
                    {:else}
                      <p class="text-xs text-[color:var(--text-secondary)] mt-1">Member since {new Date().getFullYear()}</p>
                    {/if}
                  </div>
                  
                  <!-- Close button -->
                  <button
                    onclick={() => onClose()}
                    type="button"
                    class="flex items-center justify-center min-h-[var(--touch-standard)] min-w-[var(--touch-standard)] text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-muted)] rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
                    aria-label={translations.close || 'Close menu'}
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Quick stats and actions -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    {#if canSell}
                      <!-- Seller stats -->
                      <div class="flex items-center gap-3 text-xs">
                        <div class="flex items-center gap-1">
                          <svg class="w-3 h-3 text-[color:var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span class="text-[color:var(--text-secondary)]">12 sold</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <svg class="w-3 h-3 text-[color:var(--text-secondary)]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span class="text-[color:var(--text-secondary)]">4.8</span>
                        </div>
                      </div>
                    {:else}
                      <!-- Buyer stats -->
                      <div class="flex items-center gap-3 text-xs">
                        <div class="flex items-center gap-1">
                          <svg class="w-3 h-3 text-[color:var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span class="text-[color:var(--text-secondary)]">{Math.floor(Math.random() * 50) + 10} saved</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <svg class="w-3 h-3 text-[color:var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                          </svg>
                          <span class="text-[color:var(--text-secondary)]">{Math.floor(Math.random() * 20) + 3} bought</span>
                        </div>
                      </div>
                    {/if}
                  </div>

                  <!-- View Profile button -->
                  <button
                    onclick={() => handleNavigationClick({ href: '/profile', label: 'View Profile' })}
                    class="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium hover:bg-blue-600 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Profile</span>
                  </button>
                </div>
              </div>
            {:else}
              <!-- Close button for non-logged-in users -->
              <div class="flex justify-end">
                <button
                  onclick={() => onClose()}
                  type="button"
                  class="flex items-center justify-center min-h-[var(--touch-primary)] min-w-[var(--touch-primary)] text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-subtle)] rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
                  aria-label={translations.close || 'Close menu'}
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            {/if}

            <!-- Categories - Direct Access -->
            <div>
              <h3 class="text-base font-semibold text-[color:var(--text-primary)] mb-4 tracking-tight">Shop Categories</h3>
              <div class="space-y-2">
                {#each categories as category}
                  <button
                    onclick={() => handleL1Click(category)}
                    class="group w-full flex items-center justify-between px-3 py-2 bg-[color:var(--surface-subtle)] hover:bg-[color:var(--surface-muted)] rounded-lg border border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)] hover:shadow-sm transition-all duration-200 min-h-[var(--touch-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-xl">{category.emoji}</span>
                      <span class="text-base font-medium text-[color:var(--text-primary)]">{category.label}</span>
                    </div>
                    <svg class="w-5 h-5 text-[color:var(--text-tertiary)] group-hover:text-[color:var(--text-secondary)] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                {/each}
              </div>
            </div>

            <!-- Quick Actions -->
            <div>
              <h3 class="text-base font-semibold text-[color:var(--text-primary)] mb-4 tracking-tight">Browse</h3>
              <div class="grid grid-cols-3 gap-3">
                {#each quickActionItems as item}
                  <button
                    onclick={() => handleNavigationClick(item)}
                    class="flex flex-col items-center justify-center p-2 bg-[color:var(--surface-subtle)] hover:bg-[color:var(--surface-muted)] hover:shadow-sm rounded-lg border border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)] transition-all duration-200 min-h-[var(--touch-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
                  >
                    <svg class="w-4 h-4 text-[color:var(--text-secondary)] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
                    </svg>
                    <span class="text-xs font-medium text-[color:var(--text-primary)] text-center leading-tight">{item.label}</span>
                  </button>
                {/each}
              </div>
            </div>

            <!-- User Navigation - Horizontal Grid -->
            {#if isLoggedIn}
              <div>
                <h3 class="text-base font-semibold text-[color:var(--text-primary)] mb-4 tracking-tight">Account</h3>
                <div class="grid grid-cols-2 gap-3 mb-6">
                  {#each authNavigationItems as item}
                    <button
                      onclick={() => handleNavigationClick(item)}
                      class="flex flex-col items-center justify-center p-2 text-[color:var(--text-primary)] bg-[color:var(--surface-subtle)] hover:bg-[color:var(--surface-muted)] hover:shadow-sm rounded-lg border border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)] transition-all duration-200 min-h-[var(--touch-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
                    >
                      <svg class="w-4 h-4 text-[color:var(--text-secondary)] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
                      </svg>
                      <span class="text-xs font-medium text-center leading-tight">{item.label}</span>
                    </button>
                  {/each}
                </div>
                
                <!-- Sign Out - Full Width -->
                <button
                  onclick={onSignOut}
                  disabled={signingOut}
                  class="w-full flex items-center justify-center gap-2 px-3 py-2 text-[color:var(--status-error-text)] bg-[color:var(--surface-subtle)] hover:bg-[color:var(--surface-muted)] hover:shadow-sm rounded-lg border border-[color:var(--border-subtle)] hover:border-[color:var(--status-error-border)] transition-all duration-200 min-h-[var(--touch-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] disabled:opacity-50"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span class="font-medium text-sm">{signingOut ? translations.signingOut : translations.signOut}</span>
                </button>
              </div>
            {/if}

            <!-- Settings -->
            <div>
              <h3 class="text-base font-semibold text-[color:var(--text-primary)] mb-4 tracking-tight">Preferences</h3>
              <div class="bg-[color:var(--surface-subtle)] rounded-lg p-3 border border-[color:var(--border-subtle)]">
                <div class="flex items-center gap-3">
                  <LanguageSwitcher
                    currentLanguage={currentLanguage}
                    {languages}
                    onLanguageChange={onLanguageChange}
                    variant="inline"
                    class="flex-1"
                  />
                  <ThemeToggle size="md" tooltip="Toggle theme" />
                </div>
              </div>
            </div>

            <!-- Support & Legal -->
            <div>
              <h3 class="text-base font-semibold text-[color:var(--text-primary)] mb-4 tracking-tight">Support</h3>
              <div class="grid grid-cols-3 gap-3">
                {#each legalNavigationItems as item}
                  <button
                    onclick={() => handleNavigationClick(item)}
                    class="flex flex-col items-center justify-center p-3 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] bg-[color:var(--surface-subtle)] hover:bg-[color:var(--surface-muted)] hover:shadow-sm rounded-lg border border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)] transition-all duration-200 min-h-[var(--touch-primary)] aspect-square focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
                  >
                    <svg class="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
                    </svg>
                    <span class="text-xs font-medium text-center leading-tight">{item.label}</span>
                  </button>
                {/each}
              </div>
            </div>

            <!-- Auth Section for non-logged-in users -->
            {#if !isLoggedIn}
              <div class="pt-6 border-t border-[color:var(--border-subtle)]">
                <div class="grid grid-cols-2 gap-4">
                  <button
                    onclick={() => handleNavigationClick({ href: '/login', label: 'Sign In' })}
                    class="flex items-center justify-center px-3 py-2 text-[color:var(--text-primary)] bg-[color:var(--surface-subtle)] hover:bg-[color:var(--surface-muted)] hover:shadow-sm rounded-lg border border-[color:var(--border-default)] hover:border-[color:var(--border-emphasis)] transition-all duration-200 min-h-[var(--touch-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
                  >
                    <span class="font-medium text-sm">{translations.signIn}</span>
                  </button>
                  <button
                    onclick={() => handleNavigationClick({ href: '/signup', label: 'Sign Up' })}
                    class="flex items-center justify-center px-3 py-2 bg-[color:var(--brand-primary)] text-[color:var(--brand-primary-fg)] rounded-lg font-medium hover:bg-[color:var(--brand-primary-hover)] active:bg-[color:var(--brand-primary-active)] hover:shadow-sm transition-all duration-200 min-h-[var(--touch-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
                  >
                    <span class="font-medium text-sm">{translations.signUp}</span>
                  </button>
                </div>
              </div>
            {/if}
          </div>

        {:else if currentLevel === 1 && selectedL1}
          <!-- Subcategory selection -->
          <div 
            class="p-4"
            in:fly={{ x: 50, duration: 250, easing: cubicOut }}
            out:fly={{ x: -50, duration: 200, easing: cubicOut }}
          >
            <h2 class="text-lg font-bold text-[color:var(--text-primary)] mb-4 tracking-tight">{selectedL1.label}</h2>
            <div class="space-y-2">
              {#each selectedL1.subcategories || [] as subcategory}
                <button
                  onclick={() => handleL2Click(subcategory)}
                  class="group w-full flex items-center justify-between px-3 py-2 text-[color:var(--text-primary)] bg-[color:var(--surface-subtle)] hover:bg-[color:var(--surface-muted)] hover:shadow-sm rounded-lg border border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)] transition-all duration-200 min-h-[var(--touch-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]"
                >
                  <span class="font-medium text-base">{subcategory.label}</span>
                  <svg class="w-5 h-5 text-[color:var(--text-tertiary)] group-hover:text-[color:var(--text-secondary)] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              {/each}
            </div>
          </div>

        {:else if currentLevel === 2 && selectedL2}
          <!-- Item selection -->
          <div 
            class="p-4"
            in:fly={{ x: 50, duration: 250, easing: cubicOut }}
            out:fly={{ x: -50, duration: 200, easing: cubicOut }}
          >
            <h2 class="text-lg font-bold text-[color:var(--text-primary)] mb-4 tracking-tight">{selectedL2.label}</h2>
            <div class="grid grid-cols-2 gap-2">
              {#each selectedL2.items || [] as item}
                <button
                  onclick={() => selectL3Item(item)}
                  class="px-3 py-2 text-[color:var(--text-primary)] bg-[color:var(--surface-subtle)] hover:bg-[color:var(--surface-muted)] hover:shadow-sm rounded-lg border border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)] transition-all duration-200 min-h-[var(--touch-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)] flex items-center justify-center"
                >
                  <span class="font-medium text-center text-sm leading-tight">{item.label}</span>
                </button>
              {/each}
            </div>
          </div>
          {/if}
        {/key}
      </div>
    </div>
  </div>
  </div>
{/if}

<style>
  /* Ensure proper scroll behavior and mobile optimization */
  :global(body.overflow-hidden) {
    overflow: hidden;
  }

  /* Modern button interactions */
  button {
    transform-origin: center;
    will-change: transform, box-shadow;
  }

  /* Subtle scale animation on button press */
  button:active {
    transform: scale(0.98);
  }

  /* Smooth hover states with micro-interactions */
  button:hover {
    transform: translateY(-1px);
  }

  /* Enhanced focus states */
  button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--state-focus), 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  /* Category buttons get special treatment */
  .category-button {
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .category-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  /* User profile card enhancement */
  .user-profile-card {
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  /* Grid items get staggered animations */
  .grid > * {
    animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  }

  .grid > *:nth-child(1) { animation-delay: 0.05s; }
  .grid > *:nth-child(2) { animation-delay: 0.1s; }
  .grid > *:nth-child(3) { animation-delay: 0.15s; }
  .grid > *:nth-child(4) { animation-delay: 0.2s; }
  .grid > *:nth-child(5) { animation-delay: 0.25s; }
  .grid > *:nth-child(6) { animation-delay: 0.3s; }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Smooth list items */
  .space-y-3 > * {
    animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  }

  .space-y-3 > *:nth-child(1) { animation-delay: 0.05s; }
  .space-y-3 > *:nth-child(2) { animation-delay: 0.1s; }
  .space-y-3 > *:nth-child(3) { animation-delay: 0.15s; }
  .space-y-3 > *:nth-child(4) { animation-delay: 0.2s; }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>