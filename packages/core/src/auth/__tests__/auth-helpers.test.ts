import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthHelpers, assertAdmin } from '../index.js';
import type { Cookies, RequestEvent } from '@sveltejs/kit';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn()
  }
};

// Mock dependencies
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mockSupabaseClient)
}));

// Mock imports after vi.mock call
import { createServerClient } from '@supabase/ssr';
const mockCreateServerClient = vi.mocked(createServerClient);

// Test helpers
const createMockCookies = (): Cookies => ({
  getAll: vi.fn(() => []),
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  serialize: vi.fn()
});

const createMockRequestEvent = (locals: any = {}): RequestEvent => ({
  locals,
  cookies: createMockCookies(),
  fetch: global.fetch,
  getClientAddress: vi.fn(),
  params: {},
  request: new Request('http://localhost'),
  route: { id: 'test' },
  setHeaders: vi.fn(),
  url: new URL('http://localhost'),
  isDataRequest: false,
  isSubRequest: false,
  platform: undefined
});

describe('createAuthHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates auth helpers with correct configuration', () => {
    const options = {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
      cookieDefaults: { secure: true }
    };

    const helpers = createAuthHelpers(options);

    expect(helpers).toHaveProperty('createSupabaseServerClient');
    expect(helpers).toHaveProperty('safeGetSession');
    expect(typeof helpers.createSupabaseServerClient).toBe('function');
    expect(typeof helpers.safeGetSession).toBe('function');
  });

  it('creates Supabase server client with correct options', () => {
    const options = {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key'
    };

    const helpers = createAuthHelpers(options);
    const cookies = createMockCookies();

    helpers.createSupabaseServerClient(cookies);

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function)
        })
      })
    );
  });

  describe('safeGetSession', () => {
    it('returns cached session if available', async () => {
      const cachedSession = { session: { user: { id: 'test-user' } }, user: { id: 'test-user' } };
      const event = createMockRequestEvent({
        __sessionCache: cachedSession
      });

      const helpers = createAuthHelpers({
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key'
      });

      const result = await helpers.safeGetSession(event);

      expect(result).toEqual(cachedSession);
    });

    it('returns null session when no supabase client', async () => {
      const event = createMockRequestEvent({});

      const helpers = createAuthHelpers({
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key'
      });

      const result = await helpers.safeGetSession(event);

      expect(result).toEqual({ session: null, user: null });
      expect(event.locals.__sessionCache).toEqual({ session: null, user: null });
    });

    it('fetches and caches session from Supabase', async () => {
      const mockSession = { user: { id: 'test-user' } };
      const mockUser = { id: 'test-user', email: 'test@example.com' };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession }
      });
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const event = createMockRequestEvent({
        supabase: mockSupabaseClient
      });

      const helpers = createAuthHelpers({
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key'
      });

      const result = await helpers.safeGetSession(event);

      expect(result).toEqual({ session: mockSession, user: mockUser });
      expect(event.locals.__sessionCache).toEqual({ session: mockSession, user: mockUser });
    });

    it('handles auth errors gracefully', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } }
      });
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Auth error')
      });

      const event = createMockRequestEvent({
        supabase: mockSupabaseClient
      });

      const helpers = createAuthHelpers({
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key'
      });

      const result = await helpers.safeGetSession(event);

      expect(result).toEqual({ session: null, user: null });
    });

    it('handles auth exceptions gracefully', async () => {
      mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Network error'));

      const event = createMockRequestEvent({
        supabase: mockSupabaseClient
      });

      const helpers = createAuthHelpers({
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key'
      });

      const result = await helpers.safeGetSession(event);

      expect(result).toEqual({ session: null, user: null });
    });
  });
});

describe('assertAdmin', () => {
  it('returns false when no safeGetSession function', async () => {
    const event = createMockRequestEvent({});
    const predicate = vi.fn();

    const result = await assertAdmin(event, predicate);

    expect(result).toBe(false);
    expect(predicate).not.toHaveBeenCalled();
  });

  it('returns false when no user', async () => {
    const mockSafeGetSession = vi.fn().mockResolvedValue({ session: null, user: null });
    const event = createMockRequestEvent({
      safeGetSession: mockSafeGetSession
    });
    const predicate = vi.fn();

    const result = await assertAdmin(event, predicate);

    expect(result).toBe(false);
    expect(predicate).not.toHaveBeenCalled();
  });

  it('calls predicate with user and returns result', async () => {
    const mockUser = { id: 'test-user', email: 'admin@example.com' };
    const mockSafeGetSession = vi.fn().mockResolvedValue({
      session: { user: mockUser },
      user: mockUser
    });
    const event = createMockRequestEvent({
      safeGetSession: mockSafeGetSession
    });
    const predicate = vi.fn().mockResolvedValue(true);

    const result = await assertAdmin(event, predicate);

    expect(result).toBe(true);
    expect(predicate).toHaveBeenCalledWith(mockUser);
  });

  it('handles predicate that returns boolean directly', async () => {
    const mockUser = { id: 'test-user', email: 'admin@example.com' };
    const mockSafeGetSession = vi.fn().mockResolvedValue({
      session: { user: mockUser },
      user: mockUser
    });
    const event = createMockRequestEvent({
      safeGetSession: mockSafeGetSession
    });
    const predicate = vi.fn().mockReturnValue(false);

    const result = await assertAdmin(event, predicate);

    expect(result).toBe(false);
    expect(predicate).toHaveBeenCalledWith(mockUser);
  });
});