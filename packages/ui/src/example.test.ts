import { describe, it, expect, vi } from 'vitest';

describe('@repo/ui Package Testing', () => {
	it('should run basic tests', () => {
		expect(1 + 1).toBe(2);
	});

	it('should work with utilities', () => {
		// Test utility functions that might be in the UI package
		const mockFn = vi.fn();
		mockFn('test');
		
		expect(mockFn).toHaveBeenCalledWith('test');
	});

	it('should handle string manipulation', () => {
		// Example of testing utility functions
		const className = 'bg-blue-500 text-white p-4';
		expect(className).toContain('bg-blue-500');
		expect(className).toContain('text-white');
	});

	it('should validate array operations', () => {
		const items = ['item1', 'item2', 'item3'];
		expect(items).toHaveLength(3);
		expect(items[0]).toBe('item1');
	});

	it('should test async operations', async () => {
		const asyncFn = async () => {
			return new Promise(resolve => setTimeout(() => resolve('done'), 10));
		};
		
		const result = await asyncFn();
		expect(result).toBe('done');
	});
});