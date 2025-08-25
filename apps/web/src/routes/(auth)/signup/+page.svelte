<script lang="ts">
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import * as i18n from '@repo/i18n';
  import { browser } from '$app/environment';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  
  import { toasts } from '@repo/ui';
  import { onMount } from 'svelte';
  
  let submitting = $state(false);
  let formData = $state({
    fullName: form?.values?.fullName || '',
    email: form?.values?.email || '',
    password: form?.values?.password || '',
    confirmPassword: form?.values?.confirmPassword || '',
    terms: false
  });

  let lastSuccessEmail = $state('');

  // Handle success and error messages
  $effect(() => {
    if (form?.success && form?.message) {
      toasts.success(form.message, {
        duration: 8000, // Show for 8 seconds
        important: true
      });
      // Store email before clearing form
      lastSuccessEmail = form.email || formData.email || '';
      // Clear form on success - do this outside the effect to avoid loops
      setTimeout(() => {
        formData = {
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          terms: false
        };
      }, 100);
    } else if (form?.errors) {
      // Show error toast for form-level errors
      if (form.errors._form) {
        toasts.error(form.errors._form, {
          duration: 6000
        });
      }
      // Show toast for email errors (like "user already exists")
      if (form.errors.email) {
        toasts.error(form.errors.email, {
          duration: 6000
        });
      }
      // Show toast for other field errors
      if (form.errors.password) {
        toasts.error(`Password: ${form.errors.password}`, {
          duration: 6000
        });
      }
      if (form.errors.fullName) {
        toasts.error(`Name: ${form.errors.fullName}`, {
          duration: 6000
        });
      }
      if (form.errors.terms) {
        toasts.error(form.errors.terms, {
          duration: 6000
        });
      }
    }
  });
</script>

<svelte:head>
  <title>Sign Up - Driplo</title>
  <meta name="description" content="Create your Driplo account" />
</svelte:head>

<div class="space-y-4">

  <!-- Success banner for mobile -->
  {#if form?.success}
    <div class="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
      <div class="flex">
        <div class="shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.23a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Account created successfully! 🎉</h3>
          <div class="mt-2 text-sm text-green-700">
            <p>We've sent a verification email to <strong>{form.email || lastSuccessEmail}</strong>.</p>
            <p class="mt-1">📧 Please check your inbox (and spam folder) to complete your registration.</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if form?.errors?._form}
    <div class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <div class="shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{form.errors._form}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Signup Form -->
  <form 
    method="POST" 
    action="?/signup" 
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update();
        submitting = false;
      };
    }}
  >
    <!-- CSRF Protection -->
    <input type="hidden" name="csrf_token" value={data.csrfToken} />
    <div class="space-y-1">
      <!-- Full Name -->
      <div>
        <label for="fullName" class="block text-sm font-semibold text-gray-700 mb-1 pl-1">
          {i18n.auth_firstName()} {i18n.auth_lastName()}
        </label>
        <div class="p-1">
          <input
          id="fullName"
          name="fullName"
          type="text"
          required
          bind:value={formData.fullName}
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base sm:text-sm"
          placeholder="John Doe"
          />
        </div>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-semibold text-gray-700 mb-1 pl-1">
          {i18n.auth_email()}
        </label>
        <div class="p-1">
          <input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          bind:value={formData.email}
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base sm:text-sm"
          placeholder="john@example.com"
          />
        </div>
      </div>

      <!-- Password Fields -->
      <div>
        <label for="password" class="block text-sm font-semibold text-gray-700 mb-1 pl-1">
          {i18n.auth_password()}
        </label>
        <div class="p-1">
          <input
          id="password"
          name="password"
          type="password"
          autocomplete="new-password"
          required
          bind:value={formData.password}
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base sm:text-sm"
          placeholder="Minimum 8 characters"
          />
        </div>
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-1 pl-1">
          {i18n.auth_confirmPassword()}
        </label>
        <div class="p-1">
          <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autocomplete="new-password"
          required
          bind:value={formData.confirmPassword}
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base sm:text-sm"
          placeholder="Re-enter your password"
          />
        </div>
      </div>

      <!-- Terms Checkbox -->
      <div class="flex items-start">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          bind:checked={formData.terms}
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-sm"
        />
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
          disabled={submitting}
          class="w-full inline-flex items-center justify-center font-semibold rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-75 bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500 px-4 py-2.5 text-sm transition-all duration-200"
        >
          {#if submitting}
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
      class="w-full inline-flex items-center justify-center font-medium rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 focus-visible:ring-gray-500 px-4 py-2 text-sm"
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
      class="w-full inline-flex items-center justify-center font-medium rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 focus-visible:ring-gray-500 px-4 py-2 text-sm"
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