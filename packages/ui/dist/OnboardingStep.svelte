<script lang="ts">
  interface Props {
    title: string;
    subtitle?: string;
    children?: import('svelte').Snippet;
    navigation?: import('svelte').Snippet;
    class?: string;
  }

  let { 
    title,
    subtitle,
    children,
    navigation,
    class: className = ''
  }: Props = $props();
</script>

<div class="fixed inset-0 bg-white flex flex-col {className}">
  <!-- Main content area - scrollable -->
  <div class="flex-1 overflow-y-auto p-4">
    <div class="w-full max-w-lg mx-auto">
      <div class="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20">
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

  <!-- Fixed bottom navigation -->
  {#if navigation}
    <div class="flex-shrink-0 bg-white border-t border-gray-200 p-4">
      <div class="w-full max-w-lg mx-auto">
        {@render navigation()}
      </div>
    </div>
  {/if}
</div>