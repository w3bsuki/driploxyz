<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import * as i18n from '@repo/i18n';
  import { page } from '$app/state';
  import { browser } from '$app/environment';
  import { LoginSchema } from '$lib/validation/auth';
  import { createFormValidator } from '$lib/utils/form-validation.svelte';
  import { announceToScreenReader, focusFirstErrorField } from '$lib/utils/form-accessibility';
  import FormField from '$lib/components/forms/FormField.svelte';
  import { toasts } from '@repo/ui';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let submitting = $state(false);

  // Initialize form validator
  const initialValues = {
    email: form?.values?.email || '',
    password: form?.values?.password || ''
  };

  const validator = createFormValidator(initialValues, LoginSchema, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300
  });

  $effect(() => {
    // Check for email verification success - handle both parameters for compatibility
    if (page.url.searchParams.get('email_verified') === 'true' || page.url.searchParams.get('verified') === 'true') {
      const message = page.url.searchParams.get('message');
      if (message) {
        toasts.success(decodeURIComponent(message));
      } else {
        toasts.success('Email verified successfully! Please sign in to continue.');
      }

      // Pre-fill email if provided
      const email = page.url.searchParams.get('email');
      if (email) {
        formData.email = decodeURIComponent(email);
      }
    }

    // Check for error messages
    const error = page.url.searchParams.get('error');
    if (error) {
      // Don't show verification_failed or authentication_failed errors as they're confusing after successful email verification
      if (error !== 'verification_failed' && error !== 'authentication_failed') {
        toasts.error(decodeURIComponent(error));
      }
    }
  });

  // Track previous form state to prevent duplicate notifications
  let prevFormErrorsKey = $state('');

  // Handle form errors with toast - prevent infinite loops
  $effect(() => {
    // Create a unique key from current form errors to detect actual changes
    const currentFormErrorsKey = form?.errors
      ? JSON.stringify({
          _form: form.errors._form,
          email: form.errors.email,
          password: form.errors.password
        })
      : '';

    // Only show toasts if form errors actually changed (not just form object reference)
    if (currentFormErrorsKey && currentFormErrorsKey !== prevFormErrorsKey) {
      // Sync server errors with client validator
      if (form?.errors) {
        Object.entries(form.errors).forEach(([field, error]) => {
          if (field !== '_form' && error) {
            validator.formState.errors[field as keyof typeof validator.formState.errors] = error;
            validator.formState.touched[field as keyof typeof validator.formState.touched] = true;
          }
        });

        if (form.errors._form) {
          toasts.error(form.errors._form, {
            duration: 6000
          });
          announceToScreenReader(`Login error: ${form.errors._form}`, 'assertive');
        }

        // Focus first field with error
        focusFirstErrorField(form.errors);
      }
    }

    // Update the previous key after processing
    prevFormErrorsKey = currentFormErrorsKey;
  });

  // Get field props for form binding
  const emailField = $derived(validator.getFieldProps('email'));
  const passwordField = $derived(validator.getFieldProps('password'));
</script>

<svelte:head>
  <title>Login - Driplo</title>
  <meta name="description" content="Sign in to your Driplo account" />
</svelte:head>

<div class="space-y-4">

  {#if data.errorMessage}
    <div class="bg-[color:var(--status-error-bg)] border border-[color:var(--status-error-border)] rounded-md p-4">
      <div class="flex">
        <div class="shrink-0">
          <svg class="h-5 w-5 text-[color:var(--status-error-text)]" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-[color:var(--status-error-text)]">{data.errorMessage}</p>
        </div>
      </div>
    </div>
  {/if}



  <!-- Form errors now handled by toast system only -->

  <!-- Email/Password Form -->
  <form
    method="POST"
    action="?/signin"
    novalidate
    use:enhance={() => {
      submitting = true;

      // Validate form before submission if client-side validation is available
      if (browser) {
        validator.formState.hasBeenSubmitted = true;
        // Mark all fields as touched for validation display
        Object.keys(validator.formState.touched).forEach(key => {
          validator.formState.touched[key as keyof typeof validator.formState.touched] = true;
        });
      }

      return async ({ result, update }) => {
        // Always reset submitting state
        submitting = false;

        // Let SvelteKit handle all results naturally
        await update({ reset: false });
      };
    }}
  >
    
    <div class="space-y-1">
      <div class="p-1">
        <FormField
          label={i18n.auth_email()}
          fieldName="email"
          fieldState={emailField}
          type="email"
          required
          placeholder="Enter your email"
          autocomplete="email"
        />
      </div>

      <div class="p-1">
        <FormField
          label={i18n.auth_password()}
          fieldName="password"
          fieldState={passwordField}
          type="password"
          required
          placeholder="Enter your password"
          autocomplete="current-password"
        />
      </div>

      <div class="flex items-center justify-between">
        <div class="text-sm">
          <a href="/forgot-password" class="link font-medium">
            {i18n.auth_forgotPassword()}
          </a>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting || (browser && validator.hasErrors)}
          class="w-full inline-flex items-center justify-center font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-75 bg-[color:var(--primary)] hover:bg-[color:var(--primary-600)] text-[color:var(--primary-fg)] focus-visible:ring-[color:var(--state-focus)] px-4 py-2.5 text-sm transition-colors duration-200"
          aria-describedby="submit-status"
        >
          {#if submitting}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {i18n.loading()}
          {:else}
            {i18n.auth_signIn()}
          {/if}
        </button>
        {#if browser && validator.hasErrors && validator.formState.hasBeenSubmitted}
          <div id="submit-status" class="mt-2 text-sm text-[color:var(--status-error-text)]" role="alert" aria-live="polite">
            Please correct the errors above before submitting.
          </div>
        {/if}
      </div>
    </div>
  </form>

  <!-- Divider -->
  <div class="relative">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-[color:var(--border-default)]"></div>
    </div>
    <div class="relative flex justify-center text-sm">
      <span class="px-2 bg-[color:var(--surface-base)] text-[color:var(--text-muted)]">{i18n.auth_orContinueWith()}</span>
    </div>
  </div>

  <!-- Social Login Options -->
  <div class="grid grid-cols-2 gap-3">
    <button
      class="w-full inline-flex items-center justify-center font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[color:var(--border-default)] bg-[color:var(--surface-base)] text-[color:var(--text-primary)] focus-visible:ring-[color:var(--state-focus)] px-4 py-2 text-sm"
      disabled
    >
      <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Google
    </button>
    <button
      class="w-full inline-flex items-center justify-center font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[color:var(--border-default)] bg-[color:var(--surface-base)] text-[color:var(--text-primary)] focus-visible:ring-[color:var(--state-focus)] px-4 py-2 text-sm"
      disabled
    >
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      GitHub
    </button>
  </div>

  <div class="text-center text-sm">
    <span class="text-[color:var(--text-muted)]">{i18n.auth_dontHaveAccount()} </span>
    <a href="/signup" class="link font-medium">
      {i18n.auth_signUp()}
    </a>
  </div>
</div>