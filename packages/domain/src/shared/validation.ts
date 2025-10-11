/**
 * Business Rules & Validation
 *
 * Validators and business rules for domain entities.
 */

// Placeholder for validation exports
// Will be populated as validators are extracted

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Use a unique name to avoid collisions in consumer type spaces and DTS
export class DomainValidationError extends Error {
  public errors: string[];

  constructor(errors: string[]) {
    super('Validation failed');
    this.name = 'DomainValidationError';
    this.errors = errors;
  }
}
