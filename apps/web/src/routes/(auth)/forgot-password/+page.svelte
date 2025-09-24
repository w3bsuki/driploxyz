<script lang="ts">
  import { Button } from '@repo/ui';
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  
  let loading = $state(false);
  let email = $state('');
</script>

<svelte:head>
  <title>Reset Password - Driplo</title>
  <meta name="description" content="Reset your Driplo account password" />
</svelte:head>

<div class="space-y-6">
  <div class="text-center">
    <h2 class="text-2xl font-bold text-[color:var(--text-primary)]">Reset your password</h2>
    <p class="mt-2 text-sm text-[color:var(--text-secondary)]">
      Enter your email and we'll send you a link to reset your password
    </p>
  </div>

  {#if form?.error}
    <div class="bg-[color:var(--status-error-bg)] border border-[color:var(--status-error-border)] rounded-md p-4">
      <div class="flex">
        <div class="shrink-0">
          <svg class="h-5 w-5 text-[color:var(--status-error-text)]" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-[color:var(--status-error-text)]">{form.error}</p>
        </div>
      </div>
    </div>
  {/if}

  {#if form?.success}
    <div class="bg-[color:var(--status-success-bg)] border border-[color:var(--status-success-border)] rounded-md p-4">
      <div class="flex">
        <div class="shrink-0">
          <svg class="h-5 w-5 text-[color:var(--status-success-text)]" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-[color:var(--status-success-text)]">Password reset link sent! Check your email for instructions.</p>
        </div>
      </div>
    </div>
  {:else}
    <form method="POST" action="?/reset" use:enhance={() => {
      loading = true;
      return async ({ update }) => {
        loading = false;
        await update();
      };
    }}>
      <!-- CSRF Protection -->
      <input type="hidden" name="csrf_token" value={data.csrfToken} />
      
      <div class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-[color:var(--text-primary)]">
            Email address
          </label>
          <div class="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              bind:value={email}
              class="appearance-none block w-full px-3 py-2 border border-[color:var(--border-default)] rounded-md placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-[color:var(--state-focus)] focus:border-[color:var(--state-focus)] sm:text-sm"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading || !email}
            class="w-full"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </div>

        <div class="text-center">
          <a href="/login" class="link text-sm font-medium">
            Back to sign in
          </a>
        </div>
      </div>
    </form>
  {/if}
</div>