/**
 * i18n Text Expansion Testing Utility
 * 
 * Provides utilities for testing UI components with text expansion/contraction scenarios
 * to ensure layout stability across different languages.
 * 
 * Use cases:
 * - Test 25% text expansion (Arabic-like languages)
 * - Test 10% text contraction (Danish-like languages)
 * - Validate button layouts with longer text
 * - Test modal widths with expanded text
 * - Verify tooltip positioning with longer content
 */

export interface TextExpansionTestScenario {
  key: string;
  original: string;
  expanded: string;
  contracted: string;
  context: 'button' | 'label' | 'tooltip' | 'modal_title' | 'navigation';
  category: 'filter' | 'category' | 'action' | 'status';
}

/**
 * Common text expansion test scenarios for filter components
 */
export const FILTER_TEXT_EXPANSION_SCENARIOS: TextExpansionTestScenario[] = [
  // Filter UI elements
  {
    key: 'filter_modal_title',
    original: 'Filters',
    expanded: 'Advanced Product Filters',
    contracted: 'Filter',
    context: 'modal_title',
    category: 'filter'
  },
  {
    key: 'filter_modal_applyFilters',
    original: 'Apply Filters',
    expanded: 'Apply All Selected Filters',
    contracted: 'Apply',
    context: 'button',
    category: 'action'
  },
  {
    key: 'filter_modal_clearAll',
    original: 'Clear All',
    expanded: 'Clear All Applied Filters',
    contracted: 'Clear',
    context: 'button',
    category: 'action'
  },
  {
    key: 'category_dropdown_allCategories',
    original: 'All Categories',
    expanded: 'All Available Product Categories',
    contracted: 'All',
    context: 'label',
    category: 'category'
  },
  {
    key: 'filter_applied_clearAll',
    original: 'Clear all',
    expanded: 'Clear all active filters',
    contracted: 'Clear',
    context: 'button',
    category: 'action'
  },
  // Status messages
  {
    key: 'filter_ui_filterApplied',
    original: 'filter applied',
    expanded: 'product filter has been successfully applied',
    contracted: 'applied',
    context: 'status',
    category: 'status'
  },
  {
    key: 'filter_ui_allFiltersCleared',
    original: 'All filters cleared',
    expanded: 'All product filters have been completely cleared',
    contracted: 'Cleared',
    context: 'status',
    category: 'status'
  },
  // Navigation elements
  {
    key: 'category_dropdown_backToCategories',
    original: 'Back to Categories',
    expanded: 'Navigate Back to Main Categories',
    contracted: 'Back',
    context: 'navigation',
    category: 'category'
  }
];

/**
 * Creates a pseudo-localization version of text with specified expansion factor
 * 
 * @param text Original text
 * @param expansionFactor Multiplier for text length (1.25 for 25% expansion, 0.9 for 10% contraction)
 * @param pseudoPrefix Prefix to make pseudo text obvious (defaults to '[PSEUDO]')
 * @returns Pseudo-localized text
 */
export function createPseudoLocalizedText(
  text: string, 
  expansionFactor: number = 1.25, 
  pseudoPrefix: string = '[PSEUDO]'
): string {
  if (expansionFactor <= 1) {
    // For contraction, just add prefix and return original or truncated
    return expansionFactor < 1 ? `${pseudoPrefix}${text.slice(0, Math.floor(text.length * expansionFactor))}` : `${pseudoPrefix}${text}`;
  }
  
  // For expansion, add repeated vowels and extra characters
  const targetLength = Math.floor(text.length * expansionFactor);
  const additionalLength = targetLength - text.length;
  
  if (additionalLength <= 0) {
    return `${pseudoPrefix}${text}`;
  }
  
  // Create expanded version by repeating vowels and adding filler
  let expandedText = text.replace(/[aeiouAEIOU]/g, (vowel) => vowel + vowel);
  
  // If still not long enough, add filler characters
  while (expandedText.length < targetLength) {
    expandedText += 'ü';
  }
  
  return `${pseudoPrefix}${expandedText.slice(0, targetLength)}`;
}

/**
 * Layout breakpoint tests for responsive components
 */
export const LAYOUT_BREAKPOINT_TESTS = {
  mobile: { width: 320, height: 568 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1440, height: 900 }, // Desktop
  wide: { width: 1920, height: 1080 } // Wide screen
};

