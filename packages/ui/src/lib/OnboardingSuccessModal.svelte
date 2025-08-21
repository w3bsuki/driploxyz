<script lang="ts">
  interface Props {
    show?: boolean;
    onClose?: () => void;
    accountType?: 'personal' | 'brand';
    translations?: {
      welcomeBrand?: string;
      welcomePersonal?: string;
      brandProfileSetup?: string;
      profileComplete?: string;
      profileCreated?: string;
      profileVerified?: string;
      brandPending?: string;
      paymentReady?: string;
      goToDashboard?: string;
      startExploring?: string;
    };
  }

  let { 
    show = false,
    onClose,
    accountType = 'personal',
    translations = {}
  }: Props = $props();

  const isBrand = accountType === 'brand';
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
    <div class="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 p-8 text-center">
      <!-- Success Icon -->
      <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>

      <!-- Content -->
      <h2 class="text-2xl font-bold text-gray-900 mb-3">
        {isBrand ? (translations.welcomeBrand || 'Welcome to Driplo Business! 🏢') : (translations.welcomePersonal || 'Welcome to Driplo! 🎉')}
      </h2>
      <p class="text-gray-600 mb-6 leading-relaxed">
        {#if isBrand}
          {translations.brandProfileSetup || "Your brand profile is set up! To activate full brand features and verification badge, you'll need to subscribe to our Brand plan from your dashboard."}
        {:else}
          {translations.profileComplete || "Your profile is now complete and verified. You're ready to start buying and selling amazing fashion items!"}
        {/if}
      </p>

      <!-- Success Stats -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-black">✓</div>
            <div class="text-xs text-gray-600">{isBrand ? (translations.profileCreated || 'Profile Created') : (translations.profileVerified || 'Profile Verified')}</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-black">{isBrand ? '🏢' : '💳'}</div>
            <div class="text-xs text-gray-600">{isBrand ? (translations.brandPending || 'Brand Pending') : (translations.paymentReady || 'Payment Ready')}</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        {#if !isBrand}
          <!-- Buy/Sell CTAs for personal accounts -->
          <div class="grid grid-cols-2 gap-3">
            <button
              onclick={() => {
                window.location.href = '/';
                onClose?.();
              }}
              class="bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Купи
            </button>
            <button
              onclick={() => {
                window.location.href = '/sell';
                onClose?.();
              }}
              class="bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Продай
            </button>
          </div>
          <button
            onclick={onClose}
            class="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {translations.startExploring || 'Start Exploring'}
          </button>
        {:else}
          <!-- Original button for brand accounts -->
          <button
            onclick={onClose}
            class="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {translations.goToDashboard || 'Go to Dashboard & Subscribe'}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}