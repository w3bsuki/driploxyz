import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends }) => {
  depends('supabase:auth');

  // Don't pass the client - components will create their own when needed
  // This fixes the SSR/Client separation violation
  return {
    session: data?.session || null,
    user: data?.user || null,
    profile: data?.profile || null,
    language: data?.language || 'en', // Pass through the language from server
  };
};