/**
 * Critical measurements for filter components that need text expansion testing
 */
export const CRITICAL_MEASUREMENTS = {
  filterPill: {
    minHeight: 32, // var(--touch-standard)
    maxWidth: 200,
    padding: 12,
    expectedTextLength: { min: 3, max: 20 }
  },
  filterModal: {
    minWidth: 320,
    maxWidth: 512,
    titleMaxLength: 30,
    buttonMinWidth: 120
  },
  categoryDropdown: {
    triggerMinWidth: 160,
    dropdownMaxWidth: 320,
    itemMaxLength: 25
  },
  appliedFilters: {
    pillMaxWidth: 192,
    displayTextMaxLength: 20
  }
};

/**
 * Test runner configuration for automated text expansion testing
 */
export interface TextExpansionTestConfig {
  scenarios: TextExpansionTestScenario[];
  breakpoints: typeof LAYOUT_BREAKPOINT_TESTS;
  expansionFactors: number[];
  measurementTargets: string[];
  failureThresholds: {
    layoutShift: number; // pixels
    textOverflow: boolean;
    buttonMinWidth: number; // pixels
  };
}

export const DEFAULT_TEST_CONFIG: TextExpansionTestConfig = {
  scenarios: FILTER_TEXT_EXPANSION_SCENARIOS,
  breakpoints: LAYOUT_BREAKPOINT_TESTS,
  expansionFactors: [0.9, 1.0, 1.25, 1.5], // 10% contraction, normal, 25% expansion, 50% expansion
  measurementTargets: [
    '[data-testid="filter-pill"]',
    '[data-testid="filter-modal"]',
    '[data-testid="category-dropdown"]',
    '[data-testid="applied-filters"]'
  ],
  failureThresholds: {
    layoutShift: 5, // Max 5px layout shift acceptable
    textOverflow: false, // No text should overflow
    buttonMinWidth: 44 // Minimum touch target size
  }
};

/**
 * Utility to generate test data for Storybook or component testing
 */
export function generateTextExpansionTestData(scenario: TextExpansionTestScenario) {
  return {
    normal: scenario.original,
    expanded: scenario.expanded,
    contracted: scenario.contracted,
    pseudo125: createPseudoLocalizedText(scenario.original, 1.25),
    pseudo150: createPseudoLocalizedText(scenario.original, 1.5),
    pseudo90: createPseudoLocalizedText(scenario.original, 0.9)
  };
}

/**
 * Mock i18n function for testing purposes
 */
export function createMockI18nWithExpansion(expansionFactor: number = 1.25) {
  return new Proxy({}, {
    get: (target, prop) => {
      return () => {
        const key = String(prop);
        const scenario = FILTER_TEXT_EXPANSION_SCENARIOS.find(s => s.key === key);
        
        if (scenario) {
          if (expansionFactor > 1.1) return scenario.expanded;
          if (expansionFactor < 0.95) return scenario.contracted;
          return scenario.original;
        }
        
        // Fallback: create pseudo-localized version of the key
        return createPseudoLocalizedText(key.replace(/[_]/g, ' '), expansionFactor);
      };
    }
  });
}

/**
 * CSS class generator for text expansion testing
 */
export function generateTestingCSS(): string {
  return `
    /* Text expansion testing utilities */
    .i18n-test-expanded {
      /* Simulate 25% text expansion */
      letter-spacing: 0.05em;
      font-stretch: expanded;
    }
    
    .i18n-test-contracted {
      /* Simulate 10% text contraction */
      font-stretch: condensed;
      letter-spacing: -0.01em;
    }
    
    .i18n-test-pseudo {
      /* Highlight pseudo-localized content */
      background: rgba(255, 255, 0, 0.1);
      border: 1px dashed rgba(255, 255, 0, 0.3);
    }
    
    /* Debug helpers */
    .i18n-test-debug [data-testid] {
      outline: 1px solid rgba(0, 255, 0, 0.3);
      position: relative;
    }
    
    .i18n-test-debug [data-testid]:before {
      content: attr(data-testid);
      position: absolute;
      top: -20px;
      left: 0;
      font-size: 10px;
      background: rgba(0, 255, 0, 0.8);
      color: white;
      padding: 2px 4px;
      border-radius: 2px;
      z-index: 1000;
    }
  `;
}