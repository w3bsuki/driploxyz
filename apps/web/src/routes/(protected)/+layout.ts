import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  // Use parent data - no longer passing supabase client
  const parentData = await parent();
  
  return {
    session: parentData.session,
    user: parentData.user,
    profile: parentData.profile,
    language: parentData.language
  };
};