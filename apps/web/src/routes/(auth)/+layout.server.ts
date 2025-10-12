import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals: { safeGetSession }, route }) => {
  const { session } = await safeGetSession();

  // Allow verified email page even for authenticated users
  if (route.id === '/(auth)/verify-email') {
    return { session };
  }

  // Redirect authenticated users away from other auth pages
  if (session) {
    try {
      redirect(303, '/');
    } catch (error) {
      // Re-throw actual redirects (they're Response objects)
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw error;
      }
      // Log and handle unexpected errors
      console.error('Auth layout redirect error:', error);
      // Return session data instead of crashing
      return { session };
    }
  }

  return {};
}) satisfies LayoutServerLoad;