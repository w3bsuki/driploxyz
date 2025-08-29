<script lang="ts">
  interface Translations {
    welcomeTitle?: string;
    welcomeContent?: string;
    discoverTitle?: string;
    discoverContent?: string;
    listItemTitle?: string;
    listItemContentBrand?: string;
    listItemContentPersonal?: string;
    stayConnectedTitle?: string;
    stayConnectedContent?: string;
    readyTitle?: string;
    readyContent?: string;
    skip?: string;
    next?: string;
    getStarted?: string;
  }

  interface Props {
    show: boolean;
    accountType: 'personal' | 'brand';
    onComplete: () => void;
    translations?: Translations;
  }

  let { show, accountType, onComplete, translations = {} }: Props = $props();

  let currentStep = $state(0);

  const tutorialSteps = [
    {
      title: translations.welcomeTitle || "Welcome to Driplo! 👋",
      content: translations.welcomeContent || "You're all set up! Let's quickly show you how to make the most of our marketplace.",
      icon: "🎉"
    },
    {
      title: translations.discoverTitle || "Discover Amazing Items",
      content: translations.discoverContent || "Use the search bar to find specific items or browse categories to discover unique clothing pieces.",
      icon: "🔍"
    },
    {
      title: translations.listItemTitle || "List Your First Item", 
      content: accountType === 'brand' 
        ? (translations.listItemContentBrand || "As a brand account, you have access to bulk upload tools and advanced analytics for your listings.")
        : (translations.listItemContentPersonal || "Ready to sell? Click the '+' button to list your first item. Add great photos and honest descriptions."),
      icon: "📸"
    },
    {
      title: translations.stayConnectedTitle || "Stay Connected",
      content: translations.stayConnectedContent || "Use our messaging system to chat with buyers/sellers. Get notifications for new messages and offers.",
      icon: "💬"
    },
    {
      title: translations.readyTitle || "You're Ready!",
      content: translations.readyContent || "Check your dashboard for your listings, messages, and account settings. Happy trading!",
      icon: "✨"
    }
  ];

  function nextStep() {
    if (currentStep < tutorialSteps.length - 1) {
      currentStep++;
    } else {
      onComplete();
    }
  }

  function skipTutorial() {
    onComplete();
  }

  const currentTutorial = $derived(tutorialSteps[currentStep]);
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 md:backdrop-blur-xs">
    <div class="w-full max-w-sm bg-white rounded-lg shadow-sm md:shadow-lg border border-gray-200 p-5">
      <!-- Progress indicator -->
      <div class="flex justify-center mb-4">
        <div class="flex gap-1">
          {#each tutorialSteps as _, index}
            <div class="w-2 h-2 rounded-full transition-colors {index <= currentStep ? 'bg-gray-900' : 'bg-gray-300'}"></div>
          {/each}
        </div>
      </div>

      <!-- Content -->
      <div class="text-center mb-6">
        <div class="text-3xl mb-3">{currentTutorial.icon}</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{currentTutorial.title}</h3>
        <p class="text-sm text-gray-600 leading-relaxed">{currentTutorial.content}</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button 
          onclick={skipTutorial}
          class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {translations.skip || 'Skip'}
        </button>
        <button 
          onclick={nextStep}
          class="flex-1 px-4 py-1.5 text-sm text-white bg-gray-900 rounded-sm hover:bg-gray-800 transition-colors"
        >
          {currentStep < tutorialSteps.length - 1 ? (translations.next || 'Next') : (translations.getStarted || 'Get Started')}
        </button>
      </div>
    </div>
  </div>
{/if}