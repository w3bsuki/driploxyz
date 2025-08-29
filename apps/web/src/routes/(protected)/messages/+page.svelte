<!-- Use the clean modular version -->
<script lang="ts">
  import ModularMessages from './ModularMessages.svelte';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Messages - Driplo</title>
</svelte:head>

<ModularMessages {data} />