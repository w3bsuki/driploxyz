import { dev } from "$app/environment";

// Optional init hook for client-side initialization
export async function init() {
  // No client-side initialization needed yet
}

export function handleError({ error, event }) {
  // Log error to console in development
  if (dev) {
    console.error('Error:', error);
    console.error('Event:', event);
  } else {
    // In production, you might want to send to a logging service
    console.error('Application error:', error);
  }
}