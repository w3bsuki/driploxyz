import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  // Use parent data instead of creating duplicate client
  const parentData = await parent();
  
  return {
    supabase: parentData.supabase,
    session: parentData.session,
    user: parentData.user,
    profile: parentData.profile
  };
};