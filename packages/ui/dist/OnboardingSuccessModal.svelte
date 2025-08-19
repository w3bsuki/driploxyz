<script lang="ts">
  import * as m from '@repo/i18n';
  
  interface Props {
    show?: boolean;
    onClose?: () => void;
    accountType?: 'personal' | 'brand';
  }

  let { 
    show = false,
    onClose,
    accountType = 'personal'
  }: Props = $props();

  const isBrand = accountType === 'brand';
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 p-8 text-center">
      <!-- Success Icon -->
      <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>

      <!-- Content -->
      <h2 class="text-2xl font-bold text-gray-900 mb-3">
        {isBrand ? m.onboarding_welcomeBrand() : m.onboarding_welcomePersonal()}
      </h2>
      <p class="text-gray-600 mb-6 leading-relaxed">
        {#if isBrand}
          {m.onboarding_brandSetupComplete()}
        {:else}
          {m.onboarding_profileComplete()}
        {/if}
      </p>

      <!-- Success Stats -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-black">✓</div>
            <div class="text-xs text-gray-600">{isBrand ? m.onboarding_profileCreated() : m.onboarding_profileVerified()}</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-black">{isBrand ? '🏢' : '💳'}</div>
            <div class="text-xs text-gray-600">{isBrand ? m.onboarding_brandPending() : m.onboarding_paymentReady()}</div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button
        onclick={onClose}
        class="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {isBrand ? m.onboarding_goToDashboard() : m.onboarding_startExploring()}
      </button>
    </div>
  </div>
{/if}