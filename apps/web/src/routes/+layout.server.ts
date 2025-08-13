import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
  const { session, user } = await safeGetSession();

  return {
    session,
    user,
    supabase: null, // We'll create browser client in +layout.ts
  };
};