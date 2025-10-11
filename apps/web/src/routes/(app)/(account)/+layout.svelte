<script lang="ts">
  // Account layout - wrap account pages with account-specific UI
  import { page } from '$app/state';

  // Ensure user is authenticated (could add guard here)
  let { children } = $props();
</script>

<div class="account-layout">
  <aside>
    <!-- Account sidebar/nav -->
  </aside>
  <main>
    {@render children()}
  </main>
</div>

<style>
  .account-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
  }
</style>