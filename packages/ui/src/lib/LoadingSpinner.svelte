<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    fullscreen?: boolean;
    class?: string;
  }

  let { 
    size = 'md', 
    color = 'currentColor',
    fullscreen = false,
    class: className = ''
  }: Props = $props();

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  // Allow custom class to override size
  const sizeClass = className || sizes[size];
</script>

{#if fullscreen}
  <div class="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-none">
    <div class="{sizeClass}">
      <svg 
        class="animate-spin" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          class="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke={color} 
          stroke-width="3"
        />
        <path 
          class="opacity-75" 
          fill={color} 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  </div>
{:else}
  <div class="{sizeClass}">
    <svg 
      class="animate-spin" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        class="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke={color} 
        stroke-width="3"
      />
      <path 
        class="opacity-75" 
        fill={color} 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
{/if}

<style>
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 0.6s linear infinite;
  }
</style>