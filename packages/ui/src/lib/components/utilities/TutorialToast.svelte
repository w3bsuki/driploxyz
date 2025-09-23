<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
  interface Props {
    step: number;
    totalSteps: number;
    title: string;
    description: string;
    targetElement?: string; // CSS selector for element to point to
    position?: 'top' | 'bottom' | 'left' | 'right';
    onDismiss?: () => void;
    onNext?: () => void;
  }

  let {
    step,
    totalSteps,
    title,
    description,
    targetElement,
    position = 'bottom',
    onDismiss,
    onNext
  }: Props = $props();

  let show = $state(true);
  let targetRect = $state<DOMRect | null>(null);
  let toastElement = $state<HTMLDivElement | null>(null);

  onMount(() => {
    if (targetElement) {
      const element = document.querySelector(targetElement);
      if (element) {
        targetRect = element.getBoundingClientRect();
        
        // Add pulsing highlight to target element
        element.classList.add('tutorial-highlight');
        
        return () => {
          element.classList.remove('tutorial-highlight');
        };
      }
    }
  });

  function handleDismiss() {
    show = false;
    setTimeout(() => onDismiss?.(), 300);
  }

  function handleNext() {
    show = false;
    setTimeout(() => onNext?.(), 300);
  }

  // Calculate toast position based on target element
  const getToastStyles = () => {
    if (!targetRect) return '';
    
    const spacing = 16;
    let styles = '';
    
    switch (position) {
      case 'top':
        styles = `bottom: ${window.innerHeight - targetRect.top + spacing}px; left: ${targetRect.left}px;`;
        break;
      case 'bottom':
        styles = `top: ${targetRect.bottom + spacing}px; left: ${targetRect.left}px;`;
        break;
      case 'left':
        styles = `top: ${targetRect.top}px; right: ${window.innerWidth - targetRect.left + spacing}px;`;
        break;
      case 'right':
        styles = `top: ${targetRect.top}px; left: ${targetRect.right + spacing}px;`;
        break;
    }
    
    return styles;
  };
</script>

{#if show}
  <div
    bind:this={toastElement}
    class="tutorial-toast {position}"
    style={targetRect ? getToastStyles() : ''}
    transition:fly={{ y: 20, duration: 300 }}
  >
    {#if targetRect}
      <!-- Arrow pointing to element -->
      <div class="tutorial-arrow {position}"></div>
    {/if}
    
    <div class="flex items-start space-x-3">
      <!-- Step indicator -->
      <div class="flex-shrink-0">
        <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {step}
        </div>
      </div>
      
      <!-- Content -->
      <div class="flex-1">
        <h4 class="font-semibold text-gray-900 mb-1">{title}</h4>
        <p class="text-sm text-gray-500">{description}</p>
        
        <!-- Progress -->
        <div class="flex items-center justify-between mt-3">
          <div class="flex space-x-1">
            {#each Array(totalSteps) as _, i}
              <div 
                class="w-1.5 h-1.5 rounded-full transition-colors {i + 1 <= step ? 'bg-blue-500' : 'bg-gray-300'}"
              ></div>
            {/each}
          </div>
          
          <!-- Actions -->
          <div class="flex space-x-2">
            <button
              onclick={handleDismiss}
              class="text-xs text-gray-500 hover:text-gray-900"
            >
              Skip all
            </button>
            {#if step < totalSteps}
              <button
                onclick={handleNext}
                class="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Next →
              </button>
            {:else}
              <button
                onclick={handleDismiss}
                class="text-xs font-medium text-green-600 hover:text-green-700"
              >
                Got it! ✓
              </button>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Close button -->
      <button
        onclick={handleDismiss}
        class="flex-shrink-0 text-gray-400 hover:text-gray-500"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
{/if}

<style>
  .tutorial-toast {
    position: fixed;
    z-index: 60;
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-width: 380px;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  .tutorial-toast.bottom {
    transform-origin: top center;
  }
  
  .tutorial-toast.top {
    transform-origin: bottom center;
  }
  
  /* Arrow styles */
  .tutorial-arrow {
    position: absolute;
    width: 12px;
    height: 12px;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transform: rotate(45deg);
  }
  
  .tutorial-arrow.top {
    bottom: -7px;
    left: 24px;
    border-top: none;
    border-left: none;
  }
  
  .tutorial-arrow.bottom {
    top: -7px;
    left: 24px;
    border-bottom: none;
    border-right: none;
  }
  
  .tutorial-arrow.left {
    right: -7px;
    top: 24px;
    border-left: none;
    border-bottom: none;
  }
  
  .tutorial-arrow.right {
    left: -7px;
    top: 24px;
    border-right: none;
    border-top: none;
  }
  
  /* Highlight animation for target elements */
  :global(.tutorial-highlight) {
    position: relative;
    animation: tutorial-pulse 2s infinite;
  }
  
  :global(.tutorial-highlight::before) {
    content: '';
    position: absolute;
    inset: -4px;
    border: 2px solid #3B82F6;
    border-radius: 8px;
    pointer-events: none;
    animation: tutorial-pulse-border 2s infinite;
  }
  
  @keyframes tutorial-pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }
  
  @keyframes tutorial-pulse-border {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
</style>