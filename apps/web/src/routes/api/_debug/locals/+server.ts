import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';

export const GET: RequestHandler = async ({ locals, route }) => {
  if (!dev) return new Response('Not found', { status: 404 });

  const hasSupabase = Boolean(locals.supabase);
  const hasSafeGetSession = typeof locals.safeGetSession === 'function';

  return json({
    routeId: route.id,
    hasSupabase,
    hasSafeGetSession
  });
};

