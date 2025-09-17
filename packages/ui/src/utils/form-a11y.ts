/**
 * Form accessibility utilities for labels, error states, and ARIA relationships
 * Used in Input, Select, SearchBar, and other form components
 */

import { generateA11yId } from './a11y.js';

/**
 * Configuration for form field accessibility
 */
export interface FormFieldA11yConfig {
  /** Field identifier (used for ID generation) */
  fieldId?: string;
  /** Label text (required for accessibility) */
  label?: string;
  /** Whether label should be visually hidden but accessible to screen readers */
  labelVisuallyHidden?: boolean;
  /** Helper text to describe the field */
  helperText?: string;
  /** Error message to display when field is invalid */
  errorMessage?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is currently invalid */
  invalid?: boolean;
}

/**
 * Generated accessibility attributes for a form field
 */
export interface FormFieldA11yAttributes {
  /** ID for the input element */
  inputId: string;
  /** ID for the label element */
  labelId: string;
  /** ID for the helper text element (if present) */
  helperTextId?: string;
  /** ID for the error message element (if present) */
  errorId?: string;
  /** Space-separated list of IDs that describe the input */
  ariaDescribedBy?: string;
  /** Whether the input is marked as invalid */
  ariaInvalid?: boolean;
  /** Whether the input is required */
  ariaRequired?: boolean;
}

/**
 * Generates all accessibility attributes needed for a form field
 * Handles label relationships, error states, helper text, and required fields
 * 
 * @param config - Form field configuration
 * @returns Accessibility attributes to apply to form elements
 * 
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { generateFormFieldA11y } from '@repo/ui/utils/form-a11y';
 *   
 *   let { 
 *     value = $bindable(), 
 *     label, 
 *     helperText, 
 *     errorMessage, 
 *     required = false,
 *     invalid = false 
 *   } = $props();
 *   
 *   const a11y = generateFormFieldA11y({
 *     label,
 *     helperText,
 *     errorMessage,
 *     required,
 *     invalid
 *   });
 * </script>
 * 
 * <label for={a11y.inputId} class:sr-only={labelVisuallyHidden}>
 *   {label}
 *   {#if required}<span aria-label="required">*</span>{/if}
 * </label>
 * 
 * <input
 *   id={a11y.inputId}
 *   bind:value
 *   aria-describedby={a11y.ariaDescribedBy}
 *   aria-invalid={a11y.ariaInvalid}
 *   aria-required={a11y.ariaRequired}
 * />
 * 
 * {#if helperText}
 *   <div id={a11y.helperTextId} class="text-sm text-gray-600">
 *     {helperText}
 *   </div>
 * {/if}
 * 
 * {#if invalid && errorMessage}
 *   <div id={a11y.errorId} class="text-sm text-red-600" role="alert">
 *     {errorMessage}
 *   </div>
 * {/if}
 * ```
 */
export function generateFormFieldA11y(config: FormFieldA11yConfig): FormFieldA11yAttributes {
  const baseId = config.fieldId || generateA11yId('field');
  
  const attributes: FormFieldA11yAttributes = {
    inputId: baseId,
    labelId: `${baseId}-label`
  };
  
  const describedByIds: string[] = [];
  
  // Add helper text ID if present
  if (config.helperText) {
    attributes.helperTextId = `${baseId}-helper`;
    describedByIds.push(attributes.helperTextId);
  }
  
  // Add error ID if field is invalid and has error message
  if (config.invalid && config.errorMessage) {
    attributes.errorId = `${baseId}-error`;
    describedByIds.push(attributes.errorId);
  }
  
  // Set aria-describedby if there are describing elements
  if (describedByIds.length > 0) {
    attributes.ariaDescribedBy = describedByIds.join(' ');
  }
  
  // Set validation attributes
  if (config.invalid) {
    attributes.ariaInvalid = true;
  }
  
  if (config.required) {
    attributes.ariaRequired = true;
  }
  
  return attributes;
}

/**
 * Validation state management for forms
 * Helps manage field validation states and error messages
 */
export interface FieldValidation {
  isValid: boolean;
  errorMessage?: string;
  touched?: boolean;
}

