<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  // This page should never render - it's just a redirect
  // But we add a loading state just in case
  onMount(() => {
    // Fallback redirect in case server-side redirect fails
    goto('/login');
  });
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
    <p class="mt-4 text-gray-600">Loading profile...</p>
  </div>
</div>