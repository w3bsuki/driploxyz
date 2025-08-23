<script lang="ts">
  interface Props {
    isLoggedIn: boolean;
    canSell: boolean;
    translations: {
      browse: string;
      sell: string;
      messages: string;
      dashboard: string;
    };
    class?: string;
  }

  let { 
    isLoggedIn, 
    canSell, 
    translations,
    class: className = ''
  }: Props = $props();
</script>

<nav class="hidden sm:flex items-center space-x-6 {className}">
  <a href="/search" class="text-gray-600 hover:text-gray-900 font-medium">{translations.browse}</a>
  {#if isLoggedIn}
    {#if canSell}
      <a href="/sell" class="text-gray-600 hover:text-gray-900 font-medium">{translations.sell}</a>
    {/if}
    <a href="/messages" class="text-gray-600 hover:text-gray-900 font-medium">{translations.messages}</a>
    <a href="/dashboard" class="text-gray-600 hover:text-gray-900 font-medium">{translations.dashboard}</a>
  {/if}
</nav>