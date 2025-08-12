<script lang="ts">
  import { Button } from '@repo/ui';
  
  interface Props {
    showSearch?: boolean;
    minimal?: boolean;
  }
  
  let { showSearch = false, minimal = false }: Props = $props();
  let mobileMenuOpen = $state(false);
</script>

<!-- Unified Header for all pages -->
<header class="bg-white shadow-sm sticky top-0 z-40">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-14 sm:h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center">
        <span class="text-xl sm:text-2xl font-bold text-gray-900">Driplo</span>
      </a>
      
      <!-- Desktop Navigation -->
      <nav class="hidden sm:flex items-center space-x-6">
        <a href="/search" class="text-gray-600 hover:text-gray-900 font-medium">Browse</a>
        <a href="/sell" class="text-gray-600 hover:text-gray-900 font-medium">Sell</a>
        <a href="/messages" class="text-gray-600 hover:text-gray-900 font-medium">Messages</a>
        <a href="/dashboard" class="text-gray-600 hover:text-gray-900 font-medium">Dashboard</a>
        <div class="flex items-center space-x-2">
          <Button variant="outline" size="sm" onclick={() => window.location.href = '/auth/login'}>
            Sign In
          </Button>
          <Button size="sm" onclick={() => window.location.href = '/auth/login'}>
            Sign Up
          </Button>
        </div>
      </nav>
      
      <!-- Mobile Menu Button -->
      <button
        onclick={() => mobileMenuOpen = !mobileMenuOpen}
        class="sm:hidden p-2 text-gray-600 hover:text-gray-900"
        aria-label="Toggle menu"
      >
        {#if mobileMenuOpen}
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>
    </div>
    
    <!-- Mobile Menu -->
    {#if mobileMenuOpen}
      <div class="sm:hidden border-t border-gray-200 py-3">
        <nav class="space-y-2">
          <a href="/search" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium">Browse</a>
          <a href="/sell" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium">Sell</a>
          <a href="/messages" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium">Messages</a>
          <a href="/dashboard" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium">Dashboard</a>
          <div class="border-t border-gray-200 pt-3 mt-3 space-y-2">
            <a href="/auth/login" class="block px-3 py-2 text-gray-600 hover:text-gray-900 font-medium">
              Sign In
            </a>
            <a href="/auth/login" class="block px-3 py-2 bg-black text-white rounded-lg text-center font-medium">
              Sign Up
            </a>
          </div>
        </nav>
      </div>
    {/if}
  </div>
</header>