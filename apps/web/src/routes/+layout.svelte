<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';
  
  let pathname = $state($page.url.pathname);
  
  $effect(() => {
    pathname = $page.url.pathname;
  });
</script>

<div class="pb-20 sm:pb-0">
  {#key pathname}
    <div in:fade={{ duration: 200, delay: 100 }} out:fade={{ duration: 100 }}>
      <slot />
    </div>
  {/key}
</div>

<BottomNav />