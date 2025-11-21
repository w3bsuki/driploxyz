import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';
// import { getValidationMessage } from './validation'; // Removed - not used

/**
 * Form validation state using Svelte 5 runes
 * Provides reactive validation with proper error handling
 */
export interface FormFieldState {
  value: unknown;
  error: string | null;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  values: T;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  validating: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  hasBeenSubmitted: boolean;
}

/**
 * Create a reactive form validator using Svelte 5 runes
 */
export function createFormValidator<T extends Record<string, unknown>>(
  initialValues: T,
  schema: ZodSchema<T>,
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounceMs?: number;
    locale?: string;
  } = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
    // locale - removed as not used
  } = options;

  // Core form state using $state
  const formState = $state<FormState<T>>({
    values: { ...initialValues },
    errors: Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = null;
      return acc;
    }, {} as Record<keyof T, string | null>),
    touched: Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = false;
      return acc;
    }, {} as Record<keyof T, boolean>),
    dirty: Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = false;
      return acc;
    }, {} as Record<keyof T, boolean>),
    validating: Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = false;
      return acc;
    }, {} as Record<keyof T, boolean>),
    isValid: false,
    isSubmitting: false,
    hasBeenSubmitted: false
  });

  // Derived state for overall form validity
  const isFormValid = $derived(
    Object.values(formState.errors).every(error => error === null) &&
    Object.keys(formState.values).length > 0
  );

  // Update isValid when derived state changes
  $effect(() => {
    formState.isValid = isFormValid;
  });

  // Debounced validation
  const validationTimeouts = new Map<keyof T, ReturnType<typeof setTimeout>>();

  /**
   * Validate a single field
   */
  function validateField(fieldName: keyof T, value: unknown): Promise<string | null> {
    return new Promise((resolve) => {
      formState.validating[fieldName] = true;

      // Clear previous timeout
      const existingTimeout = validationTimeouts.get(fieldName);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout for debounced validation
      const timeout = setTimeout(async () => {
        try {
          // Create a partial object with just this field for validation
          const testData = { ...formState.values, [fieldName]: value };

          // Try to parse with schema
          await schema.parseAsync(testData);
          formState.errors[fieldName] = null;
          resolve(null);
        } catch (error) {
          if (error instanceof ZodError) {
            const fieldError = error.errors.find(err =>
              err.path.includes(fieldName as string)
            );
            const errorMessage = fieldError ?
              // Only use getValidationMessage for known validation codes, otherwise use the original message
              fieldError.message
              : null;
            formState.errors[fieldName] = errorMessage;
            resolve(errorMessage);
          } else {
            formState.errors[fieldName] = 'Validation error';
            resolve('Validation error');
          }
        } finally {
          formState.validating[fieldName] = false;
          validationTimeouts.delete(fieldName);
        }
      }, debounceMs);

      validationTimeouts.set(fieldName, timeout);
    });
  }

  /**
   * Validate entire form
   */
  async function validateForm(): Promise<boolean> {
    try {
      await schema.parseAsync(formState.values);
      // Clear all errors if validation passes
      Object.keys(formState.errors).forEach(key => {
        formState.errors[key as keyof T] = null;
      });
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        // Clear existing errors first
        Object.keys(formState.errors).forEach(key => {
          formState.errors[key as keyof T] = null;
        });

        // Set new errors
        error.errors.forEach(err => {
          const fieldName = err.path[0] as keyof T;
          if (fieldName) {
            formState.errors[fieldName] = err.message;
          }
        });
      }
      return false;
    }
  }

  /**
   * Set field value with validation
   */
  function setFieldValue(fieldName: keyof T, value: unknown) {
    formState.values[fieldName] = value as T[keyof T];
    formState.dirty[fieldName] = value !== initialValues[fieldName];

    if (validateOnChange && formState.touched[fieldName]) {
      validateField(fieldName, value);
    }
  }

  /**
   * Mark field as touched
   */
  function touchField(fieldName: keyof T) {
    formState.touched[fieldName] = true;

    if (validateOnBlur) {
      validateField(fieldName, formState.values[fieldName]);
    }
  }

  /**
   * Reset form to initial state
   */
  function resetForm(newInitialValues?: Partial<T>) {
    const resetValues = newInitialValues ?
      { ...initialValues, ...newInitialValues } :
      initialValues;

    formState.values = { ...resetValues };
    Object.keys(formState.errors).forEach(key => {
      formState.errors[key as keyof T] = null;
    });
    Object.keys(formState.touched).forEach(key => {
      formState.touched[key as keyof T] = false;
    });
    Object.keys(formState.dirty).forEach(key => {
      formState.dirty[key as keyof T] = false;
    });
    Object.keys(formState.validating).forEach(key => {
      formState.validating[key as keyof T] = false;
    });
    formState.isSubmitting = false;
    formState.hasBeenSubmitted = false;

    // Clear any pending validations
    validationTimeouts.forEach(timeout => clearTimeout(timeout));
    validationTimeouts.clear();
  }

  /**
   * Set form submission state
   */
  function setSubmitting(isSubmitting: boolean) {
    formState.isSubmitting = isSubmitting;
    if (isSubmitting) {
      formState.hasBeenSubmitted = true;
    }
  }

  /**
   * Handle form submission with validation
   */
  async function handleSubmit(onSubmit: (values: T) => Promise<void> | void) {
    setSubmitting(true);

    // Mark all fields as touched
    Object.keys(formState.touched).forEach(key => {
      formState.touched[key as keyof T] = true;
    });

    const isValid = await validateForm();

    if (isValid) {
      try {
        await onSubmit(formState.values);
      } catch (error) {
        console.error('Form submission error:', error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    } else {
      setSubmitting(false);
      // Focus first field with error for accessibility
      const firstErrorField = Object.keys(formState.errors).find(key =>
        formState.errors[key as keyof T] !== null
      );
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.focus();
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return isValid;
  }

  /**
   * Get field props for easy binding
   */
  function getFieldProps(fieldName: keyof T) {
    return {
      value: formState.values[fieldName],
      error: formState.errors[fieldName],
      touched: formState.touched[fieldName],
      dirty: formState.dirty[fieldName],
      validating: formState.validating[fieldName],
      setValue: (value: unknown) => setFieldValue(fieldName, value),
      onBlur: () => touchField(fieldName),
      onChange: (value: unknown) => setFieldValue(fieldName, value)
    };
  }

  return {
    // State
    formState,

    // Derived getters that access the reactive state
    get isValid() { return formState.isValid; },
    get hasErrors() { return Object.values(formState.errors).some(error => error !== null); },
    get isDirty() { return Object.values(formState.dirty).some(dirty => dirty); },

    // Methods
    validateField,
    validateForm,
    setFieldValue,
    touchField,
    resetForm,
    setSubmitting,
    handleSubmit,
    getFieldProps
  };
}

/**
 * Enhanced input component properties for better type safety
 */
export interface FormInputProps {
  id: string;
  name: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autocomplete?: import('svelte/elements').FullAutoFill | null;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
  class?: string;
}

/**
 * Generate accessible form input props
 */
export function getInputProps(
  fieldName: string,
  fieldState: ReturnType<typeof createFormValidator>['getFieldProps'] extends (name: string) => infer R ? R : never,
  baseProps: Partial<FormInputProps> = {}
): FormInputProps {
  return {
    id: fieldName,
    name: fieldName,
    'aria-invalid': fieldState.error !== null,
    'aria-describedby': fieldState.error ? `${fieldName}-error` : undefined,
    ...baseProps
  };
}

/**
 * Form field validation status for UI feedback
 */
export function getFieldStatus(
  fieldState: ReturnType<typeof createFormValidator>['getFieldProps'] extends (name: string) => infer R ? R : never
) {
  if (fieldState.validating) return 'validating';
  if (fieldState.error && fieldState.touched) return 'error';
  if (!fieldState.error && fieldState.touched && fieldState.dirty) return 'success';
  return 'default';
}

/**
 * Get form field CSS classes based on state
 */
export function getFieldClasses(
  fieldState: ReturnType<typeof createFormValidator>['getFieldProps'] extends (name: string) => infer R ? R : never,
  baseClasses = ''
): string {
  const status = getFieldStatus(fieldState);

  const statusClasses = {
    default: 'border-[color:var(--border-default)] focus:border-[color:var(--state-focus)] focus:ring-[color:var(--state-focus)]',
    validating: 'border-[color:var(--border-default)] focus:border-[color:var(--state-focus)] focus:ring-[color:var(--state-focus)]',
    error: 'border-[color:var(--status-error-border)] focus:border-[color:var(--status-error-border)] focus:ring-[color:var(--status-error-border)]',
    success: 'border-[color:var(--status-success-border)] focus:border-[color:var(--status-success-border)] focus:ring-[color:var(--status-success-border)]'
  };

  return `${baseClasses} ${statusClasses[status]}`.trim();
}