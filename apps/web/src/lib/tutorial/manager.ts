import { writable, get } from 'svelte/store';
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
  } catch (e) {
    console.error('Failed to load tutorial state:', e);
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
  } catch (e) {
    console.error('Failed to save tutorial state:', e);
  }
}

// Create the store
const tutorialState = writable<TutorialState>(getStoredState());

// Subscribe to changes and save to localStorage
tutorialState.subscribe(state => {
  saveState(state);
});

export const tutorial = {
  state: tutorialState,
  
  // Get current step for a specific route
  getCurrentStep(route: string): TutorialStep | null {
    const state = get(tutorialState);
    
    if (state.dismissed || state.completed) {
      return null;
    }
    
    // Find steps for this route that haven't been shown
    const routeSteps = TUTORIAL_STEPS.filter(
      step => step.route === route && !state.shownSteps.includes(step.id)
    );
    
    // Return the lowest numbered step for this route
    return routeSteps.sort((a, b) => a.step - b.step)[0] || null;
  },
  
  // Mark a step as shown
  markStepShown(stepId: string) {
    tutorialState.update(state => ({
      ...state,
      shownSteps: [...state.shownSteps, stepId],
      currentStep: state.currentStep + 1
    }));
  },
  
  // Go to next step
  nextStep() {
    tutorialState.update(state => {
      const newStep = state.currentStep + 1;
      
      if (newStep > TUTORIAL_STEPS.length) {
        return {
          ...state,
          currentStep: newStep,
          completed: true
        };
      }
      
      return {
        ...state,
        currentStep: newStep
      };
    });
  },
  
  // Dismiss tutorial
  dismiss() {
    tutorialState.update(state => ({
      ...state,
      dismissed: true
    }));
  },
  
  // Reset tutorial (for testing or re-enabling)
  reset() {
    const freshState = {
      currentStep: 1,
      completed: false,
      dismissed: false,
      shownSteps: []
    };
    tutorialState.set(freshState);
    saveState(freshState);
  },
  
  // Check if user should see tutorial
  shouldShowTutorial(): boolean {
    const state = get(tutorialState);
    return !state.dismissed && !state.completed && state.currentStep <= TUTORIAL_STEPS.length;
  },
  
  getTotalSteps(): number {
    return TUTORIAL_STEPS.length;
  }
};