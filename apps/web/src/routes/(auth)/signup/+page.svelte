<script lang="ts">
  import { goto } from '$app/navigation';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { SignupSchema } from '$lib/validation/auth.js';
  import type { PageData, ActionData } from './$types';
  import * as i18n from '@repo/i18n';

  let { data, form: actionResult }: { data: PageData; form: ActionData } = $props();
  
  const { form, errors, constraints, submitting, enhance, message } = superForm(data.form, {
    validators: zodClient(SignupSchema),
    resetForm: false,
    taintedMessage: null,
    validationMethod: 'oninput'
  });
</script>

<svelte:head>
  <title>Sign Up - Driplo</title>
  <meta name="description" content="Create your Driplo account" />
</svelte:head>

<div class="space-y-4">

  {#if $errors._errors}
    <div class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{$errors._errors[0]}</p>
        </div>
      </div>
    </div>
  {/if}

  {#if actionResult?.success}
    <div class="bg-green-50 border border-green-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-800">{actionResult.message || 'Account created successfully!'}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Signup Form -->
  <form method="POST" action="?/signup" use:enhance>
    <div class="space-y-1">
      <!-- Full Name -->
      <div>
        <label for="fullName" class="block text-sm font-semibold text-gray-700 mb-2">
          {i18n.auth_firstName()} {i18n.auth_lastName()}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          bind:value={$form.fullName}
          aria-invalid={$errors.fullName ? 'true' : undefined}
          aria-describedby={$errors.fullName ? 'fullName-error' : undefined}
          class="appearance-none block w-full px-3 py-2 border {$errors.fullName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors text-sm"
          placeholder="John Doe"
          {...$constraints.fullName}
        />
        <div class="mt-1 h-2">
          {#if $errors.fullName}
            <div id="fullName-error" class="text-sm text-red-600 flex items-center gap-1">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>{$errors.fullName}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
          {i18n.auth_email()}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          bind:value={$form.email}
          aria-invalid={$errors.email ? 'true' : undefined}
          aria-describedby={$errors.email ? 'email-error' : undefined}
          class="appearance-none block w-full px-3 py-2 border {$errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors text-sm"
          placeholder="john@example.com"
          {...$constraints.email}
        />
        <div class="mt-1 h-2">
          {#if $errors.email}
            <div id="email-error" class="text-sm text-red-600 flex items-center gap-1">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>{$errors.email}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Password Fields -->
      <div>
        <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
          {i18n.auth_password()}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="new-password"
          required
          bind:value={$form.password}
          aria-invalid={$errors.password ? 'true' : undefined}
          aria-describedby={$errors.password ? 'password-error' : undefined}
          class="appearance-none block w-full px-3 py-2 border {$errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors text-sm"
          placeholder="Minimum 8 characters"
          {...$constraints.password}
        />
        <div class="mt-1 h-2">
          {#if $errors.password}
            <div id="password-error" class="text-sm text-red-600 flex items-center gap-1">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>{$errors.password}</span>
            </div>
          {/if}
        </div>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">
          {i18n.auth_confirmPassword()}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autocomplete="new-password"
          required
          bind:value={$form.confirmPassword}
          aria-invalid={$errors.confirmPassword ? 'true' : undefined}
          aria-describedby={$errors.confirmPassword ? 'confirmPassword-error' : undefined}
          class="appearance-none block w-full px-3 py-2 border {$errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors text-sm"
          placeholder="Re-enter your password"
          {...$constraints.confirmPassword}
        />
        <div class="mt-1 h-2">
          {#if $errors.confirmPassword}
            <div id="confirmPassword-error" class="text-sm text-red-600 flex items-center gap-1">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>{$errors.confirmPassword}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Terms Checkbox -->
      <div class="flex items-start">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          bind:checked={$form.terms}
          aria-invalid={$errors.terms ? 'true' : undefined}
          aria-describedby={$errors.terms ? 'terms-error' : undefined}
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <div class="mt-1 h-2">
          {#if $errors.terms}
            <div id="terms-error" class="text-sm text-red-600 flex items-center gap-1">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>{$errors.terms}</span>
            </div>
          {/if}
        </div>
        <label for="terms" class="ml-2 block text-sm text-gray-900">
          {i18n.auth_termsAgreement()}
          <a href="/terms" class="text-blue-600 hover:text-blue-500">{i18n.auth_termsOfService()}</a>
          {i18n.auth_and()}
          <a href="/privacy" class="text-blue-600 hover:text-blue-500">{i18n.auth_privacyPolicy()}</a>
        </label>
      </div>

      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          disabled={$submitting}
          class="w-full inline-flex items-center justify-center font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-75 bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500 px-4 py-2.5 text-sm transition-all duration-200"
        >
          {#if $submitting}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {i18n.auth_createAccount()}...
          {:else}
            {i18n.auth_signUp()}
          {/if}
        </button>
      </div>
    </div>
  </form>

  <!-- Divider -->
  <div class="relative">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-gray-300"></div>
    </div>
    <div class="relative flex justify-center text-sm">
      <span class="px-2 bg-white text-gray-500">{i18n.auth_orContinueWith()}</span>
    </div>
  </div>

  <!-- Social Signup Options -->
  <div class="grid grid-cols-2 gap-3">
    <button
      class="w-full inline-flex items-center justify-center font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 focus-visible:ring-gray-500 px-4 py-2 text-sm"
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
      class="w-full inline-flex items-center justify-center font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 focus-visible:ring-gray-500 px-4 py-2 text-sm"
      disabled
    >
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      GitHub
    </button>
  </div>

  <div class="text-center text-sm">
    <span class="text-gray-500">{i18n.auth_alreadyHaveAccount()} </span>
    <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
      {i18n.auth_signIn()}
    </a>
  </div>
</div>