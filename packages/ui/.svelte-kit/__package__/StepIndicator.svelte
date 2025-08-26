<script lang="ts">
  interface Step {
    id: number;
    title: string;
    description?: string;
  }

  interface Props {
    steps: Step[];
    current?: number; // Accept both 'current' and 'currentStep'
    currentStep?: number; // For backwards compatibility
    completed?: number; // Accept both 'completed' and 'completedSteps'
    completedSteps?: number[];
    onStepClick?: (step: number) => void;
    variant?: 'default' | 'minimal' | 'compact';
    class?: string;
  }

  let { 
    steps,
    current,
    currentStep: currentStepProp,
    completed,
    completedSteps = [],
    onStepClick,
    variant = 'default',
    class: className = ''
  }: Props = $props();

  // Support both prop names for flexibility
  const currentStep = $derived(current ?? currentStepProp ?? 1);
  const completedStepsArray = $derived(
    completed !== undefined 
      ? Array.from({ length: completed }, (_, i) => i + 1)
      : completedSteps
  );

  function getStepState(stepId: number) {
    if (completedStepsArray.includes(stepId) || stepId < currentStep) {
      return 'completed';
    }
    if (stepId === currentStep) {
      return 'current';
    }
    return 'upcoming';
  }

  function getStepClasses(state: string) {
    // Base size depends on variant
    const sizeClasses = {
      default: 'w-10 h-10 text-sm',
      minimal: 'w-8 h-8 text-xs',
      compact: 'w-6 h-6 text-xs'
    };
    
    const base = `flex items-center justify-center ${sizeClasses[variant]} rounded-full font-medium transition-all duration-200`;
    
    switch (state) {
      case 'completed':
        return `${base} bg-green-500 text-white`;
      case 'current':
        return `${base} bg-black text-white ring-4 ring-black/10`;
      case 'upcoming':
        return `${base} bg-gray-200 text-gray-500`;
      default:
        return base;
    }
  }

  function getLineClasses(stepId: number) {
    const isCompleted = stepId < currentStep || completedStepsArray.includes(stepId);
    return `flex-1 h-0.5 mx-2 transition-all duration-300 ${
      isCompleted ? 'bg-green-500' : 'bg-gray-200'
    }`;
  }

  function handleStepClick(stepId: number) {
    const state = getStepState(stepId);
    if (state === 'completed' && onStepClick) {
      onStepClick(stepId);
    }
  }
</script>

<div class={`step-indicator ${className}`}>
  <!-- Progress Bar -->
  <div class="flex items-center justify-between mb-2">
    {#each steps as step, index}
      {@const state = getStepState(step.id)}
      <div class="flex items-center flex-1 {index < steps.length - 1 ? 'pr-2' : ''}">
        <button
          class={getStepClasses(state)}
          onclick={() => handleStepClick(step.id)}
          disabled={state !== 'completed' || !onStepClick}
          aria-label="Step {step.id}: {step.title}"
          aria-current={state === 'current' ? 'step' : undefined}
        >
          {#if state === 'completed'}
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {:else}
            {step.id}
          {/if}
        </button>
        
        {#if index < steps.length - 1}
          <div class={getLineClasses(step.id)}></div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Step Titles - Mobile optimized, hidden for compact variant -->
  {#if variant !== 'compact'}
    <div class="flex justify-between text-xs gap-1 {variant === 'minimal' ? 'mt-1' : 'mt-2'}">
      {#each steps as step}
        {@const state = getStepState(step.id)}
        <div class="text-center flex-1 min-w-0">
          <p class="font-medium truncate px-1 {state === 'current' ? 'text-gray-900' : 'text-gray-600'}">
            {#if variant === 'minimal'}
              <!-- Show abbreviated titles on mobile for minimal variant -->
              <span class="sm:hidden">
                {#if step.title.includes('&')}
                  {step.title.split('&')[0].substring(0, 5)}
                {:else}
                  {step.title.split(' ')[0].substring(0, 5)}
                {/if}
              </span>
              <span class="hidden sm:inline">{step.title}</span>
            {:else}
              <!-- Default variant shows full titles on larger screens -->
              <span class="hidden sm:inline">{step.title}</span>
              <span class="sm:hidden">
                {#if step.title.includes('&')}
                  {step.title.split('&')[0]}
                {:else}
                  {step.title.split(' ')[0]}
                {/if}
              </span>
            {/if}
          </p>
          {#if step.description && state === 'current' && variant === 'default'}
            <p class="text-gray-500 mt-0.5 hidden sm:block">{step.description}</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .step-indicator {
    user-select: none;
  }
</style>