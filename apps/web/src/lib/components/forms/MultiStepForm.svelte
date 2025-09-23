<script lang="ts">
  import { createFormValidator } from '$lib/utils/form-validation.svelte';
  import { announceStepChange, announceToScreenReader } from '$lib/utils/form-accessibility';
  import { enhance } from '$app/forms';
  import type { ZodSchema } from 'zod';
  import type { SubmitFunction, ActionResult } from '@sveltejs/kit';
  import type { Snippet, Component } from 'svelte';

  interface FormContext {
    currentStepIndex: number;
    totalSteps: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    isSubmitting: boolean;
    validator: ReturnType<typeof createFormValidator> | undefined;
    goToNextStep: () => Promise<void>;
    goToPreviousStep: () => void;
    goToStep: (stepIndex: number) => void;
    handleSubmit: () => Promise<void>;
  }

  interface FormStep {
    id: string;
    title: string;
    description?: string;
    schema: ZodSchema<Record<string, unknown>>;
    component: Component<{ formContext: FormContext; validator: ReturnType<typeof createFormValidator> }>;
  }

  interface Props {
    steps: FormStep[];
    initialValues: Record<string, unknown>;
    action?: string;
    method?: string;
    onStepChange?: (currentStep: number, totalSteps: number) => void;
    onComplete?: (values: Record<string, unknown>) => Promise<void> | void;
    onSuccess?: (result: ActionResult | Record<string, unknown>) => void;
    onError?: (error: ActionResult | Error) => void;
    showProgress?: boolean;
    allowStepBack?: boolean;
    validateOnStepChange?: boolean;
    children?: Snippet<[FormContext]>;
    class?: string;
  }

  let {
    steps,
    initialValues,
    action,
    method = 'POST',
    onStepChange,
    onComplete,
    onSuccess,
    onError,
    showProgress = true,
    allowStepBack = true,
    validateOnStepChange = true,
    children,
    class: className = ''
  }: Props = $props();

  // Multi-step form state
  let currentStepIndex = $state(0);
  let isSubmitting = $state(false);
  let stepValidators = $state<ReturnType<typeof createFormValidator>[]>([]);

  // Initialize validators for each step
  $effect(() => {
    stepValidators = steps.map(step =>
      createFormValidator(initialValues, step.schema, {
        validateOnChange: true,
        validateOnBlur: true
      })
    );
  });

  // Current step derived state
  const currentStep = $derived(steps[currentStepIndex]);
  const currentValidator = $derived(stepValidators[currentStepIndex]);
  const isFirstStep = $derived(currentStepIndex === 0);
  const isLastStep = $derived(currentStepIndex === steps.length - 1);
  const totalSteps = $derived(steps.length);

  // Progress calculation
  const progressPercentage = $derived(
    totalSteps > 1 ? ((currentStepIndex + 1) / totalSteps) * 100 : 100
  );

  // Announce step changes for accessibility
  $effect(() => {
    if (currentStep) {
      announceStepChange(
        {
          id: currentStep.id,
          title: currentStep.title,
          isValid: currentValidator?.isValid || false,
          isComplete: false,
          isCurrent: true
        },
        totalSteps
      );
      onStepChange?.(currentStepIndex + 1, totalSteps);
    }
  });

  // Step navigation functions
  async function goToNextStep() {
    if (!currentValidator || isLastStep) return;

    if (validateOnStepChange) {
      const isValid = await currentValidator.validateForm();
      if (!isValid) {
        announceToScreenReader('Please correct the errors before continuing', 'assertive');
        return;
      }
    }

    currentStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
  }

  function goToPreviousStep() {
    if (!allowStepBack || isFirstStep) return;
    currentStepIndex = Math.max(currentStepIndex - 1, 0);
  }

  function goToStep(stepIndex: number) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;

    // Only allow going to previous steps or current step
    if (allowStepBack && stepIndex <= currentStepIndex) {
      currentStepIndex = stepIndex;
    }
  }

  // Form submission
  async function handleFormSubmit() {
    if (!currentValidator) return;

    // Validate current step
    const isValid = await currentValidator.validateForm();
    if (!isValid) {
      announceToScreenReader('Please correct the errors before submitting', 'assertive');
      return;
    }

    // If it's the last step and we have onComplete handler
    if (isLastStep && onComplete) {
      isSubmitting = true;
      try {
        // Collect all values from all steps
        const allValues = stepValidators.reduce((acc, validator) => {
          return { ...acc, ...validator.formState.values };
        }, {});

        await onComplete(allValues);
        onSuccess?.(allValues);
      } catch (error) {
        onError?.(error);
      } finally {
        isSubmitting = false;
      }
    } else if (!isLastStep) {
      // Move to next step
      await goToNextStep();
    }
  }

  // Enhanced submit function for SvelteKit integration
  const enhanceSubmit: SubmitFunction = ({ formData }) => {
    // Add step information to form data
    formData.append('currentStep', currentStepIndex.toString());
    formData.append('totalSteps', totalSteps.toString());

    // Add all form values from all steps
    stepValidators.forEach((validator) => {
      Object.entries(validator.formState.values).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
    });

    isSubmitting = true;

    return async ({ result, update }) => {
      isSubmitting = false;

      try {
        if (result.type === 'success') {
          onSuccess?.(result);
          // If it's not the last step, go to next step
          if (!isLastStep) {
            await goToNextStep();
          }
        } else if (result.type === 'failure') {
          onError?.(result);
          // Sync errors with current step validator
          if (result.data?.errors && currentValidator) {
            Object.entries(result.data.errors).forEach(([field, error]) => {
              if (field !== '_form' && error) {
                currentValidator.formState.errors[field as keyof typeof currentValidator.formState.errors] = error as string;
                currentValidator.formState.touched[field as keyof typeof currentValidator.formState.touched] = true;
              }
            });
          }
        }

        await update();
      } catch (error) {
        onError?.(error);
      }
    };
  };

  // Get form context for step components
  const formContext: FormContext = $derived({
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    isSubmitting,
    validator: currentValidator,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    handleSubmit: handleFormSubmit
  });
