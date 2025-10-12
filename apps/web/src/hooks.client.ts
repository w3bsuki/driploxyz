import type { HandleClientError } from '@sveltejs/kit';
import { dev } from "$app/environment";

// Optional init hook for client-side initialization
export async function init(): Promise<void> {
  // No client-side initialization needed yet
}

export const handleError: HandleClientError = ({ error, event }) => {
  // Log error to console in development
  if (dev) {
    console.error('Error:', error);
    console.error('Event:', event);
  } else {
    // In production, you might want to send to a logging service
    console.error('Application error:', error);
  }
  
  // Return user-friendly message
  return {
    message: 'An unexpected error occurred. Please try again.'
  };
}