<script lang="ts">
  import { page } from '$app/stores';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { data, children }: { data: LayoutData; children?: Snippet } = $props();
  
  const isSignup = $derived($page.route.id?.includes('signup'));
  const isLogin = $derived($page.route.id?.includes('login'));
</script>

<div class="min-h-screen bg-gray-100 flex flex-col justify-center px-4 py-6">
  <div class="w-full max-w-sm mx-auto">
    <div class="bg-white shadow-xl rounded-2xl overflow-hidden">
      <!-- Header -->
      <div class="px-5 pt-5 pb-2 text-center">
        <a href="/" class="inline-block">
          <h1 class="text-xl font-bold text-gray-900">Driplo</h1>
        </a>
      </div>

      <!-- Toggle Tabs -->
      <div class="bg-gray-50 p-1 mx-4 mb-3 rounded-xl flex">
        <a 
          href="/login" 
          class="flex-1 text-center py-2 px-2 rounded-lg text-sm font-medium transition-all {isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}"
        >
          Sign In
        </a>
        <a 
          href="/signup" 
          class="flex-1 text-center py-2 px-2 rounded-lg text-sm font-medium transition-all {isSignup ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}"
        >
          Sign Up
        </a>
      </div>

      <!-- Form content -->
      <div class="px-5 pb-5">
        {@render children?.()}
      </div>
    </div>
  </div>
</div>