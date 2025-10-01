/**
 * Toast Store Tests
 *
 * Critical tests for the consolidated toast system to ensure
 * reliability of notification delivery and state management.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toasts, toastHelpers } from '../store.svelte';

describe('Toast Store', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    toasts.dismissAll();
  });

  describe('Basic Toast Operations', () => {
    it('should create success toast', () => {
      const id = toasts.success('Operation successful');
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^toast-/);
    });

    it('should create error toast', () => {
      const id = toasts.error('Something went wrong');
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^toast-/);
    });

    it('should create warning toast', () => {
      const id = toasts.warning('Please be careful');
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^toast-/);
    });

    it('should create info toast', () => {
      const id = toasts.info('Here is some information');
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^toast-/);
    });

    it('should create custom toast with show method', () => {
      const id = toasts.show('Custom message', 'info', {
        duration: 3000,
        dismissible: true
      });
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^toast-/);
    });
  });

  describe('Toast Management', () => {
    it('should dismiss specific toast', () => {
      const id = toasts.success('Test message');

      // Toast should exist (we can't directly check state, but method should work)
      expect(() => toasts.dismiss(id)).not.toThrow();
    });

    it('should dismiss all toasts', () => {
      toasts.success('Message 1');
      toasts.error('Message 2');
      toasts.warning('Message 3');

      expect(() => toasts.dismissAll()).not.toThrow();
    });
  });

  describe('Toast Options', () => {
    it('should accept custom duration', () => {
      const id = toasts.success('Custom duration', { duration: 10000 });
      expect(typeof id).toBe('string');
    });

    it('should accept persistent option', () => {
      const id = toasts.error('Persistent error', { persistent: true });
      expect(typeof id).toBe('string');
    });

    it('should accept dismissible option', () => {
      const id = toasts.info('Non-dismissible', { dismissible: false });
      expect(typeof id).toBe('string');
    });

    it('should accept action option', () => {
      const mockAction = vi.fn();
      const id = toasts.warning('With action', {
        action: {
          label: 'Retry',
          onclick: mockAction
        }
      });
      expect(typeof id).toBe('string');
    });
  });

  describe('Toast Helpers', () => {
    it('should create loading toast', () => {
      const id = toastHelpers.loading('Loading data...');
      expect(typeof id).toBe('string');
    });

    it('should create toast with action', () => {
      const mockCallback = vi.fn();
      const id = toastHelpers.withAction(
        'Action required',
        'warning',
        'Take Action',
        mockCallback
      );
      expect(typeof id).toBe('string');
    });

    it('should handle promise-based toasts', async () => {
      const successPromise = Promise.resolve('success');

      const result = toastHelpers.promise(successPromise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Failed!'
      });

      await expect(result).resolves.toBe('success');
    });

    it('should handle promise rejection', async () => {
      const errorPromise = Promise.reject(new Error('Failed'));

      const result = toastHelpers.promise(errorPromise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Failed!'
      });

      await expect(result).rejects.toThrow('Failed');
    });
  });

  describe('Deduplication', () => {
    it('should prevent duplicate toasts within deduplication window', async () => {
      const message = 'Test duplicate prevention';

      // First toast should create normally
      const id1 = toasts.success(message);
      expect(typeof id1).toBe('string');
      expect(id1).toMatch(/^toast-/);

      // Immediate duplicate should be prevented (same ID returned)
      const id2 = toasts.success(message);
      expect(id2).toBe(id1); // Should return the same ID for duplicate

      // Wait for deduplication window to expire
      await new Promise(resolve => setTimeout(resolve, 150)); // 150ms > 100ms window

      // After window expires, new toast should be allowed
      const id3 = toasts.success(message);
      expect(typeof id3).toBe('string');
      expect(id3).toMatch(/^toast-/);
      expect(id3).not.toBe(id1); // Should be a new ID
    });

    it('should allow different message types with same content', () => {
      const message = 'Same message content';

      const successId = toasts.success(message);
      const errorId = toasts.error(message);
      const warningId = toasts.warning(message);
      const infoId = toasts.info(message);

      // All should be different IDs since types are different
      expect(successId).not.toBe(errorId);
      expect(successId).not.toBe(warningId);
      expect(successId).not.toBe(infoId);
      expect(errorId).not.toBe(warningId);
      expect(errorId).not.toBe(infoId);
      expect(warningId).not.toBe(infoId);
    });

    it('should allow different messages with same type', () => {
      const successId1 = toasts.success('Message 1');
      const successId2 = toasts.success('Message 2');

      // Different messages should create different toasts
      expect(successId1).not.toBe(successId2);
    });

    it('should handle trimmed whitespace in deduplication', () => {
      const message1 = 'Test message';
      const message2 = '  Test message  '; // With whitespace

      const id1 = toasts.success(message1);
      const id2 = toasts.success(message2);

      // Should be treated as duplicates (whitespace trimmed)
      expect(id2).toBe(id1);
    });

    it('should deduplicate custom show() calls', () => {
      const message = 'Custom show message';
      const options = { duration: 3000, dismissible: true };

      const id1 = toasts.show(message, 'info', options);
      const id2 = toasts.show(message, 'info', options);

      // Should be deduplicated
      expect(id2).toBe(id1);
    });

    it('should deduplicate same message and type regardless of options', () => {
      const message = 'Custom message';

      const id1 = toasts.show(message, 'info', { duration: 3000 });
      const id2 = toasts.show(message, 'info', { duration: 5000 });

      // Same message and type should be deduplicated even with different options
      expect(id2).toBe(id1);
    });

    it('should cleanup deduplication cache after window expires', async () => {
      const message = 'Cleanup test message';

      // Create first toast
      const id1 = toasts.success(message);
      expect(typeof id1).toBe('string');

      // Immediate duplicate should be prevented
      const id2 = toasts.success(message);
      expect(id2).toBe(id1);

      // Wait longer than cleanup window
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms > 100ms window

      // After cleanup, should allow new toast
      const id3 = toasts.success(message);
      expect(typeof id3).toBe('string');
      expect(id3).not.toBe(id1);
    });
  });
});