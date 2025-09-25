import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { createBrowserSupabaseClient } from '$lib/supabase/client';

export const load = (async ({ parent }) => {
  const { user } = await parent();
  
  if (!user) {
    redirect(303, '/login');
  }

  const supabase = createBrowserSupabaseClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user,
    profile
  };
}) satisfies PageLoad;