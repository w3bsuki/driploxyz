<script lang="ts">
  import { 
    Button, 
    Input, 
    OnboardingStep,
    AccountTypeSelector,
    AvatarSelector,
    SocialLinksEditor,
    PayoutMethodSelector,
    OnboardingSuccessModal,
    BrandPaymentModal
  } from '@repo/ui';
  import { goto, invalidateAll } from '$app/navigation';
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import * as m from '@repo/i18n';
  import { initializeLanguage } from '$lib/utils/language';
  import { page } from '$app/stores';
  import { toasts } from '@repo/ui';
  import { uploadImage } from '$lib/supabase/storage';
  import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const supabase = createBrowserSupabaseClient();

  let step = $state(1);
  let showSuccessModal = $state(false);
  let showBrandPayment = $state(false);
  let brandPaid = $state(false);
  let accountType = $state<'personal' | 'premium' | 'brand'>('personal');
  let discountCode = $state('');
  let username = $state('');
  let fullName = $state('');
  let avatarUrl = $state('');
  let payoutMethod = $state<'revolut' | 'paypal' | 'card'>('revolut');
  let payoutDetails = $state<string>('');
  let payoutName = $state<string>('');
  let location = $state<string>('');
  let socialLinks = $state<Array<{ type: string; url: string }>>([]);
  let submitting = $state(false);
  let languageInitialized = $state(false);
  let completionInProgress = $state(false);
  let showValidationError = $state(false);

  const totalSteps = 4;

  // Initialize language from server data - FIXED
  $effect(() => {
    if (browser) {
      // Use server language from SSR - never override
      initializeLanguage(data?.language);
      languageInitialized = true;
    } else {
      languageInitialized = true;
    }
  });

  // Initialize welcome modal state based on URL immediately
  let showEmailVerifiedWelcome = $state(false);
  
  // Check URL params immediately when browser is available
  if (browser) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('email_verified') === 'true' || params.get('welcome') === 'true') {
      console.log('[ONBOARDING] URL params detected, showing welcome modal');
      showEmailVerifiedWelcome = true;
    }
  }

  // Show welcome modal on mount
  onMount(() => {
    console.log('[ONBOARDING] onMount called');
    
    // FORCE CHECK: Make absolutely sure the welcome modal shows
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('email_verified') === 'true' || urlParams.get('welcome') === 'true') {
      console.log('[ONBOARDING] onMount detected email_verified, forcing modal');
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

  async function handleSuccessComplete() {
    console.log('[ONBOARDING] Success modal complete clicked');
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

  function nextStep() {
    // STRICT CHECK: Block brand/premium users without payment at ANY step
    if ((accountType === 'premium' || accountType === 'brand') && !brandPaid) {
      toasts.error('Payment is required for ' + accountType + ' accounts. Please complete payment to continue.', {
        duration: 5000
      });
      showBrandPayment = true;
      return;
    }
    
    // Validate current step before proceeding
    if (!canProceed()) {
      showValidationError = true;
      
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
    
    showValidationError = false;
    if (step < totalSteps) {
      step++;
      // Jump to top instantly
      window.scrollTo(0, 0);
    }
  }

  function prevStep() {
    if (step > 1) {
      step--;
      window.scrollTo(0, 0);
    }
  }

  function handleAccountTypeSelect(type: 'personal' | 'premium' | 'brand') {
    accountType = type;
    // Don't show payment modal immediately - wait for user to click continue
    if (type === 'personal') {
      // Reset payment status for personal accounts
      brandPaid = false;
    }
  }
  
  function handleDiscountCodeChange(code: string) {
    discountCode = code;
  }

  function handleAvatarSelect(url: string) {
    avatarUrl = url;
  }

  async function handleAvatarUpload(file: File) {
    if (!data.user) return;
    
    try {
      // Show loading state
      submitting = true;
      toasts.info('Uploading avatar...');
      
      // Upload avatar to Supabase Storage
      const { url } = await uploadImage(supabase, file, data.user.id, 'avatars');
      
      // Update the avatar URL with the uploaded URL
      avatarUrl = url;
      
      toasts.success('Avatar uploaded successfully!');
    } catch (error) {
      toasts.error('Failed to upload avatar. Please try again.');
      
      // Reset to default avatar if upload fails
      avatarUrl = '';
    } finally {
      submitting = false;
    }
  }

  function handleSocialLinksUpdate(links: Array<{ type: string; url: string }>) {
    socialLinks = links;
  }

  function handlePayoutMethodChange(method: 'revolut' | 'paypal' | 'card') {
    payoutMethod = method;
  }

  function handlePayoutDetailsChange(details: string) {
    payoutDetails = details || '';
  }

  function handlePayoutNameChange(name: string) {
    payoutName = name || '';
  }

  function prepareFormSubmit() {
    if (!data.user || !username.trim()) return false;
    
    // FINAL CHECK: Absolutely no completing without payment for brand/premium
    if ((accountType === 'brand' || accountType === 'premium') && !brandPaid) {
      toasts.error('Payment is required to complete ' + accountType + ' account setup!', {
        duration: 5000
      });
      showBrandPayment = true;
      return false;
    }
    
    return true;
  }

  const canProceed = $derived(() => {
    // GLOBAL CHECK: Brand/Premium must have paid to proceed at ANY step
    if ((accountType === 'brand' || accountType === 'premium') && !brandPaid) {
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
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform transition-all">
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
  <OnboardingStep
    title={m.onboarding_chooseAccountType()}
    subtitle={m.onboarding_selectPerfectPlan()}
  >
    {#snippet children()}
      <!-- Progress Indicator -->
      <div class="flex justify-center space-x-3 mb-8">
        {#each Array(totalSteps) as _, i}
          <div class="h-2 rounded-full transition-all duration-200 {i + 1 <= step ? 'bg-black w-8' : 'bg-gray-200 w-2'}"></div>
        {/each}
      </div>

      <AccountTypeSelector
        selected={accountType}
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
          onclick={() => {
            // For premium/brand, always require payment first
            if ((accountType === 'brand' || accountType === 'premium') && !brandPaid) {
              // Show payment modal
              showBrandPayment = true;
            } else {
              nextStep();
            }
          }}
          disabled={!accountType}
          class="flex-1 bg-black text-white hover:bg-gray-800"
        >
          {accountType === 'brand' || accountType === 'premium' ? 
            (brandPaid ? m.onboarding_continue() : 'Proceed to Payment') : 
            m.onboarding_continue()}
        </Button>
      </div>
    {/snippet}
  </OnboardingStep>

<!-- Step 2: Profile Setup & Avatar -->
{:else if step === 2}
  <OnboardingStep
    title={m.onboarding_createProfile()}
    subtitle={m.onboarding_tellAboutYourself()}
  >
    {#snippet children()}
      <!-- Progress Indicator -->
      <div class="flex justify-center space-x-3 mb-8">
        {#each Array(totalSteps) as _, i}
          <div class="h-2 rounded-full transition-all duration-200 {i + 1 <= step ? 'bg-black w-8' : 'bg-gray-200 w-2'}"></div>
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

<!-- Step 3: Payout Method -->
{:else if step === 3}
  <OnboardingStep
    title={m.onboarding_setupPayouts()}
    subtitle={m.onboarding_choosePaymentMethod()}
  >
    {#snippet children()}
      <!-- Progress Indicator -->
      <div class="flex justify-center space-x-3 mb-8">
        {#each Array(totalSteps) as _, i}
          <div class="h-2 rounded-full transition-all duration-200 {i + 1 <= step ? 'bg-black w-8' : 'bg-gray-200 w-2'}"></div>
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

<!-- Step 4: Social Links -->
{:else if step === 4}
  <OnboardingStep
    title={m.onboarding_connectSocials()}
    subtitle={m.onboarding_helpBuyersDiscover()}
  >
    {#snippet children()}
      <!-- Progress Indicator -->
      <div class="flex justify-center space-x-3 mb-8">
        {#each Array(totalSteps) as _, i}
          <div class="h-2 rounded-full transition-all duration-200 {i + 1 <= step ? 'bg-black w-8' : 'bg-gray-200 w-2'}"></div>
        {/each}
      </div>

      <form
        id="onboarding-form"
        method="POST"
        action="?/complete"
        use:enhance={() => {
          if (!prepareFormSubmit()) return;
          submitting = true;
          completionInProgress = true;
          
          return async ({ result, update }) => {
            submitting = false;
            
            if (result.type === 'success') {
              console.log('[ONBOARDING CLIENT] Completion successful:', result.data);
              
              // Check if we got a verified profile back
              if (result.data?.profile?.onboarding_completed === true) {
                console.log('[ONBOARDING CLIENT] Profile verified as complete');
                
                // Show success modal briefly
                showSuccessModal = true;
                toasts.success('Profile setup complete! Redirecting...');
                
                // Auto-redirect after 2 seconds if modal isn't closed
                setTimeout(() => {
                  if (showSuccessModal) {
                    console.log('[ONBOARDING CLIENT] Auto-redirecting to welcome page');
                    window.location.href = '/welcome';
                  }
                }, 2000);
              } else {
                console.error('[ONBOARDING CLIENT] Profile not properly completed:', result.data?.profile);
                toasts.error('Profile update may have failed. Please try again.');
                completionInProgress = false;
              }
              
            } else if (result.type === 'failure') {
              console.error('[ONBOARDING CLIENT] Completion failed:', result.data);
              toasts.error(result.data?.error || 'Failed to complete onboarding');
              completionInProgress = false;
            } else {
              console.error('[ONBOARDING CLIENT] Unexpected result type:', result.type);
              toasts.error('An unexpected error occurred. Please try again.');
              completionInProgress = false;
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
{/if}

<!-- Success Modal -->
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

<!-- Brand Payment Modal -->
<BrandPaymentModal
  show={showBrandPayment}
  accountType={accountType}
  initialDiscountCode={discountCode}
  stripePublishableKey={PUBLIC_STRIPE_PUBLISHABLE_KEY}
  onSuccess={handleBrandPaymentSuccess}
  onCancel={handleBrandPaymentCancel}
  onClose={() => showBrandPayment = false}
/>

<!-- Tutorial flow removed - too many modals are confusing -->