<script lang="ts">
  interface Step {
    id: number;
    title: string;
    description?: string;
  }

  interface Props {
    steps: Step[];
    currentStep: number;
    completedSteps?: number[];
    onStepClick?: (step: number) => void;
  }

  let {
    steps,
    currentStep,
    completedSteps = [],
    onStepClick
  }: Props = $props();

  function isStepAccessible(stepId: number): boolean {
    return stepId <= currentStep || completedSteps.includes(stepId - 1);
  }
</script>

<div class="w-full">
  <!-- Mobile View -->
  <div class="flex items-center justify-between sm:hidden">
    <div class="flex items-center space-x-2">
      <span class="text-sm text-gray-500">Step</span>
      <span class="text-sm font-medium">{currentStep} of {steps.length}</span>
    </div>
    <div class="flex-1 mx-4">
      <div class="bg-gray-200 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style="width: {(currentStep / steps.length) * 100}%"
        />
      </div>
    </div>
  </div>

  <!-- Desktop View -->
  <div class="hidden sm:flex items-center justify-between">
    {#each steps as step, index}
      {@const isActive = step.id === currentStep}
      {@const isCompleted = completedSteps.includes(step.id)}
      {@const isAccessible = isStepAccessible(step.id)}
      
      <div class="flex items-center flex-1">
        <button
          type="button"
          class="flex items-center"
          onclick={() => isAccessible && onStepClick?.(step.id)}
          disabled={!isAccessible}
        >
          <div class="relative flex items-center justify-center">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                {isActive ? 'bg-blue-600 text-white' : 
                 isCompleted ? 'bg-green-500 text-white' : 
                 isAccessible ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 
                 'bg-gray-100 text-gray-400'}"
            >
              {#if isCompleted}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              {:else}
                {step.id}
              {/if}
            </div>
          </div>
          
          <div class="ml-3 text-left">
            <p class="text-sm font-medium {isActive ? 'text-gray-900' : 'text-gray-500'}">
              {step.title}
            </p>
            {#if step.description}
              <p class="text-xs text-gray-500 hidden lg:block">
                {step.description}
              </p>
            {/if}
          </div>
        </button>

        {#if index < steps.length - 1}
          <div class="flex-1 mx-4">
            <div class="h-0.5 bg-gray-200">
              <div 
                class="h-0.5 transition-all duration-300
                  {completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-200'}"
                style="width: {completedSteps.includes(step.id) ? '100%' : '0%'}"
              />
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>