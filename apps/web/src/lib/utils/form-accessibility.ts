/**
 * Form accessibility utilities for better screen reader support and keyboard navigation
 */

/**
 * Announce form validation errors to screen readers
 */
export function announceFormErrors(errors: Record<string, string | null>) {
  const errorMessages = Object.entries(errors)
    .filter(([, error]) => error !== null)
    .map(([field, error]) => `${field}: ${error}`)
    .join('. ');

  if (errorMessages) {
    announceToScreenReader(`Form has errors: ${errorMessages}`);
  }
}

/**
 * Announce a message to screen readers using aria-live region
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  // Create or find existing announcement region
  let announcer = document.getElementById('form-announcer');

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'form-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    document.body.appendChild(announcer);
  }

  // Clear and set new message
  announcer.textContent = '';
  setTimeout(() => {
    announcer!.textContent = message;
  }, 100);
}

/**
 * Focus management for form fields
 */
export function focusFirstErrorField(errors: Record<string, string | null>) {
  const firstErrorField = Object.keys(errors).find(fieldName =>
    errors[fieldName] !== null
  );

  if (firstErrorField) {
    const element = document.getElementById(firstErrorField);
    if (element) {
      element.focus();
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });

      // Announce the error
      const error = errors[firstErrorField];
      if (error) {
        announceToScreenReader(`${firstErrorField} field has error: ${error}`);
      }
    }
  }
}

/**
 * Keyboard navigation helpers
 */
export function handleFormKeyboardNavigation(event: KeyboardEvent) {
  const form = event.currentTarget as HTMLFormElement;

  if (event.key === 'Escape') {
    // Clear focus from current field
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && form.contains(activeElement)) {
      activeElement.blur();
    }
  }

  if (event.key === 'Enter' && event.ctrlKey) {
    // Ctrl+Enter submits form
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton && !submitButton.disabled) {
      submitButton.click();
    }
  }
}

/**
 * Generate unique IDs for form fields
 */
export function generateFieldId(baseName: string, suffix?: string): string {
  const base = baseName.replace(/[^a-zA-Z0-9-_]/g, '-');
  return suffix ? `${base}-${suffix}` : base;
}

/**
 * Form field description and error ID generators
 */
export function getFieldErrorId(fieldName: string): string {
  return generateFieldId(fieldName, 'error');
}

export function getFieldDescriptionId(fieldName: string): string {
  return generateFieldId(fieldName, 'description');
}

export function getFieldHintId(fieldName: string): string {
  return generateFieldId(fieldName, 'hint');
}

/**
 * Build aria-describedby attribute value
 */
export function buildAriaDescribedBy(fieldName: string, options: {
  hasError?: boolean;
  hasDescription?: boolean;
  hasHint?: boolean;
} = {}): string | undefined {
  const ids: string[] = [];

  if (options.hasDescription) {
    ids.push(getFieldDescriptionId(fieldName));
  }

  if (options.hasHint) {
    ids.push(getFieldHintId(fieldName));
  }

  if (options.hasError) {
    ids.push(getFieldErrorId(fieldName));
  }

  return ids.length > 0 ? ids.join(' ') : undefined;
}

/**
 * Validate form accessibility
 */
export function validateFormAccessibility(form: HTMLFormElement): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for form labels
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const element = input as HTMLInputElement;
    const id = element.id;
    const name = element.name;

    if (!id) {
      issues.push(`Input at index ${index} is missing an ID attribute`);
    }

    if (!name) {
      issues.push(`Input at index ${index} is missing a name attribute`);
    }

    // Check for associated label
    const label = id ? form.querySelector(`label[for="${id}"]`) : null;
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');

    if (!label && !ariaLabel && !ariaLabelledBy) {
      issues.push(`Input "${id || name || index}" has no accessible label`);
    }
  });

  // Check for submit button
  const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
  if (!submitButton) {
    issues.push('Form is missing a submit button');
  }

  // Check for error containers
  const errorElements = form.querySelectorAll('[role="alert"], [aria-live]');
  if (errorElements.length === 0) {
    issues.push('Form lacks proper error announcement regions');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Form validation timing helpers
 */
export const VALIDATION_DELAYS = {
  IMMEDIATE: 0,
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

/**
 * Debounce validation to prevent excessive API calls
 */
export function createValidationDebouncer(delay: number = VALIDATION_DELAYS.NORMAL) {
  const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  return function debounceValidation(
    key: string,
    validationFn: () => Promise<void> | void
  ) {
    // Clear existing timeout
    const existingTimeout = timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      try {
        await validationFn();
      } catch (error) {
        console.warn(`Validation error for ${key}:`, error);
      } finally {
        timeouts.delete(key);
      }
    }, delay);

    timeouts.set(key, timeout);
  };
}

/**
 * Form progress tracking for multi-step forms
 */
export interface FormStep {
  id: string;
  title: string;
  isValid: boolean;
  isComplete: boolean;
  isCurrent: boolean;
}

export function announceStepChange(currentStep: FormStep, totalSteps: number) {
  const stepNumber = parseInt(currentStep.id) || 1;
  announceToScreenReader(
    `Step ${stepNumber} of ${totalSteps}: ${currentStep.title}`,
    'assertive'
  );
}

export function announceFormCompletion(successMessage?: string) {
  const message = successMessage || 'Form submitted successfully';
  announceToScreenReader(message, 'assertive');
}