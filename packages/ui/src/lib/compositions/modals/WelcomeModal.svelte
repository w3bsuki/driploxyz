<script lang="ts">
  import Dialog from '../../primitives/dialog/Dialog.svelte';

  interface WelcomeStep {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient?: string;
    color?: string;
  }

  interface Translations {
    welcome?: string;
    welcomeBrand?: string;
    welcomePersonal?: string;
    discover?: string;
    discoverDesc?: string;
    sell?: string;
    sellDesc?: string;
    ready?: string;
    readyDesc?: string;
    back?: string;
    next?: string;
    getStarted?: string;
    skip?: string;
    designer?: string;
    vintage?: string;
    trending?: string;
    totalSales?: string;
    happySellers?: string;
    trustedMarketplace?: string;
  }

  interface Props {
    show?: boolean;
    steps?: WelcomeStep[];
    currentStep?: number;
    onNext?: () => void;
    onPrevious?: () => void;
    onComplete?: () => void;
    onSkip?: () => void;
    translations?: Translations;
    // Backward compatibility props
    username?: string;
  }

  let { 
    show = false,
    steps,
    currentStep = 0,
    onNext,
    onPrevious,
    onComplete,
    onSkip,
    translations = {},
    username
  }: Props = $props();

  // Handle dialog open/close state
  let isOpen = $derived(show);

  const defaultSteps = $derived([
    {
      id: 'welcome',
      title: username 
        ? `${translations.welcome || 'Welcome'} ${username}!`
        : (translations.welcome || 'Welcome to Driplo'),
      description: translations.trustedMarketplace || 'The trusted marketplace for buying and selling pre-owned fashion. Join thousands of users trading quality clothing.',
      icon: '👋',
      gradient: 'bg-gray-900',
      color: 'bg-gray-900'
    },
    {
      id: 'discover',
      title: translations.discover || 'Discover Quality Fashion',
      description: translations.discoverDesc || 'Browse curated items from verified sellers. Find authentic pieces, designer brands, and unique vintage items.',
      icon: '🔍',
      gradient: 'bg-[var(--brand-primary-strong)]',
      color: 'bg-[var(--brand-primary-strong)]'
    },
    {
      id: 'sell',
      title: translations.sell || 'Sell with Confidence',
      description: translations.sellDesc || 'List your items quickly with our simple tools. Secure payments, buyer protection, and transparent fees.',
      icon: '💼',
      gradient: 'bg-[var(--status-success-solid)]',
      color: 'bg-[var(--status-success-solid)]'
    },
    {
      id: 'ready',
      title: translations.ready || 'Ready to Start',
      description: translations.readyDesc || 'Complete your profile setup to start buying and selling. Your secure marketplace experience begins now.',
      icon: '✅',
      gradient: 'bg-[var(--brand-primary)]',
      color: 'bg-[var(--brand-primary)]'
    }
  ]);

  const effectiveSteps = $derived(steps || defaultSteps);

  const currentStepData = $derived(effectiveSteps[currentStep]);
  const isLastStep = $derived(currentStep === effectiveSteps.length - 1);
  const isFirstStep = $derived(currentStep === 0);

  function handleNext() {
    if (isLastStep) {
      onComplete?.();
    } else {
      onNext?.();
    }
  }
</script>

<Dialog 
  open={isOpen} 
  class="welcome-modal-dialog"
  onOpenChange={(open) => {
    if (!open) {
      // Only trigger onSkip if dialog is closing and we're not on the last step
      // This maintains backward compatibility with the show prop behavior
    }
  }}
