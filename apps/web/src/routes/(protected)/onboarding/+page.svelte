<script lang="ts">
  import { 
    Button, 
    Input, 
    OnboardingStep,
    AccountTypeSelector,
    AvatarSelector,
    SocialLinksEditor,
    PayoutMethodSelector,
    WelcomeModal,
    OnboardingSuccessModal,
    BrandPaymentModal,
    WelcomeTutorialFlow
  } from '@repo/ui';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import * as m from '@repo/i18n';
  import { initializeLanguage } from '$lib/utils/language';
  import { page } from '$app/stores';
  import { toasts } from '@repo/ui';
  import { uploadAvatar } from '$lib/supabase/storage';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let step = $state(1);
  let showWelcome = $state(false);
  let welcomeStep = $state(0);
  let showSuccessModal = $state(false);
  let showTutorialFlow = $state(false);
  let showBrandPayment = $state(false);
  let brandPaid = $state(false);
  let accountType = $state<'personal' | 'brand'>('personal');
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
    
    // Only show welcome modal after language is initialized
    const checkLanguageAndShowModal = () => {
      if (languageInitialized) {
        showWelcome = true;
      } else {
        setTimeout(checkLanguageAndShowModal, 50);
      }
    };
    checkLanguageAndShowModal();
    
    // Check if user paid for brand account
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('brand_paid') === 'true') {
      brandPaid = true;
      accountType = 'brand';
    }
  });

  function handleWelcomeNext() {
    if (welcomeStep < 3) {
      welcomeStep++;
    }
  }

  function handleWelcomePrevious() {
    if (welcomeStep > 0) {
      welcomeStep--;
    }
  }

  function handleWelcomeComplete() {
    showWelcome = false;
  }

  function handleSuccessComplete() {
    showSuccessModal = false;
    showTutorialFlow = true;
  }

  async function handleTutorialComplete() {
    showTutorialFlow = false;
    // Invalidate auth to refresh profile data
    await goto('/dashboard', { invalidateAll: true });
  }

  function handleBrandPaymentSuccess() {
    showBrandPayment = false;
    brandPaid = true;
    accountType = 'brand';
  }

  function handleBrandPaymentCancel() {
    showBrandPayment = false;
    accountType = 'personal';
  }

  function nextStep() {
    if (step < totalSteps) {
      step++;
    }
  }

  function prevStep() {
    if (step > 1) {
      step--;
    }
  }

  function handleAccountTypeSelect(type: 'personal' | 'brand') {
    if (type === 'brand' && !brandPaid) {
      // Show payment modal for brand accounts
      showBrandPayment = true;
    } else {
      accountType = type;
    }
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
    
    submitting = true;
    
    try {
      // Determine brand status - if they paid during onboarding, they get full brand status
      const brandStatus = accountType === 'brand' ? (brandPaid ? 'brand' : 'brand_pending') : null;
      
      // Update profile - the badge will be assigned automatically via database trigger
      const { error: profileError } = await data.supabase
        .from('profiles')
        .update({
          account_type: accountType, // 'personal' or 'brand'
          username: username.trim(),
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl || null,
          payout_method: payoutDetails ? { 
            type: payoutMethod, 
            details: payoutDetails.trim(), 
            name: payoutName.trim() || null 
          } : null,
          social_links: socialLinks.filter(link => link.url.trim()),
          onboarding_completed: true,
          verified: accountType === 'brand' && brandPaid, // Only verified if brand and paid
          brand_status: brandStatus
        })
        .eq('id', data.user.id);

      if (profileError) throw profileError;

      // Refresh the profile in the store
      const { data: updatedProfile } = await data.supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (updatedProfile) {
        // Update the auth store with the new profile
        const { setProfile } = await import('$lib/stores/auth');
        setProfile(updatedProfile);
      }

      // If brand account, create brand entry
      if (accountType === 'brand') {
        const { error: brandError } = await data.supabase
          .from('brands')
          .insert({
            profile_id: data.user.id,
            brand_name: fullName.trim() || username.trim(),
            brand_description: `${username.trim()} - Professional fashion brand`,
            verified_brand: brandPaid, // Verified if they paid during onboarding
            subscription_active: brandPaid // Active if they paid during onboarding
          });

        if (brandError) throw brandError;
      }

      // Show success modal
      showSuccessModal = true;
      toasts.success('Profile setup complete! Welcome to Driplo!');
    } catch (error) {
      console.error('Onboarding error:', error);
      toasts.error('Something went wrong. Please try again.');
    } finally {
      submitting = false;
    }
  }

  const canProceed = $derived(() => {
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

<!-- Welcome Modal -->
<WelcomeModal
  {showWelcome}
  currentStep={welcomeStep}
  onNext={handleWelcomeNext}
  onPrevious={handleWelcomePrevious}
  onComplete={handleWelcomeComplete}
  onSkip={handleWelcomeComplete}
  translations={{
    welcome: m.onboarding_welcome(),
    welcomeBrand: m.onboarding_welcomeBrand(),
    welcomePersonal: m.onboarding_welcomePersonal(),
    discover: m.onboarding_discover(),
    discoverDesc: m.onboarding_discoverDesc(),
    sell: m.onboarding_sell(),
    sellDesc: m.onboarding_sellDesc(),
    ready: m.onboarding_ready(),
    readyDesc: m.onboarding_readyDesc(),
    back: m.onboarding_back(),
    next: m.onboarding_next(),
    getStarted: m.onboarding_getStarted(),
    skip: m.onboarding_skip(),
    designer: m.onboarding_designer(),
    vintage: m.onboarding_vintage(),
    trending: m.onboarding_trending(),
    totalSales: m.onboarding_totalSales(),
    happySellers: m.onboarding_happySellers(),
    trustedMarketplace: m.onboarding_trustedMarketplace()
  }}
/>

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
          onclick={nextStep}
          disabled={!canProceed()}
          class="flex-1 bg-black text-white hover:bg-gray-800"
        >
          {m.onboarding_continue()}
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
  stripePublishableKey={import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY}
  onSuccess={handleBrandPaymentSuccess}
  onCancel={handleBrandPaymentCancel}
  onClose={() => showBrandPayment = false}
/>

<!-- Welcome Tutorial Flow -->
<WelcomeTutorialFlow
  show={showTutorialFlow}
  accountType={accountType}
  onComplete={handleTutorialComplete}
  translations={{
    welcomeTitle: m.onboarding_tutorial_welcomeTitle(),
    welcomeContent: m.onboarding_tutorial_welcomeContent(),
    discoverTitle: m.onboarding_tutorial_discoverTitle(),
    discoverContent: m.onboarding_tutorial_discoverContent(),
    listItemTitle: m.onboarding_tutorial_listItemTitle(),
    listItemContentBrand: m.onboarding_tutorial_listItemContentBrand(),
    listItemContentPersonal: m.onboarding_tutorial_listItemContentPersonal(),
    stayConnectedTitle: m.onboarding_tutorial_stayConnectedTitle(),
    stayConnectedContent: m.onboarding_tutorial_stayConnectedContent(),
    readyTitle: m.onboarding_tutorial_readyTitle(),
    readyContent: m.onboarding_tutorial_readyContent(),
    skip: m.onboarding_skip(),
    next: m.onboarding_next(),
    getStarted: m.onboarding_getStarted()
  }}
/>