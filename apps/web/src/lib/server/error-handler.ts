import { dev } from '$app/environment';
import type { HandleServerError } from '@sveltejs/kit';

// Debug flag for controlled logging
const isDebug = dev;

/**
 * Enhanced error handler with better debugging and user experience
 */
export const createErrorHandler = (): HandleServerError => {
  return async ({ error, event }) => {
    const errorId = Math.random().toString(36).substring(2, 15);
    
    // Enhanced error logging for debugging
    if (isDebug) {
      console.error(`❌ Error [${errorId}] on ${event.url.pathname}:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userAgent: event.request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      });
    }

    // Categorize errors for better user experience
    let userMessage = 'Internal Server Error';
    
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Auth-related errors
      if (message.includes('supabase') || message.includes('auth') || message.includes('session')) {
        userMessage = 'Authentication service error. Please try refreshing the page or logging in again.';
      }
      // Database errors
      else if (message.includes('database') || message.includes('postgres')) {
        userMessage = 'Database service temporarily unavailable. Please try again in a moment.';
      }
      // Network/timeout errors
      else if (message.includes('timeout') || message.includes('fetch') || message.includes('network')) {
        userMessage = 'Network error. Please check your connection and try again.';
      }
      // Rate limiting
      else if (message.includes('rate limit') || message.includes('too many')) {
        userMessage = 'Too many requests. Please wait a moment before trying again.';
      }
    }

    return {
      message: userMessage,
      ...(isDebug && { errorId, details: error instanceof Error ? error.message : String(error) })
    };
  };
};