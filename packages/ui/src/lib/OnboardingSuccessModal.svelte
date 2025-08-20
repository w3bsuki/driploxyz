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

      <!-- Action Button -->
      <button
        onclick={onClose}
        class="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {isBrand ? (translations.goToDashboard || 'Go to Dashboard & Subscribe') : (translations.startExploring || 'Start Exploring')}
      </button>
    </div>
  </div>
{/if}