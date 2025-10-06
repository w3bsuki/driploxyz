<script lang="ts">
  interface Props {
    title?: string;
    price?: string;
    description?: string;
    features?: string[];
    buttonText?: string;
    featured?: boolean;
    onclick?: () => void;
  }

  let {
    title = "Plan",
    price = "$0",
    description = "Basic plan",
    features = [],
    buttonText = "Get Started",
    featured = false,
    onclick
  }: Props = $props();
</script>

<div class="bg-white rounded-[var(--card-radius)] border p-6 {featured ? 'ring-2 ring-blue-500' : ''}">
  <h3 class="text-xl font-semibold mb-2">{title}</h3>
  <div class="text-3xl font-bold mb-4">{price}</div>
  <p class="text-gray-500 mb-6">{description}</p>
  
  {#if features.length > 0}
    <ul class="space-y-2 mb-6">
      {#each features as feature}
        <li class="flex items-center">
          <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          {feature}
        </li>
      {/each}
    </ul>
  {/if}
  
  <button
  class="w-full bg-blue-600 text-white px-4 py-2 rounded-[var(--btn-radius-lg)] hover:bg-blue-700 transition-colors"
    {onclick}
  >
    {buttonText}
  </button>
</div>