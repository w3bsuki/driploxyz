import { browser } from '$app/environment';

export interface TutorialStep {
  id: string;
  step: number;
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  route?: string; // Which route this tip should show on
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'sell-first-item',
    step: 1,
    title: 'List Your First Item',
    description: 'Tap the sell button to start listing your fashion items. It takes less than 2 minutes!',
    targetElement: '[data-tutorial="sell-button"]',
    position: 'top',
    route: '/dashboard'
  },
  {
    id: 'browse-items',
    step: 2,
    title: 'Discover Amazing Fashion',
    description: 'Browse trending items from verified sellers. Use filters to find exactly what you want.',
    targetElement: '[data-tutorial="search-bar"]',
    position: 'bottom',
    route: '/'
  },
  {
    id: 'check-earnings',
    step: 3,
    title: 'Track Your Earnings',
    description: 'View your sales, payouts, and analytics in your account dashboard.',
    targetElement: '[data-tutorial="account-menu"]',
    position: 'left',
    route: '/dashboard'
  },
  {
    id: 'messages',
    step: 4,
    title: 'Chat with Buyers & Sellers',
    description: 'Negotiate prices, ask questions, and coordinate shipping through secure messaging.',
    targetElement: '[data-tutorial="messages-icon"]',
    position: 'left',
    route: '/dashboard'
  },
  {
    id: 'complete-profile',
    step: 5,
    title: 'Build Your Reputation',
    description: 'Complete your profile and get verified to build trust with buyers.',
    targetElement: '[data-tutorial="profile-link"]',
    position: 'left',
    route: '/dashboard'
  }
];

const STORAGE_KEY = 'driplo_tutorial_progress';

interface TutorialState {
  currentStep: number;
  completed: boolean;
  dismissed: boolean;
  shownSteps: string[];
}

function getStoredState(): TutorialState {
  if (!browser) return { currentStep: 1, completed: false, dismissed: false, shownSteps: [] };
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Intentionally empty - localStorage errors fall back to default state
  }
  
  return {
    currentStep: 1,
    completed: false,
    dismissed: false,
    shownSteps: []
  };
}

function saveState(state: TutorialState) {
  if (!browser) return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Intentionally empty - localStorage save errors are non-critical
  }
}

// Create reactive state using Svelte 5 runes
let tutorialState = $state<TutorialState>(getStoredState());

// Auto-save to localStorage whenever state changes
$effect(() => {
  saveState(tutorialState);
});

export const tutorial = {
  // Reactive state getter for backward compatibility
  get state() {
    return tutorialState;
  },

  // For backward compatibility with existing store-based code
  subscribe(run: (value: TutorialState) => void) {
    $effect(() => {
      run(tutorialState);
    });
    return () => {}; // Cleanup handled by effect
  },

  // Get current step for a specific route
  getCurrentStep(route: string): TutorialStep | null {
    if (tutorialState.dismissed || tutorialState.completed) {
      return null;
    }

    // Find steps for this route that haven't been shown
    const routeSteps = TUTORIAL_STEPS.filter(
      step => step.route === route && !tutorialState.shownSteps.includes(step.id)
    );

    // Return the lowest numbered step for this route
    return routeSteps.sort((a, b) => a.step - b.step)[0] || null;
  },

  // Mark a step as shown
  markStepShown(stepId: string) {
    tutorialState = {
      ...tutorialState,
      shownSteps: [...tutorialState.shownSteps, stepId],
      currentStep: tutorialState.currentStep + 1
    };
  },

  // Go to next step
  nextStep() {
    const newStep = tutorialState.currentStep + 1;

    if (newStep > TUTORIAL_STEPS.length) {
      tutorialState = {
        ...tutorialState,
        currentStep: newStep,
        completed: true
      };
    } else {
      tutorialState = {
        ...tutorialState,
        currentStep: newStep
      };
    }
  },

  // Dismiss tutorial
  dismiss() {
    tutorialState = {
      ...tutorialState,
      dismissed: true
    };
  },

  // Reset tutorial (for testing or re-enabling)
  reset() {
    const freshState = {
      currentStep: 1,
      completed: false,
      dismissed: false,
      shownSteps: []
    };
    tutorialState = freshState;
    saveState(freshState);
  },

  // Check if user should see tutorial
  shouldShowTutorial(): boolean {
    return !tutorialState.dismissed && !tutorialState.completed && tutorialState.currentStep <= TUTORIAL_STEPS.length;
  },

  getTotalSteps(): number {
    return TUTORIAL_STEPS.length;
  }
};