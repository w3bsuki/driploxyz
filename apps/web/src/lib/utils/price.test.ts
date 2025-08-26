import { describe, it, expect } from 'vitest';
import { formatPrice } from './price';

describe('formatPrice', () => {
	it('formats USD prices correctly', () => {
		expect(formatPrice(10.99, 'en')).toBe('$10.99');
		expect(formatPrice(100, 'en')).toBe('$100');
	});

	it('formats Bulgarian prices correctly', () => {
		expect(formatPrice(10, 'bg')).toBe('10лв');
		expect(formatPrice(10.50, 'bg')).toBe('10.50лв');
	});

	it('handles edge cases', () => {
		expect(formatPrice(0, 'en')).toBe('$0');
		expect(formatPrice(0.01, 'en')).toBe('$0.01');
	});

	it('defaults to en locale when locale not supported', () => {
		expect(formatPrice(10.99, 'unsupported')).toBe('$10.99');
	});
});