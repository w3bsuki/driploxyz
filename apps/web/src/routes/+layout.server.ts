import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
  const { session, user } = await safeGetSession();

  let profile = null;
  if (user && supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return {
    session,
    user,
    profile,
    supabase: null, // We'll create browser client in +layout.ts
  };
};