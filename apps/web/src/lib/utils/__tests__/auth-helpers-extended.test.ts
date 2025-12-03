import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  retryWithBackoff,
  validateSession,
  getAuthErrorMessage,
  isNetworkError,
  isRateLimitError
} from '../auth-helpers';

// Mock Supabase client
const createMockSupabase = (getUserResult: any, getSessionResult: any) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue(getUserResult),
    getSession: vi.fn().mockResolvedValue(getSessionResult),
    signOut: vi.fn().mockResolvedValue({ error: null })
  }
});

describe('Auth Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('retryWithBackoff', () => {
    it('should resolve on first successful attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on redirect errors (status 303)', async () => {
      const redirectError = { status: 303, message: 'Redirect' };
      const fn = vi.fn().mockRejectedValue(redirectError);

      await expect(retryWithBackoff(fn)).rejects.toEqual(redirectError);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on invalid login credentials', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Invalid login credentials'));

      await expect(retryWithBackoff(fn)).rejects.toThrow('Invalid login credentials');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on email not confirmed error', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Email not confirmed'));

      await expect(retryWithBackoff(fn)).rejects.toThrow('Email not confirmed');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on user already registered error', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('User already registered'));

      await expect(retryWithBackoff(fn)).rejects.toThrow('User already registered');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateSession', () => {
    it('should return valid session when user is authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token', user: mockUser };
      
      const mockSupabase = createMockSupabase(
        { data: { user: mockUser }, error: null },
        { data: { session: mockSession }, error: null }
      );

      const result = await validateSession(mockSupabase as any);
      
      expect(result).toEqual({ session: mockSession, user: mockUser });
    });

    it('should return null when no user exists', async () => {
      const mockSupabase = createMockSupabase(
        { data: { user: null }, error: null },
        { data: { session: null }, error: null }
      );

      const result = await validateSession(mockSupabase as any);
      
      expect(result).toBeNull();
    });

    it('should sign out and return null when session retrieval fails for valid user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      const mockSupabase = createMockSupabase(
        { data: { user: mockUser }, error: null },
        { data: { session: null }, error: { message: 'Session error' } }
      );

      const result = await validateSession(mockSupabase as any);
      
      expect(result).toBeNull();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('getAuthErrorMessage', () => {
    it('should return friendly message for invalid credentials', () => {
      const error = new Error('Invalid login credentials');
      const message = getAuthErrorMessage(error);
      
      expect(message).toContain('Invalid email or password');
    });

    it('should return friendly message for unconfirmed email', () => {
      const error = new Error('Email not confirmed');
      const message = getAuthErrorMessage(error);
      
      expect(message).toContain('verify your email');
    });

    it('should return friendly message for existing user', () => {
      const error = new Error('User already registered');
      const message = getAuthErrorMessage(error);
      
      expect(message).toContain('already exists');
    });

    it('should return friendly message for password errors', () => {
      const error = new Error('password too short');
      const message = getAuthErrorMessage(error);
      
      expect(message).toContain('Password');
    });

    it('should return friendly message for network errors', () => {
      const error = new Error('network error occurred');
      const message = getAuthErrorMessage(error);
      
      expect(message).toContain('Network error');
    });

    it('should return friendly message for rate limit errors', () => {
      const error = new Error('rate limit exceeded');
      const message = getAuthErrorMessage(error);
      
      expect(message).toContain('Too many attempts');
    });

    it('should return friendly message for timeout errors', () => {
      const error = new Error('request timeout');
      const message = getAuthErrorMessage(error);
      
      expect(message).toContain('timed out');
    });

    it('should return generic message for unknown errors', () => {
      const error = new Error('some random error');
      const message = getAuthErrorMessage(error);
      
      expect(message).toContain('unexpected error');
    });

    it('should handle non-Error objects', () => {
      const message = getAuthErrorMessage('string error');
      expect(message).toContain('Something went wrong');
    });

    it('should handle null/undefined errors', () => {
      const message = getAuthErrorMessage(null);
      expect(message).toContain('Something went wrong');
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network errors', () => {
      expect(isNetworkError(new Error('network error'))).toBe(true);
      expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
      expect(isNetworkError(new Error('timeout exceeded'))).toBe(true);
      expect(isNetworkError(new Error('connection refused'))).toBe(true);
    });

    it('should return false for non-network errors', () => {
      expect(isNetworkError(new Error('Invalid credentials'))).toBe(false);
      expect(isNetworkError(new Error('User not found'))).toBe(false);
      expect(isNetworkError(new Error('Server error'))).toBe(false);
    });

    it('should return false for non-Error objects', () => {
      expect(isNetworkError('string error')).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
      expect(isNetworkError({})).toBe(false);
    });
  });

  describe('isRateLimitError', () => {
    it('should return true for rate limit errors', () => {
      expect(isRateLimitError(new Error('rate limit exceeded'))).toBe(true);
      expect(isRateLimitError(new Error('too many requests'))).toBe(true);
    });

    it('should return false for non-rate-limit errors', () => {
      expect(isRateLimitError(new Error('Invalid credentials'))).toBe(false);
      expect(isRateLimitError(new Error('Network error'))).toBe(false);
    });

    it('should return false for non-Error objects', () => {
      expect(isRateLimitError('string error')).toBe(false);
      expect(isRateLimitError(null)).toBe(false);
      expect(isRateLimitError(undefined)).toBe(false);
    });
  });
});
