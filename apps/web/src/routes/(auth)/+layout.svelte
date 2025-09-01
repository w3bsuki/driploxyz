<script lang="ts">
  import { page } from '$app/stores';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();
  
  const isSignup = $derived($page.route.id?.includes('signup'));
  const isLogin = $derived($page.route.id?.includes('login'));
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col justify-center px-4 py-6">
  <div class="w-full max-w-sm mx-auto">
    <div class="bg-white shadow-xl rounded-2xl">
      <!-- Header -->
      <div class="px-4 pt-4 pb-2 text-center">
        <a href="/" class="inline-block">
          <h1 class="text-xl font-bold text-[color:var(--text-primary)]">Driplo</h1>
        </a>
      </div>

      <!-- Toggle Tabs -->
      <div class="bg-gray-100 p-1 mx-4 mb-3 rounded-xl flex">
        <a 
          href="/login" 
          class="flex-1 text-center py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-200 {isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]'}"
        >
          Sign In
        </a>
        <a 
          href="/signup" 
          class="flex-1 text-center py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-200 {isSignup ? 'bg-blue-600 text-white shadow-lg' : 'text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]'}"
        >
          Sign Up
        </a>
      </div>

      <!-- Form content -->
      <div class="px-6 pb-6">
        {@render children?.()}
      </div>
    </div>
  </div>
</div>