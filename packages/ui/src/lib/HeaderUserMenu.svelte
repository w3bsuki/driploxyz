<script lang="ts">
  import Avatar from './Avatar.svelte';
  import Menu from './primitives/menu/Menu.svelte';
  
  interface Props {
    user: any;
    profile: any;
    userDisplayName: string;
    initials: string;
    canSell: boolean;
    onSignOut: () => void;
    onClose: () => void;
    signingOut?: boolean;
    translations?: {
      myProfile?: string;
      orders?: string;
      favorites?: string;
      startSelling?: string;
      settings?: string;
      signOut?: string;
      signingOut?: string;
    };
  }

  let { 
    user, 
    profile, 
    userDisplayName, 
    initials, 
    canSell, 
    onSignOut, 
    onClose,
    signingOut = false,
    translations = {
      myProfile: 'My Profile',
      orders: 'Orders',
      favorites: 'Favorites',
      startSelling: 'Start Selling',
      settings: 'Settings',
      signOut: 'Sign Out',
      signingOut: 'Signing out...'
    }
  }: Props = $props();

  let menuOpen = $state(false);
</script>

<Menu 
  bind:open={menuOpen}
  onOpenChange={(open) => {
    if (!open) {
      onClose();
    }
  }}
  positioning="bottom-end"
  gutter={12}
  portal="body"
  menuClass="menu w-auto sm:w-56 z-[60]"
  triggerClass="p-0 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent border-0 outline-0 shadow-none rounded-full cursor-pointer inline-flex items-center justify-center"
>
  {#snippet trigger()}
    <Avatar 
      name={userDisplayName} 
      src={profile?.avatar_url} 
      size="sm"
      fallback={initials}
      class="hover:ring-2 hover:ring-gray-200 transition-all cursor-pointer"
    />
  {/snippet}
  
  {#snippet children()}
    <!-- User Info Header inside menu -->
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-gray-900 truncate text-sm">{userDisplayName}</p>
        <p class="text-xs text-gray-500 truncate">{user?.email}</p>
      </div>
    </div>
    
    <!-- Menu Items -->
    <div class="py-1">
      <a 
        href="/profile" 
        class="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-white transition-colors min-h-[44px]" 
        onclick={(e: MouseEvent) => {
          e.preventDefault();
          onClose();
          window.location.href = '/profile';
        }}
      >
        <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        {translations.myProfile}
      </a>
      <a 
        href="/orders" 
        class="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-white transition-colors min-h-[44px]" 
        onclick={(e: MouseEvent) => {
          e.preventDefault();
          onClose();
          window.location.href = '/orders';
        }}
      >
        <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {translations.orders}
      </a>
      <a 
        href="/favorites" 
        class="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-white transition-colors min-h-[44px]" 
        onclick={(e: MouseEvent) => {
          e.preventDefault();
          onClose();
          window.location.href = '/favorites';
        }}
      >
        <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {translations.favorites}
      </a>
      {#if !canSell}
        <a 
          href="/sell" 
          class="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors min-h-[44px]" 
          onclick={(e: MouseEvent) => {
            e.preventDefault();
            onClose();
            window.location.href = '/sell';
          }}
        >
          <svg class="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {translations.startSelling}
        </a>
      {/if}
    </div>
    
    <div class="border-t border-gray-200 pt-1">
      <a 
        href="/settings" 
        class="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-white transition-colors min-h-[44px]" 
        onclick={(e: MouseEvent) => {
          e.preventDefault();
          onClose();
          window.location.href = '/settings';
        }}
      >
        <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.50 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {translations.settings}
      </a>
      <button
        onclick={(e: MouseEvent) => {
          e.preventDefault();
          onSignOut();
        }}
        disabled={signingOut}
        class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
      >
        {#if signingOut}
          <svg class="animate-spin w-4 h-4 mr-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {translations.signingOut}
        {:else}
          <svg class="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {translations.signOut}
        {/if}
      </button>
    </div>
  {/snippet}
</Menu>