export type FormValidation<T extends Record<string, any>> = {
  [K in keyof T]: FieldValidation;
};

/**
 * Creates a validation helper for form fields
 * 
 * @param initialFields - Initial field names to track
 * @returns Validation state manager
 * 
 * @example
 * ```ts
 * const validation = createFormValidation(['email', 'password']);
 * 
 * // Set field as invalid
 * validation.setFieldError('email', 'Please enter a valid email address');
 * 
 * // Mark field as touched
 * validation.setFieldTouched('email', true);
 * 
 * // Check if form is valid
 * if (validation.isFormValid()) {
 *   // Submit form
 * }
 * ```
 */
export function createFormValidation<T extends Record<string, any>>(
  initialFields: (keyof T)[]
): {
  fields: FormValidation<T>;
  setFieldError: (field: keyof T, message: string) => void;
  clearFieldError: (field: keyof T) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  isFormValid: () => boolean;
  getFieldProps: (field: keyof T) => { invalid: boolean; errorMessage?: string };
} {
  const fields = {} as FormValidation<T>;
  
  // Initialize fields
  for (const field of initialFields) {
    fields[field] = {
      isValid: true,
      touched: false
    };
  }
  
  return {
    fields,
    
    setFieldError(field: keyof T, message: string) {
      fields[field] = {
        ...fields[field],
        isValid: false,
        errorMessage: message
      };
    },
    
    clearFieldError(field: keyof T) {
      fields[field] = {
        ...fields[field],
        isValid: true,
        errorMessage: undefined
      };
    },
    
    setFieldTouched(field: keyof T, touched: boolean) {
      fields[field] = {
        ...fields[field],
        touched
      };
    },
    
    isFormValid(): boolean {
      return Object.values(fields).every(field => field.isValid);
    },
    
    getFieldProps(field: keyof T) {
      const fieldState = fields[field];
      return {
        invalid: !fieldState.isValid && (fieldState.touched ?? false),
        errorMessage: fieldState.errorMessage
      };
    }
  };
}

/**
 * Common ARIA live region for form validation announcements
 * Use this to announce validation errors or success messages
 * 
 * @param message - Message to announce
 * @param type - Type of announcement ('error', 'success', 'info')
 * 
 * @example
 * ```ts
 * // Announce form errors
 * announceFormMessage('Please fix the errors below', 'error');
 * 
 * // Announce successful submission
 * announceFormMessage('Form submitted successfully', 'success');
 * ```
 */
export function announceFormMessage(
  message: string, 
  type: 'error' | 'success' | 'info' = 'info'
): void {
  // Use assertive for errors, polite for others
  const priority = type === 'error' ? 'assertive' : 'polite';
  
  // Import announceToScreenReader dynamically to avoid circular imports
  const announce = async () => {
    const { announceToScreenReader } = await import('./a11y.js');
    announceToScreenReader(message, priority);
  };
  
  announce();
}

/**
 * Input validation patterns and messages
 */
export const ValidationPatterns = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
  },
  
  phone: {
    pattern: /^[\+]?[(]?[\+]?\d{2,3}[)]?[-\s\.]?\d{3,4}[-\s\.]?\d{3,6}$/,
    message: 'Please enter a valid phone number'
  },
  
  required: {
    pattern: /\S+/,
    message: 'This field is required'
  }
} as const;

/**
 * Validates a field value against common patterns
 * 
 * @param value - Value to validate
 * @param rules - Validation rules to apply
 * @returns Validation result
 * 
 * @example
 * ```ts
 * const emailResult = validateField(emailValue, ['required', 'email']);
 * if (!emailResult.isValid) {
 *   console.log(emailResult.errorMessage);
 * }
 * ```
 */
export function validateField(
  value: string,
  rules: (keyof typeof ValidationPatterns)[]
): { isValid: boolean; errorMessage?: string } {
  const trimmedValue = value?.trim() || '';
  
  for (const rule of rules) {
    const validator = ValidationPatterns[rule];
    if (!validator.pattern.test(trimmedValue)) {
      return {
        isValid: false,
        errorMessage: validator.message
      };
    }
  }
  
  return { isValid: true };
}