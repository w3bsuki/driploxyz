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
    throw redirect(303, '/');
  }
  
  return {};
}) satisfies LayoutServerLoad;