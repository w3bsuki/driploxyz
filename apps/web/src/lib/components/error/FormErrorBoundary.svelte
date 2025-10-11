<script lang="ts">
  import type { Snippet } from 'svelte';
  import { enhance } from '$app/forms';
  import { type ErrorDetails } from '$lib/utils/error-handling.svelte';
  import { toast } from '@repo/ui';
  import ErrorBoundary from './ErrorBoundary.svelte';

  interface Props {
    children: Snippet;
    onFormError?: (error: ErrorDetails) => void;
    showFieldErrors?: boolean;
    autoFocus?: boolean;
  }

  let {
    children,
    onFormError,
    showFieldErrors = true,
    autoFocus = true
  }: Props = $props();

  // Form error state
  let formErrors = $state<Record<string, string[]>>({});
  let isSubmitting = $state(false);
  let submitError = $state<ErrorDetails | null>(null);

  // Handle form submission errors
  function handleFormError(error: ErrorDetails) {
    // Parse form validation errors
    if (error.type === 'VALIDATION' && error.context?.fields) {
      formErrors = error.context.fields as Record<string, string[]>;

      // Focus first error field if auto-focus enabled
      if (autoFocus) {
        setTimeout(() => {
          const firstErrorField = document.querySelector('[data-field-error="true"]') as HTMLElement;
          firstErrorField?.focus();
        }, 100);
      }
    } else {
      submitError = error;
    }

    onFormError?.(error);
  }

  // Clear form errors
  const clearFormErrors = () => {
    formErrors = {};
    submitError = null;
  };

  // Enhanced form action
  function enhanceForm(form: HTMLFormElement) {
    return enhance(form, () => {
      // Clear previous errors
      clearFormErrors();
      isSubmitting = true;

      return async ({ result }) => {
        isSubmitting = false;

        if (result.type === 'failure') {
          // Handle validation errors
          if (result.data?.errors) {
            formErrors = result.data.errors;

            // Show general error message
            if (result.data.message) {
              toast.error(result.data.message);
            }
          } else {
            // Handle general form errors
            const errorMessage = result.data?.message || 'Form submission failed';
            handleFormError({
              type: 'VALIDATION',
              severity: 'MEDIUM',
              message: errorMessage,
              userMessage: errorMessage,
              retryable: true,
              timestamp: new Date().toISOString()
            });
          }
        } else if (result.type === 'error') {
          // Handle server errors
          handleFormError({
            type: 'SERVER',
            severity: 'HIGH',
            message: result.error?.message || 'Server error',
            userMessage: 'Something went wrong. Please try again.',
            retryable: true,
            timestamp: new Date().toISOString()
          });
        }
      };
    });
  }

  // Get field error
  function getFieldError(fieldName: string): string[] | undefined {
    return formErrors[fieldName];
  }

  // Check if field has error
  function hasFieldError(fieldName: string): boolean {
    return !!(formErrors[fieldName]?.length > 0);
  }


  // Expose utilities for parent components
  export {
    formErrors,
    isSubmitting,
    submitError,
    getFieldError,
    hasFieldError,
    enhanceForm
  };
</script>

<ErrorBoundary
  onError={handleFormError}
  showToastOnError={false}
  name="FormErrorBoundary"
>
  {#snippet fallback(error)}
    <div class="form-error-container p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="form-error-content text-center max-w-md mx-auto">
        <!-- Icon -->
        <div class="error-icon mb-3 flex justify-center">
          <div class="w-10 h-10 p-2 bg-red-100 rounded-full text-red-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h3 class="error-title text-lg font-semibold text-red-800 mb-2">
          Form Submission Failed
        </h3>

        <!-- Message -->
        <p class="error-message text-sm text-red-700 mb-4">
          {error.userMessage}
        </p>

        <!-- Field errors summary -->
        {#if Object.keys(formErrors).length > 0}
          <div class="field-errors-summary mb-4 p-3 bg-red-100 rounded-lg text-left">
            <h4 class="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
            <ul class="space-y-1 text-xs text-red-700">
              {#each Object.entries(formErrors) as [field, errors]}
                {#each errors as errorMsg}
                  <li class="flex items-start gap-2">
                    <span class="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span><strong>{field}:</strong> {errorMsg}</span>
                  </li>
                {/each}
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Actions -->
        <div class="error-actions flex flex-col sm:flex-row gap-2 justify-center">
          <button
            class="retry-button px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            onclick={() => {
              clearFormErrors();
            }}
          >
            Try again
          </button>

          <button
            class="dismiss-button px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            onclick={clearFormErrors}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  {/snippet}

  {@render children()}
</ErrorBoundary>

<!-- Field error helper component -->
{#if showFieldErrors}
  <div class="field-errors-helper" style="display: none;">
    <!-- This helper provides field error utilities to child components -->
  </div>
{/if}

<style>
  /* Field error styling that can be inherited by child forms */
  :global(.field-error) {
    border-color: var(--status-error-border) !important;
    background-color: var(--status-error-bg);
  }

  :global(.field-error:focus) {
    box-shadow: 0 0 0 2px var(--status-error-border);
  }

  :global(.field-error-message) {
    color: var(--status-error-text);
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: flex;
    align-items-start;
    gap: 0.25rem;
  }

  :global(.field-error-icon) {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  /* Form submission loading state */
  :global(.form-submitting) {
    pointer-events: none;
    opacity: 0.6;
  }

  :global(.form-submitting button[type="submit"]) {
    cursor: not-allowed;
  }
</style>