import type { Money, Slug } from './entities';

/**
 * Value Object implementations with validation
 */

export class MoneyValueObject implements Money {
  readonly amount: number;
  readonly currency: string;

  constructor(amount: number, currency: string = 'USD') {
    this.validateAmount(amount);
    this.validateCurrency(currency);

    this.amount = amount;
    this.currency = currency.toUpperCase();
  }

  private validateAmount(amount: number): void {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Amount must be a valid number');
    }
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (amount > 999999.99) {
      throw new Error('Amount exceeds maximum allowed value');
    }
  }

  private validateCurrency(currency: string): void {
    if (typeof currency !== 'string' || currency.trim().length === 0) {
      throw new Error('Currency must be a non-empty string');
    }
    if (!/^[A-Z]{3}$/.test(currency.toUpperCase())) {
      throw new Error('Currency must be a valid 3-letter ISO 4217 code');
    }
  }

  static fromDatabase(amount: number, currency: string): MoneyValueObject {
    return new MoneyValueObject(amount, currency);
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}

export class SlugValueObject implements Slug {
  readonly value: string;

  constructor(value: string) {
    this.validateSlug(value);
    this.value = value.toLowerCase().trim();
  }

  private validateSlug(value: string): void {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('Slug cannot be empty');
    }
    if (value.trim().length > 255) {
      throw new Error('Slug cannot exceed 255 characters');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.toLowerCase())) {
      throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
    }
    if (value.startsWith('-') || value.endsWith('-')) {
      throw new Error('Slug cannot start or end with a hyphen');
    }
  }

  static fromString(value: string): SlugValueObject {
    return new SlugValueObject(value);
  }

  static fromDatabase(value: string): SlugValueObject {
    return new SlugValueObject(value);
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Helper functions for creating value objects from database data
 */
export const createMoney = (amount: number, currency?: string): MoneyValueObject => {
  return new MoneyValueObject(amount, currency);
};

export const createSlug = (value: string): SlugValueObject => {
  return new SlugValueObject(value);
};