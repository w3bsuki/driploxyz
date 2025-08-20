<script lang="ts">
  interface Props {
    title: string;
    subtitle?: string;
    children?: import('svelte').Snippet;
    class?: string;
  }

  let { 
    title,
    subtitle,
    children,
    class: className = ''
  }: Props = $props();
</script>

<div class="min-h-screen bg-white flex items-center justify-center p-4 {className}">
  <div class="w-full max-w-lg mx-auto">
    <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h1>
        
        {#if subtitle}
          <p class="text-gray-600 text-sm">
            {subtitle}
          </p>
        {/if}
      </div>

      <!-- Content Slot -->
      <div class="space-y-6">
        {@render children?.()}
      </div>
    </div>
  </div>
</div>