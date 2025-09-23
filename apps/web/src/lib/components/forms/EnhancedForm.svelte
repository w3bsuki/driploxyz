<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction, ActionResult } from '@sveltejs/kit';
  import { createFormValidator } from '$lib/utils/form-validation.svelte';
  import type { ZodSchema } from 'zod';
  import type { Snippet } from 'svelte';

  interface FormContext {
    validator: ReturnType<typeof createFormValidator> | null;
    isSubmitting: boolean;
    submitForm: () => Promise<void>;
  }

  interface Props {
    action?: string;
    method?: string;
    schema?: ZodSchema<Record<string, unknown>>;
    initialValues?: Record<string, unknown>;
    onSubmit?: (values: Record<string, unknown>) => Promise<void> | void;
    onSuccess?: (result: ActionResult) => void;
    onError?: (error: ActionResult | Error) => void;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    noValidate?: boolean;
    children: Snippet<[FormContext]>;
    class?: string;
  }

  let {
    action,
    method = 'POST',
    schema,
    initialValues = {},
    onSubmit,
    onSuccess,
    onError,
    validateOnChange = true,
    validateOnBlur = true,
    noValidate = false,
    children,
    class: className = ''
  }: Props = $props();

  // Create form validator if schema is provided
  const validator = schema ? createFormValidator(
    initialValues,
    schema,
    { validateOnChange, validateOnBlur }
  ) : null;

  let formElement = $state<HTMLFormElement>();
  let isSubmitting = $state(false);

  // Enhanced submit function for SvelteKit
  const enhanceSubmit: SubmitFunction = ({ cancel }) => {
    isSubmitting = true;

    // If we have a validator and custom onSubmit, handle client-side
    if (validator && onSubmit) {
      cancel();
      handleClientSubmit();
      return;
    }

    // Otherwise, let SvelteKit handle the form submission
    return async ({ result, update }) => {
      isSubmitting = false;

      try {
        if (result.type === 'success') {
          onSuccess?.(result);
        } else if (result.type === 'failure') {
          onError?.(result);
        }

        await update();
      } catch (error) {
        onError?.(error);
      }
    };
  };

  // Handle client-side form submission
  async function handleClientSubmit() {
    if (!validator || !onSubmit) return;

    try {
      const isValid = await validator.handleSubmit(onSubmit);
      if (isValid) {
        onSuccess?.(validator.formState.values);
      }
    } catch (error) {
      onError?.(error);
    } finally {
      isSubmitting = false;
    }
  }

  // Provide form context to child components
  const formContext: FormContext = $derived({
    validator,
    isSubmitting,
    submitForm: handleClientSubmit
  });

  // Export for parent component access
  export { formContext };
</script>

<form
  bind:this={formElement}
  {action}
  {method}
  class={className}
  novalidate={noValidate}
  use:enhance={enhanceSubmit}
>
  {@render children(formContext)}
</form>