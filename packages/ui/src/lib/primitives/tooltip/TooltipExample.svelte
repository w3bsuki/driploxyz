<script lang="ts">
  import { Tooltip } from './index';
  
  let customTooltipOpen = $state(false);
</script>

<div class="p-8 space-y-8 max-w-4xl mx-auto">
  <div class="space-y-4">
    <h2 class="text-2xl font-semibold text-gray-900">
      Tooltip Component Examples
    </h2>
    <p class="text-[color:var(--text-secondary)] text-base">
      Accessible, mobile-friendly tooltips built with Melt UI and following Driplo's design system.
    </p>
  </div>

  <!-- Basic Usage -->
  <section class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Basic Usage</h3>
    <div class="flex items-center gap-4">
      <Tooltip content="This is a helpful tooltip">
        {#snippet trigger()}
          <button class="btn btn-primary">
            Hover me
          </button>
        {/snippet}
      </Tooltip>
      
      <Tooltip content="Information about this feature">
        {#snippet trigger()}
          <div class="w-5 h-5 rounded-full bg-[color:var(--blue-500)] text-white flex items-center justify-center text-xs cursor-help">
            ?
          </div>
        {/snippet}
      </Tooltip>
    </div>
  </section>

  <!-- Positioning -->
  <section class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Positioning</h3>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-8">
      <Tooltip content="Top tooltip" positioning={{ side: 'top' }}>
        {#snippet trigger()}
          <button class="btn btn-secondary w-full">Top</button>
        {/snippet}
      </Tooltip>
      
      <Tooltip content="Right tooltip" positioning={{ side: 'right' }}>
        {#snippet trigger()}
          <button class="btn btn-secondary w-full">Right</button>
        {/snippet}
      </Tooltip>
      
      <Tooltip content="Bottom tooltip" positioning={{ side: 'bottom' }}>
        {#snippet trigger()}
          <button class="btn btn-secondary w-full">Bottom</button>
        {/snippet}
      </Tooltip>
      
      <Tooltip content="Left tooltip" positioning={{ side: 'left' }}>
        {#snippet trigger()}
          <button class="btn btn-secondary w-full">Left</button>
        {/snippet}
      </Tooltip>
    </div>
  </section>

  <!-- Custom Delays -->
  <section class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Custom Delays</h3>
    <div class="flex items-center gap-4">
      <Tooltip 
        content="Appears quickly (100ms delay)" 
        openDelay={100}
        closeDelay={100}
      >
        {#snippet trigger()}
          <button class="btn btn-ghost">Fast tooltip</button>
        {/snippet}
      </Tooltip>
      
      <Tooltip 
        content="Appears slowly (1500ms delay)" 
        openDelay={1500}
        closeDelay={500}
      >
        {#snippet trigger()}
          <button class="btn btn-ghost">Slow tooltip</button>
        {/snippet}
      </Tooltip>
    </div>
  </section>

  <!-- Touch/Mobile Behavior -->
  <section class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Touch/Mobile Behavior</h3>
    <div class="flex items-center gap-4">
      <Tooltip 
        content="Tap to toggle on mobile devices" 
        forceTouch={true}
      >
        {#snippet trigger()}
          <button class="btn btn-primary">
            Touch-enabled
          </button>
        {/snippet}
      </Tooltip>
      
      <Tooltip 
        content="Standard hover behavior (may not work well on touch)"
      >
        {#snippet trigger()}
          <button class="btn btn-secondary">
            Hover only
          </button>
        {/snippet}
      </Tooltip>
    </div>
  </section>

  <!-- Controlled State -->
  <section class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Controlled State</h3>
    <div class="flex items-center gap-4">
      <Tooltip 
        content="This tooltip is controlled externally"
        bind:open={customTooltipOpen}
      >
        {#snippet trigger()}
          <button class="btn btn-ghost">
            Controlled tooltip
          </button>
        {/snippet}
      </Tooltip>
      
      <button 
        class="btn btn-primary"
        onclick={() => customTooltipOpen = !customTooltipOpen}
      >
        Toggle tooltip
      </button>
    </div>
  </section>

  <!-- Custom Styling -->
  <section class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Custom Styling</h3>
    <div class="flex items-center gap-4">
      <Tooltip 
        content="Custom styled tooltip with success colors"
        tooltipClass="!bg-[color:var(--green-500)] !text-white !border-[color:var(--green-600)]"
        arrowClass="!fill-[color:var(--green-500)] !border-[color:var(--green-600)]"
      >
        {#snippet trigger()}
          <button class="btn btn-ghost">Success tooltip</button>
        {/snippet}
      </Tooltip>
      
      <Tooltip 
        content="Warning tooltip with orange styling"
        tooltipClass="!bg-[color:var(--orange-100)] !text-[color:var(--orange-900)] !border-[color:var(--orange-300)]"
        arrowClass="!fill-[color:var(--orange-100)] !border-[color:var(--orange-300)]"
      >
        {#snippet trigger()}
          <button class="btn btn-ghost">Warning tooltip</button>
        {/snippet}
      </Tooltip>
    </div>
  </section>

  <!-- Disabled State -->
  <section class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Disabled State</h3>
    <div class="flex items-center gap-4">
      <Tooltip 
        content="This tooltip won't show because it's disabled"
        disabled={true}
      >
        {#snippet trigger()}
          <button class="btn btn-secondary opacity-50 cursor-not-allowed">
            Disabled tooltip
          </button>
        {/snippet}
      </Tooltip>
    </div>
  </section>

  <!-- Long Content -->
  <section class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Long Content</h3>
    <div class="flex items-center gap-4">
      <Tooltip content="This is a much longer tooltip that demonstrates how the component handles text wrapping and maintains readability even with more substantial amounts of content that need to be displayed to the user.">
        {#snippet trigger()}
          <button class="btn btn-ghost">Long tooltip</button>
        {/snippet}
      </Tooltip>
    </div>
  </section>

  <!-- Accessibility Notes -->
  <section class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900">Accessibility Features</h3>
    <ul class="text-[color:var(--text-secondary)] text-sm space-y-2 ml-4">
      <li>• Proper ARIA attributes (<code>role="tooltip"</code>, <code>aria-describedby</code>)</li>
      <li>• Keyboard navigation support (Enter/Space to toggle on touch devices)</li>
      <li>• Focus management and escape key handling</li>
      <li>• High contrast mode support</li>
      <li>• Reduced motion preferences respected</li>
      <li>• Touch-friendly 44px minimum touch targets</li>
      <li>• Mobile-optimized font sizes (16px to prevent zoom)</li>
    </ul>
  </section>
</div>

<style>
  code {
    background-color: var(--gray-100);
    color: var(--text-primary);
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-family: 'SF Mono', Consolas, monospace;
  }
</style>