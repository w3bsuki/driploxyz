import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session, user } = await safeGetSession();

  if (!session) {
    throw redirect(303, '/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single();

  // Check if user is admin
  if (!profile || profile.role !== 'admin') {
    throw redirect(303, '/');
  }

  return {
    session,
    user,
    profile
  };
};