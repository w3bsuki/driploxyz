import { describe, it, expect } from 'vitest';
import { createAuthHelpers, assertAdmin } from './index.js';

describe('Auth Helpers', () => {
  it('should export createAuthHelpers function', () => {
    expect(typeof createAuthHelpers).toBe('function');
  });

  it('should export assertAdmin function', () => {
    expect(typeof assertAdmin).toBe('function');
  });

  it('should create auth helpers with required options', () => {
    const helpers = createAuthHelpers({
      url: 'https://test.supabase.co',
      anonKey: 'test-key'
    });

    expect(helpers).toHaveProperty('createSupabaseServerClient');
    expect(helpers).toHaveProperty('safeGetSession');
    expect(typeof helpers.createSupabaseServerClient).toBe('function');
    expect(typeof helpers.safeGetSession).toBe('function');
  });
});