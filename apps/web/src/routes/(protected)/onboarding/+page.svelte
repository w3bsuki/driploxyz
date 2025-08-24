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
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import * as m from '@repo/i18n';
  import { initializeLanguage } from '$lib/utils/language';
  import { page } from '$app/stores';
  import { toasts } from '@repo/ui';
  import { uploadAvatar } from '$lib/supabase/storage';
  import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

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
  let socialLinks = $state<Array<{ type: string; url: string }>>([]);
  let submitting = $state(false);
  let languageInitialized = $state(false);

  const totalSteps = 5;

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

  // Show welcome modal on mount
  onMount(() => {
    // Check for welcome parameter from auth flow
    if ($page.url.searchParams.get('welcome') === 'true') {
      toasts.success('Welcome to Driplo! Let\'s set up your profile.');
    }
    
    // Check if user just verified their email
    if ($page.url.searchParams.get('verified') === 'true') {
      toasts.success('Email verified successfully! Welcome to Driplo!');
    }
    
    // Don't show welcome modal - it's confusing to have multiple modals
    // Users already see the onboarding steps which is enough
    
    // Check if user paid for brand account
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('brand_paid') === 'true') {
      brandPaid = true;
      accountType = 'brand';
    }
  });

  function handleSuccessComplete() {
    showSuccessModal = false;
    // Go directly to dashboard, no more modals
    goto('/dashboard', { invalidateAll: true });
  }

  function handleBrandPaymentSuccess() {
    showBrandPayment = false;
    brandPaid = true;
    // Payment successful - proceed to next step
    nextStep();
  }

  function handleBrandPaymentCancel() {
    showBrandPayment = false;
    // Reset to personal if they cancel payment
    accountType = 'personal';
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
    
    if (step < totalSteps) {
      step++;
    }
  }

  function prevStep() {
    if (step > 1) {
      step--;
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
      const uploadedUrl = await uploadAvatar(data.supabase, file, data.user.id);
      
      // Update the avatar URL with the uploaded URL
      avatarUrl = uploadedUrl;
      
      toasts.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Avatar upload failed:', error);
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

  async function completeOnboarding() {
    if (!data.user || !username.trim()) return;
    
    // FINAL CHECK: Absolutely no completing without payment for brand/premium
    if ((accountType === 'brand' || accountType === 'premium') && !brandPaid) {
      toasts.error('Payment is required to complete ' + accountType + ' account setup!', {
        duration: 5000
      });
      showBrandPayment = true;
      return;
    }
    
    submitting = true;
    
    try {
      // Create FormData to submit to server action
      const formData = new FormData();
      formData.append('accountType', accountType);
      formData.append('username', username.trim());
      formData.append('fullName', fullName.trim());
      formData.append('avatarUrl', avatarUrl);
      formData.append('payoutMethod', payoutMethod);
      formData.append('payoutDetails', payoutDetails);
      formData.append('payoutName', payoutName);
      formData.append('socialLinks', JSON.stringify(socialLinks.filter(link => link.url.trim())));
      formData.append('brandPaid', brandPaid.toString());

      // Submit to server action
      const response = await fetch('?/complete', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Show success modal briefly
        showSuccessModal = true;
        toasts.success('Profile setup complete!');
        
        // Don't use setTimeout - redirect immediately after modal shows
        // The server already sends a redirect, just follow it
        await goto('/dashboard', { invalidateAll: true });
      } else {
        const result = await response.json();
        throw new Error(result.error || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toasts.error('Something went wrong. Please try again.');
    } finally {
      submitting = false;
    }
  }

  const canProceed = $derived(() => {
    // GLOBAL CHECK: Brand/Premium must have paid to proceed at ANY step
    if ((accountType === 'brand' || accountType === 'premium') && !brandPaid) {
      return false;
    }
    
    switch (step) {
      case 1: return accountType;
      case 2: return username && username.trim().length >= 3;
      case 3: return avatarUrl;
      case 4: return payoutDetails && payoutDetails.trim().length > 0;
      case 5: return true; // Social links are optional
      default: return false;
    }
  });
</script>

<svelte:head>
  <title>{m.onboarding_completeProfile()} - Driplo</title>
</svelte:head>

<!-- Welcome modal removed - jumping straight to onboarding steps -->

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
        class="mb-8"
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

<!-- Step 2: Profile Setup -->
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
          placeholder={m.onboarding_fullNameOptional()}
          label={m.profile_fullName()}
          class="bg-white/80"
        />

        {#if username.trim().length > 0 && username.trim().length < 3}
          <p class="text-sm text-red-600 mt-1">{m.onboarding_usernameMinLength()}</p>
        {/if}
      </div>

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

<!-- Step 3: Avatar Selection -->
{:else if step === 3}
  <OnboardingStep
    title={m.onboarding_chooseAvatar()}
    subtitle={m.onboarding_pickProfilePicture()}
  >
    {#snippet children()}
      <!-- Progress Indicator -->
      <div class="flex justify-center space-x-3 mb-8">
        {#each Array(totalSteps) as _, i}
          <div class="h-2 rounded-full transition-all duration-200 {i + 1 <= step ? 'bg-black w-8' : 'bg-gray-200 w-2'}"></div>
        {/each}
      </div>

      <AvatarSelector
        bind:selected={avatarUrl}
        uploadEnabled={true}
        onSelect={handleAvatarSelect}
        onUpload={handleAvatarUpload}
        class="mb-8"
      />

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

<!-- Step 4: Payout Method -->
{:else if step === 4}
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
        class="mb-8"
      />

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

<!-- Step 5: Social Links -->
{:else if step === 5}
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

      <SocialLinksEditor
        links={socialLinks}
        onUpdate={handleSocialLinksUpdate}
        class="mb-8"
      />

      <div class="flex space-x-4">
        <Button
          onclick={prevStep}
          variant="outline"
          class="flex-1"
        >
          {m.onboarding_back()}
        </Button>
        <Button
          onclick={completeOnboarding}
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