>
  {#snippet title()}
    <div class="text-center">
      <!-- Progress Bar -->
      <div class="h-1 bg-gray-200/50 rounded-full mb-6 -mt-2 -mx-6">
        <div 
          class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
          style="width: {((currentStep + 1) / effectiveSteps.length) * 100}%"
        ></div>
      </div>

      <!-- Icon -->
      <div class="mb-6">
        <div class="w-16 h-16 mx-auto rounded-xl {currentStepData.color} flex items-center justify-center">
          <span class="text-2xl text-white">{currentStepData.icon}</span>
        </div>
      </div>

      <span class="text-2xl font-bold text-gray-900 leading-tight">
        {currentStepData.title}
      </span>
    </div>
  {/snippet}

  {#snippet children()}
    <div class="text-center">
      <!-- Description -->
      <p class="text-gray-500 text-base leading-relaxed mb-6">
        {currentStepData.description}
      </p>

      <!-- Step Indicators -->
      <div class="flex justify-center space-x-2 mb-6">
        {#each effectiveSteps as step, index}
          <button
            onclick={() => currentStep = index}
            class="w-2 h-2 rounded-full transition-colors duration-300 {index === currentStep ? 'bg-[var(--brand-primary)] w-8' : 'bg-gray-300 hover:bg-gray-400'}"
            aria-label={`Go to step ${index + 1}`}
          ></button>
        {/each}
      </div>

      <!-- Feature Highlights for Discovery Step -->
      {#if currentStepData.id === 'discover'}
        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <div class="text-lg mb-1">👗</div>
            <div class="text-xs font-medium text-gray-900">{translations.designer || 'Designer'}</div>
          </div>
          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <div class="text-lg mb-1">♻️</div>
            <div class="text-xs font-medium text-gray-900">{translations.vintage || 'Vintage'}</div>
          </div>
          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <div class="text-lg mb-1">⚡</div>
            <div class="text-xs font-medium text-gray-900">{translations.trending || 'Trending'}</div>
          </div>
        </div>
      {/if}

      <!-- Stats for Sell Step -->
      {#if currentStepData.id === 'sell'}
        <div class="grid grid-cols-2 gap-3 mb-6">
          <div class="bg-gray-50 rounded-xl p-4 text-center">
            <div class="text-lg font-bold text-green-600 mb-1">$2.5M+</div>
            <div class="text-xs text-gray-500">{translations.totalSales || 'Total Sales'}</div>
          </div>
          <div class="bg-gray-50 rounded-xl p-4 text-center">
            <div class="text-lg font-bold text-[var(--brand-primary-strong)] mb-1">50K+</div>
            <div class="text-xs text-gray-500">{translations.happySellers || 'Happy Sellers'}</div>
          </div>
        </div>
      {/if}
    </div>
  {/snippet}

  {#snippet actions()}
    <div class="flex space-x-3 w-full">
      {#if !isFirstStep}
        <button
          onclick={onPrevious}
          class="btn btn-ghost flex-1 min-h-[44px] px-6 py-3 text-gray-500 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-100/50 transition-colors"
        >
          {translations.back || 'Back'}
        </button>
      {/if}

      <button
        onclick={handleNext}
        class="btn btn-primary flex-1 min-h-[44px] px-6 py-3 bg-[var(--btn-primary-bg)] text-[var(--text-inverse)] font-semibold rounded-xl hover:bg-[var(--btn-primary-hover)] transition-colors"
      >
        {#if isLastStep}
          {translations.getStarted || 'Get Started'}
        {:else}
          {translations.next || 'Next'}
        {/if}
      </button>

      {#if !isLastStep && onSkip}
        <button
          onclick={onSkip}
          class="btn btn-ghost px-4 py-3 min-h-[44px] text-gray-500 hover:text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-100/50 transition-colors"
        >
          {translations.skip || 'Skip'}
        </button>
      {/if}
    </div>
  {/snippet}
</Dialog>

<style>
  /* Custom styling for welcome modal to maintain glass morphism design */
  :global(.welcome-modal-dialog [data-dialog-overlay]) {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  :global(.welcome-modal-dialog [data-dialog-content]) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 1.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.3);
    ring: 1px solid rgba(255, 255, 255, 0.2);
  }

  :global(.welcome-modal-dialog .bg-gray-50) {
    /* Keep actions section clean without the default gray background */
    background: transparent;
  }

  /* Ensure step indicators have proper touch targets on mobile */
  @media (max-width: 640px) {
    :global(.welcome-modal-dialog) button[aria-label*="Go to step"] {
      min-width: 32px;
      min-height: 32px;
      padding: 8px;
    }
  }
</style>