</script>

<div class="multi-step-form {className}">
  {#if showProgress && totalSteps > 1}
    <!-- Progress Bar -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-[color:var(--text-primary)]">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <span class="text-sm text-[color:var(--text-muted)]">
          {Math.round(progressPercentage)}% complete
        </span>
      </div>

      <div class="w-full bg-[color:var(--surface-muted)] rounded-full h-2">
        <div
          class="bg-[color:var(--primary)] h-2 rounded-full transition-all duration-300 ease-out"
          style="width: {progressPercentage}%"
          role="progressbar"
          aria-valuenow={currentStepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label="Form progress"
        ></div>
      </div>

      <!-- Step indicators -->
      <div class="flex justify-between mt-4">
        {#each steps as step, index}
          <div class="flex flex-col items-center">
            <button
              type="button"
              onclick={() => goToStep(index)}
              disabled={!allowStepBack || index > currentStepIndex}
              class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors
                {index === currentStepIndex
                  ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-white'
                  : index < currentStepIndex
                    ? 'border-[color:var(--status-success-border)] bg-[color:var(--status-success-bg)] text-[color:var(--status-success-text)]'
                    : 'border-[color:var(--border-default)] bg-[color:var(--surface-base)] text-[color:var(--text-muted)]'
                }
                {allowStepBack && index <= currentStepIndex ? 'hover:scale-105 focus:scale-105' : ''}
                disabled:cursor-not-allowed"
              aria-label="Go to step {index + 1}: {step.title}"
            >
              {#if index < currentStepIndex}
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              {:else}
                {index + 1}
              {/if}
            </button>
            <span class="mt-2 text-xs text-center text-[color:var(--text-muted)] max-w-20 truncate">
              {step.title}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Current Step Content -->
  <form
    {action}
    {method}
    novalidate
    use:enhance={action ? enhanceSubmit : undefined}
    onsubmit={!action ? (e) => { e.preventDefault(); handleFormSubmit(); } : undefined}
  >
    <div class="step-content">
      {#if currentStep}
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-[color:var(--text-primary)] mb-2">
            {currentStep.title}
          </h2>
          {#if currentStep.description}
            <p class="text-[color:var(--text-muted)]">
              {currentStep.description}
            </p>
          {/if}
        </div>

        <!-- Render step component -->
        {#if currentStep.component}
          <currentStep.component
            {formContext}
            bind:validator={stepValidators[currentStepIndex]}
          />
        {/if}
      {/if}

      <!-- Custom content slot -->
      {#if children}
        {@render children(formContext)}
      {/if}
    </div>

    <!-- Navigation buttons -->
    <div class="flex justify-between items-center mt-8 pt-6 border-t border-[color:var(--border-default)]">
      <div>
        {#if !isFirstStep && allowStepBack}
          <button
            type="button"
            onclick={goToPreviousStep}
            disabled={isSubmitting}
            class="inline-flex items-center px-4 py-2 border border-[color:var(--border-default)] rounded-lg text-sm font-medium text-[color:var(--text-primary)] bg-[color:var(--surface-base)] hover:bg-[color:var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--state-focus)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
        {/if}
      </div>

      <div>
        {#if isLastStep}
          <button
            type="submit"
            disabled={isSubmitting || (currentValidator && !currentValidator.isValid)}
            class="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-[color:var(--primary)] hover:bg-[color:var(--primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--state-focus)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {#if isSubmitting}
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            {:else}
              Complete
            {/if}
          </button>
        {:else}
          <button
            type="button"
            onclick={goToNextStep}
            disabled={isSubmitting || (validateOnStepChange && currentValidator && !currentValidator.isValid)}
            class="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-[color:var(--primary)] hover:bg-[color:var(--primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--state-focus)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        {/if}
      </div>
    </div>
  </form>
</div>

<style>
  .multi-step-form {
    --step-spacing: 2rem;
    max-width: 100%;
  }

  .step-content {
    min-height: 400px;
  }

  @media (max-width: 640px) {
    .step-content {
      min-height: 300px;
    }
  }
</style>