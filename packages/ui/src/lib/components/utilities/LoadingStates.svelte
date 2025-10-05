<script lang="ts">
  interface Props {
    type?: 'skeleton' | 'spinner' | 'pulse' | 'dots';
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'card' | 'list' | 'product';
    count?: number;
    class?: string;
  }

  let {
    type = 'skeleton',
    size = 'md',
    variant = 'default',
    count = 1,
    class: className = ''
  }: Props = $props();

  const sizeClasses = {
    sm: {
      skeleton: 'h-4 w-4',
      spinner: 'w-4 h-4',
      pulse: 'w-4 h-4',
      dots: 'w-8 h-2'
    },
    md: {
      skeleton: 'h-6 w-6',
      spinner: 'w-6 h-6',
      pulse: 'w-6 h-6',
      dots: 'w-12 h-3'
    },
    lg: {
      skeleton: 'h-8 w-8',
      spinner: 'w-8 h-8',
      pulse: 'w-8 h-8',
      dots: 'w-16 h-4'
    }
  };

  const variantClasses = {
    default: '',
    card: 'rounded-lg',
    list: 'rounded',
    product: 'rounded-xl'
  };
</script>

{#if type === 'skeleton'}
  <div class="space-y-3 {className}">
    {#each Array(count) as _, i (i)}
      <div class="skeleton {sizeClasses[size].skeleton} {variantClasses[variant]}"></div>
    {/each}
  </div>
{:else if type === 'spinner'}
  <div class="flex items-center justify-center {className}">
    <div 
      class="animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 {sizeClasses[size].spinner}"
      role="status"
      aria-label="Loading"
    >
      <span class="sr-only">Loading...</span>
    </div>
  </div>
{:else if type === 'pulse'}
  <div class="flex items-center justify-center {className}">
    <div 
      class="pulse-animation bg-gray-200 rounded-full {sizeClasses[size].pulse}"
      role="status"
      aria-label="Loading"
    >
      <span class="sr-only">Loading...</span>
    </div>
  </div>
{:else if type === 'dots'}
  <div class="flex items-center justify-center space-x-1 {className}">
    {#each Array(3) as _, i (i)}
      <div 
        class="bg-gray-400 rounded-full animate-bounce {sizeClasses[size].dots}"
        style="animation-delay: {i * 0.1}s"
        role="status"
        aria-label="Loading"
      >
        <span class="sr-only">Loading...</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .pulse-animation {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .animate-bounce {
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .skeleton {
    background: linear-gradient(
      90deg,
      var(--surface-muted) 25%,
      var(--surface-subtle) 50%,
      var(--surface-muted) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>