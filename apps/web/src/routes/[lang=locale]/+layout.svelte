<script lang="ts">
  import { setLanguageTag, type AvailableLanguageTag } from '@repo/i18n';
  import type { LayoutData } from './$types';
  
  interface Props {
    data: LayoutData;
    children?: import('svelte').Snippet;
  }
  
  let { data, children }: Props = $props();
  
  // Set language when component mounts or changes
  $effect(() => {
    setLanguageTag(data.lang as AvailableLanguageTag);
  });
</script>

{#if children}
  {@render children()}
{/if}