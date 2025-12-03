import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn utility', () => {
  describe('basic class merging', () => {
    it('should merge simple classes', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle single class', () => {
      expect(cn('single-class')).toBe('single-class');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('')).toBe('');
    });

    it('should handle undefined and null values', () => {
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
      expect(cn('class1', null, 'class2')).toBe('class1 class2');
    });

    it('should handle boolean values', () => {
      const shouldShow = true;
      const shouldHide = false;
      expect(cn('class1', false, 'class2')).toBe('class1 class2');
      expect(cn('class1', shouldShow && 'class2')).toBe('class1 class2');
      expect(cn('class1', shouldHide && 'class2')).toBe('class1');
    });
  });

  describe('tailwind merge functionality', () => {
    it('should merge conflicting tailwind classes correctly', () => {
      // Later classes should override earlier ones
      expect(cn('p-4', 'p-8')).toBe('p-8');
      expect(cn('m-2', 'm-4')).toBe('m-4');
    });

    it('should handle responsive variants correctly', () => {
      expect(cn('p-2', 'md:p-4', 'lg:p-6')).toBe('p-2 md:p-4 lg:p-6');
    });

    it('should merge flex classes correctly', () => {
      expect(cn('flex-col', 'flex-row')).toBe('flex-row');
    });

    it('should merge text color classes correctly', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should merge background color classes correctly', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('should keep non-conflicting classes', () => {
      expect(cn('p-4', 'm-4', 'text-red-500')).toBe('p-4 m-4 text-red-500');
    });
  });

  describe('conditional class application', () => {
    it('should support conditional object syntax', () => {
      expect(cn({ 'class1': true, 'class2': false })).toBe('class1');
    });

    it('should handle mixed inputs', () => {
      expect(cn('base', { 'active': true }, ['array-class'])).toBe('base active array-class');
    });

    it('should support nested arrays', () => {
      expect(cn(['class1', ['class2', 'class3']])).toBe('class1 class2 class3');
    });
  });

  describe('real-world use cases', () => {
    it('should handle button variant classes', () => {
      const baseClass = 'px-4 py-2 rounded font-medium';
      const primaryClass = 'bg-blue-500 text-white hover:bg-blue-600';
      const disabledClass = 'opacity-50 cursor-not-allowed';
      
      const result = cn(baseClass, primaryClass, disabledClass);
      expect(result).toContain('px-4');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('opacity-50');
    });

    it('should handle card component classes', () => {
      const result = cn(
        'bg-white rounded-lg shadow',
        'p-4',
        'hover:shadow-md transition-shadow'
      );
      expect(result).toBe('bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow');
    });

    it('should handle state-based classes', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      );
      expect(result).toBe('base-class active-class');
    });
  });
});
