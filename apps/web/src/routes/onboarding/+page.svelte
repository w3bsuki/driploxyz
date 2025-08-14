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

  const totalSteps = 5;

  // Show welcome modal on mount
  onMount(() => {
    showWelcome = true;
    
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
    await goto('/dashboard');
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
      const brandStatus = accountType === 'brand' ? (brandPaid ? 'brand' : 'brand_pending') : 'personal';
      
      // Update profile
      const { error: profileError } = await data.supabase
        .from('profiles')
        .update({
          account_type: accountType,
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
          verified: true,
          brand_status: brandStatus
        })
        .eq('id', data.user.id);

      if (profileError) throw profileError;

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
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Something went wrong. Please try again.');
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
  <title>Complete Your Profile - Driplo</title>
</svelte:head>

<!-- Welcome Modal -->
<WelcomeModal
  {showWelcome}
  currentStep={welcomeStep}
  onNext={handleWelcomeNext}
  onPrevious={handleWelcomePrevious}
  onComplete={handleWelcomeComplete}
  onSkip={handleWelcomeComplete}
/>

<!-- Step 1: Account Type -->
{#if step === 1}
  <OnboardingStep
    title="Choose Your Account Type"
    subtitle="Select the perfect plan for your selling journey"
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
      />

      <div class="flex space-x-4">
        <Button
          onclick={nextStep}
          disabled={!canProceed()}
          class="flex-1 bg-black text-white hover:bg-gray-800"
        >
          Continue
        </Button>
      </div>
    {/snippet}
  </OnboardingStep>

<!-- Step 2: Profile Setup -->
{:else if step === 2}
  <OnboardingStep
    title="Create Your Profile"
    subtitle="Tell us a bit about yourself"
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
          placeholder="Choose a unique username"
          label="Username"
          class="bg-white/80"
          required
        />
        
        <Input
          bind:value={fullName}
          placeholder="Your full name (optional)"
          label="Full Name"
          class="bg-white/80"
        />

        {#if username.trim().length > 0 && username.trim().length < 3}
          <p class="text-sm text-red-600 mt-1">Username must be at least 3 characters long</p>
        {/if}
      </div>

      <div class="flex space-x-4">
        <Button
          onclick={prevStep}
          variant="outline"
          class="flex-1"
        >
          Back
        </Button>
        <Button
          onclick={nextStep}
          disabled={!canProceed()}
          class="flex-1 bg-black text-white hover:bg-gray-800"
        >
          Continue
        </Button>
      </div>
    {/snippet}
  </OnboardingStep>

<!-- Step 3: Avatar Selection -->
{:else if step === 3}
  <OnboardingStep
    title="Choose Your Avatar"
    subtitle="Pick a profile picture that represents you"
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
        class="mb-8"
      />

      <div class="flex space-x-4">
        <Button
          onclick={prevStep}
          variant="outline"
          class="flex-1"
        >
          Back
        </Button>
        <Button
          onclick={nextStep}
          disabled={!canProceed()}
          class="flex-1 bg-black text-white hover:bg-gray-800"
        >
          Continue
        </Button>
      </div>
    {/snippet}
  </OnboardingStep>

<!-- Step 4: Payout Method -->
{:else if step === 4}
  <OnboardingStep
    title="Set Up Payouts"
    subtitle="Choose how you'll receive payments from sales"
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
          Back
        </Button>
        <Button
          onclick={nextStep}
          disabled={!canProceed()}
          class="flex-1 bg-black text-white hover:bg-gray-800"
        >
          Continue
        </Button>
      </div>
    {/snippet}
  </OnboardingStep>

<!-- Step 5: Social Links -->
{:else if step === 5}
  <OnboardingStep
    title="Connect Your Socials"
    subtitle="Help buyers discover your style (optional)"
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
          Back
        </Button>
        <Button
          onclick={completeOnboarding}
          disabled={submitting}
          loading={submitting}
          class="flex-1 bg-green-600 text-white hover:bg-green-700"
        >
          {submitting ? 'Setting up...' : 'Complete Setup'}
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
/>

<!-- Brand Payment Modal -->
<BrandPaymentModal
  show={showBrandPayment}
  onSuccess={handleBrandPaymentSuccess}
  onCancel={handleBrandPaymentCancel}
  onClose={() => showBrandPayment = false}
/>

<!-- Welcome Tutorial Flow -->
<WelcomeTutorialFlow
  show={showTutorialFlow}
  accountType={accountType}
  onComplete={handleTutorialComplete}
/>