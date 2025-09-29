<script lang="ts">
  import { 
    Button, 
    Input, 
    OnboardingStep,
    AccountTypeSelector,
    AvatarSelector,
    SocialLinksEditor,
    PayoutMethodSelector
  } from '@repo/ui';
  import { enhance } from '$app/forms';
  import { browser } from '$app/environment';
  import * as m from '@repo/i18n';
  import { initializeLanguage } from '$lib/utils/language-switcher';
  import { toasts } from '@repo/ui';
  // Removed unused uploadImage import
  import { env as publicEnv } from '$env/dynamic/public';
  import { createLogger } from '$lib/utils/log';

  const log = createLogger('onboarding-client');
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import { focusWithAnnouncement } from '$lib/utils/navigation';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createBrowserSupabaseClient();

  let step = $state(1);
  let showSuccessModal = $state(false);
  let showBrandPayment = $state(false);
  let brandPaid = $state(false);
  
  // Dynamically imported modal components
  let OnboardingSuccessModal: typeof import('$lib/components/OnboardingSuccessModal.svelte').default | null = $state(null);
  let BrandPaymentModal: typeof import('$lib/components/BrandPaymentModal.svelte').default | null = $state(null);
  let successModalLoaded = $state(false);
  let brandPaymentModalLoaded = $state(false);
  let accountType = $state<'personal' | 'pro' | 'brand'>('personal');
  let discountCode = $state('');
  let username = $state('');
  let fullName = $state('');
  let avatarUrl = $state('');
  let payoutMethod = $state<'revolut' | 'paypal' | 'card'>('revolut');
  let payoutDetails = $state<string>('');
  // Removed unused _showValidationError state variable
  let payoutName = $state<string>('');
  let location = $state<string>('');
  let socialLinks = $state<Array<{ type: string; url: string }>>([]);
  let submitting = $state(false);
  let stepContainer = $state<HTMLElement>();

  const totalSteps = 4;

  // Initialize language from server data - FIXED
  $effect(() => {
    if (browser) {
      // Use server language from SSR - never override
      initializeLanguage(data?.language);
    } else {
      // No client-side language override needed
    }
  });

  // Initialize welcome modal state based on URL immediately
  let showEmailVerifiedWelcome = $state(false);
  
  // Check URL params immediately when browser is available
  if (browser) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('email_verified') === 'true' || params.get('welcome') === 'true') {
      log.debug('URL params detected, showing welcome modal');
      showEmailVerifiedWelcome = true;
    }
  }

  // Show welcome modal on mount
  $effect(() => {
    if (!browser) return;

    log.debug('Component mounted');

    // FORCE CHECK: Make absolutely sure the welcome modal shows
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('email_verified') === 'true' || urlParams.get('welcome') === 'true') {
      log.debug('Email verified detected, forcing modal');
      showEmailVerifiedWelcome = true;
    }

    // Additional welcome messages for other flows
    if (!showEmailVerifiedWelcome && urlParams.get('verified') === 'true') {
      // Legacy verified parameter
      toasts.success('Email verified successfully! Welcome to Driplo!');
    }

    // Check if user paid for brand account
    if (urlParams.get('brand_paid') === 'true') {
      brandPaid = true;
      accountType = 'brand';
    }
  });

  // Dynamic import functions for modals
  async function loadSuccessModal() {
    if (!successModalLoaded && !OnboardingSuccessModal) {
      const module = await import('@repo/ui/lib/components/modals/OnboardingSuccessModal.svelte');
      OnboardingSuccessModal = module.default;
      successModalLoaded = true;
    }
  }
  
  async function loadBrandPaymentModal() {
    if (!brandPaymentModalLoaded && !BrandPaymentModal) {
      const module = await import('@repo/ui');
      BrandPaymentModal = module.BrandPaymentModal;
      brandPaymentModalLoaded = true;
    }
  }

  async function handleSuccessComplete() {
    log.debug('Success modal complete clicked');
    showSuccessModal = false;
    
    // Navigate to welcome page which will verify profile and redirect
    window.location.href = '/welcome';
  }

  function handleBrandPaymentSuccess() {
    showBrandPayment = false;
    brandPaid = true;
    // Payment successful - proceed to next step
    nextStep();
  }

  function handleBrandPaymentCancel() {
    showBrandPayment = false;
    // Keep the selected account type but mark as unpaid
    brandPaid = false;
  }

  async function nextStep() {
    // STRICT CHECK: Block brand/premium users without payment at ANY step
    if ((accountType === 'pro' || accountType === 'brand') && !brandPaid) {
      toasts.error('Payment is required for ' + accountType + ' accounts. Please complete payment to continue.', {
        duration: 5000
      });
      await loadBrandPaymentModal();
      showBrandPayment = true;
      return;
    }
    
    // Validate current step before proceeding
    if (!canProceed()) {
      // Show validation error in toast instead of state variable
      
      // Show specific error messages based on current step
      switch (step) {
        case 2:
          if (!username || username.trim().length < 3) {
            toasts.error('Username must be at least 3 characters long');
          } else if (!fullName || fullName.trim().length === 0) {
            toasts.error('Please enter your full name');
          } else if (!avatarUrl) {
            toasts.error('Please upload a profile photo');
          }
          break;
        case 3:
          if (!payoutDetails || payoutDetails.trim().length === 0) {
            toasts.error('Please enter your payout account details (e.g., @revolut_tag)');
          } else if (!payoutName || payoutName.trim().length === 0) {
            toasts.error('Please enter the account holder name for payouts');
          }
          break;
      }
      return;
    }

    // Validation cleared
    if (step < totalSteps) {
      step++;
      
      // Better navigation with accessibility considerations
      if (stepContainer) {
        // Focus management for screen readers
        focusWithAnnouncement(
          stepContainer, 
          `Step ${step} of ${totalSteps}: ${getStepTitle(step)}`
        );
      } else {
        // Fallback: scroll to top of page with motion preference support
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ 
          top: 0, 
          behavior: prefersReducedMotion ? 'auto' : 'smooth' 
        });
      }
    }
  }

  function prevStep() {
    if (step > 1) {
      step--;
      
      // Better navigation with accessibility considerations
      if (stepContainer) {
        // Focus management for screen readers
        focusWithAnnouncement(
          stepContainer, 
          `Step ${step} of ${totalSteps}: ${getStepTitle(step)}`
        );
      } else {
        // Fallback: scroll to top of page with motion preference support
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ 
          top: 0, 
          behavior: prefersReducedMotion ? 'auto' : 'smooth' 
        });
      }
    }
  }

  function handleAccountTypeSelect(type: 'personal' | 'pro' | 'brand') {
    log.debug('Account type selected', { type });
    accountType = type;
    // Don't show payment modal immediately - wait for user to click continue
    if (type === 'personal') {
      // Reset payment status for personal accounts
      brandPaid = false;
    }
    log.debug('Account type state updated', { accountType, canProceed: canProceed() });
  }
  
  function handleDiscountCodeChange(code: string) {
    discountCode = code;
  }

  function handleAvatarSelect(url: string) {
    avatarUrl = url;
  }

  // Removed unused handleAvatarUpload function

  function handleSocialLinksUpdate(links: Array<{ type: string; url: string }>) {
    socialLinks = links;
  }


  async function prepareFormSubmit() {
    if (!data.user || !username.trim()) return false;
    
    // FINAL CHECK: Absolutely no completing without payment for brand/premium
    if ((accountType === 'brand' || accountType === 'pro') && !brandPaid) {
      toasts.error('Payment is required to complete ' + accountType + ' account setup!', {
        duration: 5000
      });
      await loadBrandPaymentModal();
      showBrandPayment = true;
      return false;
    }
    
    return true;
  }

  // Helper function to get step titles for accessibility announcements
  function getStepTitle(stepNumber: number): string {
    switch (stepNumber) {
      case 1: return m.onboarding_chooseAccountType();
      case 2: return m.onboarding_createProfile();
      case 3: return m.onboarding_setupPayouts();
      case 4: return m.onboarding_connectSocials();
      default: return '';
    }
  }

  const canProceed = $derived.by(() => {
    // GLOBAL CHECK: Brand/Premium must have paid to proceed at ANY step
    if ((accountType === 'brand' || accountType === 'pro') && !brandPaid) {
      return false;
    }
    
    switch (step) {
      case 1: return accountType;
      case 2: return username && username.trim().length >= 3 && fullName && fullName.trim().length > 0 && avatarUrl; // Location is optional
      case 3: return payoutDetails && payoutDetails.trim().length > 0 && payoutName && payoutName.trim().length > 0;
      case 4: return true; // Social links are optional
      default: return false;
    }
  });
