import type { SupabaseClient } from '@supabase/supabase-js';
import { redirect, type Redirect } from '@sveltejs/kit';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on redirects (check status property)
      if (typeof error === 'object' && error !== null && 'status' in error && error.status === 303) throw error;
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) throw error;
        if (error.message.includes('Email not confirmed')) throw error;
        if (error.message.includes('User already registered')) throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxAttempts) throw error;
      
      // Wait before retrying
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError || new Error('Retry failed');
}

/**
 * Safe session validation with retry
 */
export async function validateSession(supabase: SupabaseClient) {
  return retryWithBackoff(async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    if (!session) return null;
    
    // Validate the session is still valid
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      // Session is invalid, clear it
      await supabase.auth.signOut();
      return null;
    }
    
    return { session, user };
  }, { maxAttempts: 2, delay: 500 });
}

/**
 * Handle authentication errors with user-friendly messages
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Map Supabase errors to user-friendly messages
    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('email not confirmed')) {
      return 'Please verify your email address before signing in. Check your inbox for the verification link.';
    }
    if (message.includes('user already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (message.includes('password')) {
      return 'Password must be at least 8 characters long.';
    }
    if (message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (message.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    // Generic error
    return 'An unexpected error occurred. Please try again.';
  }
  
  return 'Something went wrong. Please try again.';
}

/**
 * Check if a network error occurred
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('timeout') ||
           message.includes('connection');
  }
  return false;
}

/**
 * Check if error is due to rate limiting
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('rate limit') || message.includes('too many');
  }
  return false;
}