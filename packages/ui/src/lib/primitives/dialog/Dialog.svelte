<script lang="ts">
  import { createDialog } from '@melt-ui/svelte';
  import type { Snippet } from 'svelte';
  import { writable } from 'svelte/store';

  interface Props {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    forceVisible?: boolean;
    portal?: string | HTMLElement;
    preventScroll?: boolean;
    trigger?: Snippet;
    title?: Snippet;
    description?: Snippet;
    children?: Snippet;
    actions?: Snippet;
    class?: string;
  }

  let {
    open = $bindable(false),
    onOpenChange,
    forceVisible = false,
    portal = 'body',
    preventScroll = true,
    trigger,
    title,
    description,
    children,
    actions,
    class: className = ''
  }: Props = $props();

  // Create writable store for Melt UI
  const openStore = writable(open);

  const {
    elements: { trigger: triggerElement, overlay, content, title: titleElement, description: descriptionElement, close },
    states: { open: dialogOpen }
  } = createDialog({
    open: openStore,
    onOpenChange: onOpenChange ? (details) => {
      onOpenChange(details.next);
      return details.next;
    } : undefined,
    forceVisible,
    portal,
    preventScroll
  });

  // Sync bindable prop with store
  $effect(() => {
    openStore.set(open);
  });

  // Update bindable open state when dialog state changes
  $effect(() => {
    open = $dialogOpen;
  });
</script>

<!-- Trigger Button -->
{#if trigger}
  <button 
    use:triggerElement
    class="btn btn-primary min-h-[44px] px-6 py-3 font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors duration-200"
  >
    {@render trigger()}
  </button>
{/if}

<!-- Dialog Portal -->
{#if $dialogOpen}
  <!-- Backdrop/Overlay -->
  <div 
    use:overlay 
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
    style="z-index: 9999;"
  ></div>

  <!-- Dialog Content -->
  <div 
    use:content
    class="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform px-4 focus:outline-none {className}"
    style="z-index: 10000;"
  >
    <div class="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
      <!-- Header Section -->
      <div class="px-6 pt-6 pb-4">
        {#if title}
          <h2 
            use:titleElement
            class="text-lg font-semibold text-gray-900 leading-6"
          >
            {@render title()}
          </h2>
        {/if}
        
        {#if description}
          <p 
            use:descriptionElement
            class="mt-2 text-sm text-gray-600 leading-5"
          >
            {@render description()}
          </p>
        {/if}
      </div>

      <!-- Body Content -->
      {#if children}
        <div class="px-6 pb-4">
          {@render children()}
        </div>
      {/if}

      <!-- Actions Section -->
      <div class="bg-gray-50 px-6 py-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2">
        <!-- Default Cancel Button -->
        <button 
          use:close
          class="btn btn-ghost min-h-[36px] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
        
        <!-- Custom Actions -->
        {#if actions}
          {@render actions()}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* Ensure proper stacking and smooth animations */
  :global([data-dialog-overlay]) {
    animation: fade-in 200ms cubic-bezier(0, 0, 0.2, 1);
  }
  
  :global([data-dialog-content]) {
    animation: dialog-in 200ms cubic-bezier(0, 0, 0.2, 1);
  }
  
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes dialog-in {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  /* Mobile-first responsive design */
  @media (max-width: 640px) {
    :global([data-dialog-content]) {
      width: calc(100vw - 2rem);
      max-width: none;
    }
    
    /* Stack buttons vertically on mobile for better touch targets */
    .flex-col-reverse {
      gap: 0.75rem;
    }
    
    .flex-col-reverse button {
      min-height: 44px; /* Ensure 44px touch targets on mobile */
    }
  }
</style>