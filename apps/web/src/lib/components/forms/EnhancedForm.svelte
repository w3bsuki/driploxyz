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
    method?: 'get' | 'post' | 'GET' | 'POST' | 'dialog' | 'DIALOG';
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

  // No local ref needed
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
        onError?.(error instanceof Error ? error : new Error('Unknown error'));
      }
    };
  };

  // Handle client-side form submission
  async function handleClientSubmit() {
    if (!validator || !onSubmit) return;

    try {
      const isValid = await validator.handleSubmit(onSubmit);
      if (isValid) {
        // Create a success-like object for consumers expecting ActionResult
        onSuccess?.({ type: 'success', status: 200, data: validator.formState.values } as unknown as ActionResult);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
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
  type MethodAttr = 'GET' | 'POST' | 'dialog' | 'get' | 'post' | 'DIALOG';
  function normalizeFormMethod(m?: string): MethodAttr {
    const v = m ?? 'POST';
    if (v === 'dialog' || v === 'DIALOG') return v as MethodAttr;
    const upper = v.toUpperCase();
    return (upper === 'GET' || upper === 'POST') ? (upper as MethodAttr) : 'POST';
  }
  const methodAttr: MethodAttr = $derived(normalizeFormMethod(method));
</script>

<form
  {action}
  method={methodAttr}
  class={className}
  novalidate={noValidate}
  use:enhance={enhanceSubmit}
>
  {@render children(formContext)}
</form>