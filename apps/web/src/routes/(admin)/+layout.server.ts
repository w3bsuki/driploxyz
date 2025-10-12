import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession();

  if (!session) {
    try {
      redirect(303, '/login');
    } catch (error) {
      // Re-throw actual redirects (they're Response objects)
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw error;
      }
      // Log and handle unexpected errors
      console.error('Admin layout auth redirect error:', error);
      // This is a critical auth failure - we can't continue without authentication
      throw new Error('Authentication system error');
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single();

  // Check if user is admin
  if (!profile || profile.role !== 'admin') {
    try {
      redirect(303, '/');
    } catch (error) {
      // Re-throw actual redirects (they're Response objects)
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw error;
      }
      // Log and handle unexpected errors
      console.error('Admin layout role redirect error:', error);
      // This is a critical authorization failure
      throw new Error('Access denied');
    }
  }

  return {
    session,
    user,
    profile
  };
}) satisfies LayoutServerLoad;