</script>

<svelte:head>
  <title>{m.onboarding_completeProfile()} - Driplo</title>
</svelte:head>

<!-- Email Verification Success Modal -->
{#if showEmailVerifiedWelcome}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform transition-transform">
      <div class="text-center mb-6">
        <!-- Success Icon -->
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Email Verified Successfully!
        </h2>
        <p class="text-gray-600 text-lg mb-6">
          Welcome to Driplo! Please complete your profile setup to start buying and selling.
        </p>
      </div>
      
      <button
        onclick={() => showEmailVerifiedWelcome = false}
        class="w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
      >
        Start Onboarding
      </button>
      
      <p class="text-center text-sm text-gray-500 mt-4">
        This will only take a few minutes
      </p>
    </div>
  </div>
{/if}

<!-- Step 1: Account Type -->
{#if step === 1}
  <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 1 of {totalSteps}: {m.onboarding_chooseAccountType()}">
    <OnboardingStep
      title={m.onboarding_chooseAccountType()}
      subtitle={m.onboarding_selectPerfectPlan()}
    >
    {#snippet children()}
      <!-- Progress Indicator -->
      <div class="flex justify-center space-x-3 mb-8">
        {#each Array(totalSteps) as _stepItem, i} <!-- eslint-disable-line @typescript-eslint/no-unused-vars -->
          <div class="h-2 rounded-full transition-colors transition-transform duration-200 {i + 1 <= step ? 'bg-black w-8' : 'bg-gray-200 w-2'}"></div>
        {/each}
      </div>

      <AccountTypeSelector
        bind:selected={accountType}
        onSelect={handleAccountTypeSelect}
        showDiscountCode={true}
        onDiscountCodeChange={handleDiscountCodeChange}
        discountCode={discountCode}
        translations={{
          personalTitle: m.onboarding_personalAccount(),
          personalDescription: m.onboarding_personalAccountDesc(),
          personalFeatures: [
            m.onboarding_personalFeature1(),
            m.onboarding_personalFeature2(),
            m.onboarding_personalFeature3(),
            m.onboarding_personalFeature4()
          ],
          brandTitle: m.onboarding_brandAccount(),
          brandDescription: m.onboarding_brandAccountDesc(),
          brandFeatures: [
            m.onboarding_brandFeature1(),
            m.onboarding_brandFeature2(),
            m.onboarding_brandFeature3(),
            m.onboarding_brandFeature4()
          ],
          free: m.onboarding_free(),
          perMonth: m.onboarding_perMonth(),
          popular: m.onboarding_popular(),
          selected: m.onboarding_selected(),
          select: m.onboarding_select()
        }}
      />
    {/snippet}
    
    {#snippet navigation()}
      <div class="flex space-x-4">
        <Button
          onclick={async () => {
            // For premium/brand, always require payment first
            if ((accountType === 'brand' || accountType === 'pro') && !brandPaid) {
              // Show payment modal
              await loadBrandPaymentModal();
              showBrandPayment = true;
            } else {
              nextStep();
            }
          }}
          disabled={!accountType}
          class="flex-1 bg-black text-white hover:bg-gray-800"
        >
          {accountType === 'brand' || accountType === 'pro' ? 
            (brandPaid ? m.onboarding_continue() : 'Proceed to Payment') : 
            m.onboarding_continue()}
        </Button>
      </div>
    {/snippet}
  </OnboardingStep>
  </div>

<!-- Step 2: Profile Setup & Avatar -->
{:else if step === 2}
  <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 2 of {totalSteps}: {m.onboarding_createProfile()}">
    <OnboardingStep
      title={m.onboarding_createProfile()}
      subtitle={m.onboarding_tellAboutYourself()}
    >
    {#snippet children()}
      <!-- Progress Indicator -->
      <div class="flex justify-center space-x-3 mb-8">
        {#each Array(totalSteps) as _stepItem, i} <!-- eslint-disable-line @typescript-eslint/no-unused-vars -->
          <div class="h-2 rounded-full transition-colors transition-transform duration-200 {i + 1 <= step ? 'bg-black w-8' : 'bg-gray-200 w-2'}"></div>
        {/each}
      </div>

      <!-- Profile Information -->
      <div class="space-y-6 mb-8">
        <Input
          bind:value={username}
          placeholder={m.onboarding_chooseUniqueUsername()}
          label={m.auth_username()}
          class="bg-white/80"
          required
        />
        
        <Input
          bind:value={fullName}
          placeholder="Enter your full name"
          label={m.profile_fullName()}
          class="bg-white/80"
          required
        />
        
        <Input
          bind:value={location}
          placeholder="Enter your city or location (optional)"
          label="Location (Optional)"
          class="bg-white/80"
        />

        {#if username.trim().length > 0 && username.trim().length < 3}
          <p class="text-sm text-red-600 mt-1">{m.onboarding_usernameMinLength()}</p>
        {/if}
      </div>

      <!-- Avatar Selection -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">{m.onboarding_chooseAvatar()}</h3>
        <AvatarSelector
          selected={avatarUrl}
          onSelect={handleAvatarSelect}
          translations={{
            chooseAvatar: m.onboarding_chooseAvatar(),
            uploadCustom: m.onboarding_uploadCustom(),
            generateNew: m.onboarding_generateNew()
          }}
        />
      </div>
    {/snippet}
    
    {#snippet navigation()}
      <div class="flex space-x-4">
        <Button
          onclick={prevStep}
          variant="outline"
          class="flex-1"
        >
          {m.onboarding_back()}
        </Button>
        <Button
          onclick={nextStep}
          disabled={!canProceed()}
          class="flex-1 bg-black text-white hover:bg-gray-800"
        >
          {m.onboarding_continue()}
        </Button>
      </div>
    {/snippet}
  </OnboardingStep>
  </div>

<!-- Step 3: Payout Method -->
{:else if step === 3}
  <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 3 of {totalSteps}: {m.onboarding_setupPayouts()}">
    <OnboardingStep
      title={m.onboarding_setupPayouts()}
      subtitle={m.onboarding_choosePaymentMethod()}
    >
    {#snippet children()}
      <!-- Progress Indicator -->
      <div class="flex justify-center space-x-3 mb-8">
        {#each Array(totalSteps) as _stepItem, i} <!-- eslint-disable-line @typescript-eslint/no-unused-vars -->
          <div class="h-2 rounded-full transition-colors transition-transform duration-200 {i + 1 <= step ? 'bg-black w-8' : 'bg-gray-200 w-2'}"></div>
        {/each}
      </div>

      <PayoutMethodSelector
        bind:selectedMethod={payoutMethod}
        bind:payoutDetails={payoutDetails}
        bind:payoutName={payoutName}
        class="force-refresh"
      />
    {/snippet}
    
    {#snippet navigation()}
      <div class="flex space-x-4">
        <Button
          onclick={prevStep}
          variant="outline"
          class="flex-1"
        >
          {m.onboarding_back()}
        </Button>
        <Button
          onclick={nextStep}
          disabled={!canProceed()}
          class="flex-1 bg-black text-white hover:bg-gray-800"
        >
          {m.onboarding_continue()}
        </Button>
      </div>
    {/snippet}
  </OnboardingStep>
  </div>

<!-- Step 4: Social Links -->
{:else if step === 4}
  <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 4 of {totalSteps}: {m.onboarding_connectSocials()}">
    <OnboardingStep
      title={m.onboarding_connectSocials()}
      subtitle={m.onboarding_helpBuyersDiscover()}
    >
    {#snippet children()}
      <!-- Progress Indicator -->
      <div class="flex justify-center space-x-3 mb-8">
        {#each Array(totalSteps) as _stepItem, i} <!-- eslint-disable-line @typescript-eslint/no-unused-vars -->
          <div class="h-2 rounded-full transition-colors transition-transform duration-200 {i + 1 <= step ? 'bg-black w-8' : 'bg-gray-200 w-2'}"></div>
        {/each}
      </div>

      <form
        id="onboarding-form"
        method="POST"
        action="?/complete"
        use:enhance={async () => {
          if (!(await prepareFormSubmit())) return;
          submitting = true;
          
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          return async ({ result, update: __updateFn }) => {
            submitting = false;
            
            if (result.type === 'success') {
              log.debug('Completion successful', result.data);
              
              // Check if we got a verified profile back
              if (result.data?.profile?.onboarding_completed === true) {
                log.debug('Profile verified as complete');
                
                // Show success modal briefly
                await loadSuccessModal();
                showSuccessModal = true;
                toasts.success('Profile setup complete! Redirecting...');
                
                // Auto-redirect after 2 seconds if modal isn't closed
                setTimeout(() => {
                  if (showSuccessModal) {
                    log.debug('Auto-redirecting to welcome page');
                    window.location.href = '/welcome';
                  }
                }, 2000);
              } else {
                log.error('Profile not properly completed', undefined, { profile: result.data?.profile });
                toasts.error('Profile update may have failed. Please try again.');
              }
              
            } else if (result.type === 'failure') {
              log.error('Completion failed', undefined, result.data);
              toasts.error(result.data?.error || 'Failed to complete onboarding');
            } else {
              log.error('Unexpected result type', undefined, { resultType: result.type });
              toasts.error('An unexpected error occurred. Please try again.');
            }
          };
        }}
      >
        <input type="hidden" name="accountType" value={accountType} />
        <input type="hidden" name="username" value={username.trim()} />
        <input type="hidden" name="fullName" value={fullName.trim()} />
        <input type="hidden" name="location" value={location.trim()} />
        <input type="hidden" name="avatarUrl" value={avatarUrl} />
        <input type="hidden" name="payoutMethod" value={payoutMethod} />
        <input type="hidden" name="payoutDetails" value={payoutDetails} />
        <input type="hidden" name="payoutName" value={payoutName} />
        <input type="hidden" name="socialLinks" value={JSON.stringify(socialLinks.filter(link => link.url.trim()))} />
        <input type="hidden" name="brandPaid" value={brandPaid.toString()} />

        <SocialLinksEditor
          links={socialLinks}
          onUpdate={handleSocialLinksUpdate}
        />
      </form>
    {/snippet}
    
    {#snippet navigation()}
      <div class="flex space-x-4">
        <Button
          type="button"
          onclick={prevStep}
          variant="outline"
          class="flex-1"
        >
          {m.onboarding_back()}
        </Button>
        <Button
          type="button"
          onclick={() => {
            const form = document.getElementById('onboarding-form') as HTMLFormElement;
            if (form) {
              form.requestSubmit();
            }
          }}
          disabled={submitting}
          loading={submitting}
          class="flex-1 bg-green-600 text-white hover:bg-green-700"
        >
          {submitting ? m.onboarding_settingUp() : m.onboarding_completeSetup()}
        </Button>
      </div>
    {/snippet}
  </OnboardingStep>
  </div>
{/if}

<!-- Success Modal -->
{#if successModalLoaded && OnboardingSuccessModal}
  <OnboardingSuccessModal
    show={showSuccessModal}
    accountType={accountType}
    onClose={handleSuccessComplete}
    translations={{
      welcomeBrand: m.onboarding_welcomeBrand(),
      welcomePersonal: m.onboarding_welcomePersonal(),
      brandProfileSetup: m.onboarding_brandProfileSetup(),
      profileComplete: m.onboarding_profileComplete(),
      profileCreated: m.onboarding_profileCreated(),
      profileVerified: m.onboarding_profileVerified(),
      brandPending: m.onboarding_brandPending(),
      paymentReady: m.onboarding_paymentReady(),
      goToDashboard: m.onboarding_goToDashboard(),
      startExploring: m.onboarding_startExploring()
    }}
  />
{/if}

<!-- Brand Payment Modal -->
{#if brandPaymentModalLoaded && BrandPaymentModal}
  <BrandPaymentModal
    show={showBrandPayment}
    accountType={accountType}
    initialDiscountCode={discountCode}
    stripePublishableKey={publicEnv.PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}
    onSuccess={handleBrandPaymentSuccess}
    onCancel={handleBrandPaymentCancel}
    onClose={() => showBrandPayment = false}
  />
{/if}

<!-- Tutorial flow removed - too many modals are confusing -->