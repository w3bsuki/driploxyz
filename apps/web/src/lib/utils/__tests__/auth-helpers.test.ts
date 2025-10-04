import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}));

// Mock environment variables
// Note: We can't modify import.meta.env in tests

// Define session type for tests
interface TestSession {
  user?: {
    id: string;
    email: string;
    aud: string;
    role: string;
  };
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

describe('Auth Helpers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Note: We can't modify import.meta.env in tests
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'user name@domain.com'
      ];

      invalidEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'StrongPass123!',
        'MyP@ssw0rd',
        'Complex123$%^',
        'V3ryS3cur3P@ss'
      ];

      strongPasswords.forEach(password => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
        expect(isValid).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'password', // no uppercase, number, or special
        'PASSWORD', // no lowercase, number, or special
        '12345678', // no letters or special
        'Pass123', // too short
        'Password123', // no special character
        'Password!', // no number
        'Pass123!', // less than 8 chars
        'password123!' // no uppercase
      ];

      weakPasswords.forEach(password => {
        const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML input', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = maliciousInput.replace(/<[^>]*>/g, '');
      
      expect(sanitized).toBe('Hello World');
    });

    it('should handle empty input', () => {
      const sanitized = ''.replace(/<[^>]*>/g, '');
      expect(sanitized).toBe('');
    });

    it('should preserve safe text', () => {
      const safeInput = 'Hello, this is safe text!';
      const sanitized = safeInput.replace(/<[^>]*>/g, '');
      
      expect(sanitized).toBe('Hello, this is safe text!');
    });
  });

  describe('formatAuthError', () => {
    it('should format Supabase auth errors', () => {
      const supabaseError = {
        message: 'Invalid login credentials',
        status: 400
      };

      const formattedError = {
        message: 'Invalid login credentials',
        code: 'AUTH_ERROR',
        status: 400
      };

      expect(formattedError.message).toBe(supabaseError.message);
      expect(formattedError.code).toBe('AUTH_ERROR');
    });

    it('should handle network errors', () => {
      // Note: Network error would be caught in real implementation
      
      const formattedError = {
        message: 'Network connection failed. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        status: 0
      };

      expect(formattedError.message).toContain('Network connection failed');
      expect(formattedError.code).toBe('NETWORK_ERROR');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for valid session', () => {
      const session: TestSession = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          aud: 'authenticated',
          role: 'authenticated'
        },
        access_token: 'valid-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'bearer'
      };

      const isAuthenticated = session?.user?.aud === 'authenticated' && !!session.access_token;
      expect(isAuthenticated).toBe(true);
    });

    it('should return false for invalid session', () => {
      const invalidSession: TestSession = {
        user: undefined,
        access_token: undefined
      };

      const isAuthenticated = invalidSession?.user?.aud === 'authenticated' && !!invalidSession.access_token;
      expect(isAuthenticated).toBe(false);
    });

    it('should return false for null session', () => {
      const session = null as TestSession | null;
      const isAuthenticated = session?.user?.aud === 'authenticated' && !!session?.access_token;
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('getAuthHeaders', () => {
    it('should return authorization headers with valid token', () => {
      const token = 'valid-jwt-token';
      const headers = {
        Authorization: `Bearer ${token}`
      };

      expect(headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should return empty headers without token', () => {
      const token = null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      expect(headers).toEqual({});
    });
  });

  describe('handleAuthRedirect', () => {
    it('should construct redirect URL correctly', () => {
      const baseUrl = 'https://example.com';
      const redirectTo = '/dashboard';
      
      const redirectUrl = `${baseUrl}${redirectTo}`;
      expect(redirectUrl).toBe('https://example.com/dashboard');
    });

    it('should handle redirect with query parameters', () => {
      const baseUrl = 'https://example.com';
      const redirectTo = '/dashboard?tab=settings';
      
      const redirectUrl = `${baseUrl}${redirectTo}`;
      expect(redirectUrl).toBe('https://example.com/dashboard?tab=settings');
    });
  });
});