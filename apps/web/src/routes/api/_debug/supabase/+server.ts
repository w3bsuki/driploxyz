import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { createServerSupabase } from '$lib/auth/index';

export const GET: RequestHandler = async ({ cookies, fetch, locals }) => {
  if (!dev) return new Response('Not found', { status: 404 });

  let client;
  try {
    // Try to use existing client or create a new one
    client = locals.supabase || createServerSupabase(cookies, fetch);
  } catch (error) {
    console.error('[Debug] Failed to create Supabase client:', error);
    return json({
      error: 'Failed to initialize Supabase client',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }

  const tables = ['products', 'categories', 'profiles'];
  const results: Record<string, { ok: boolean; count?: number | null; error?: string | null }> = {};

  for (const table of tables) {
    try {
      const { error, count } = await client.from(table).select('*', { head: true, count: 'exact' });
      results[table] = { ok: !error, count: count ?? null, error: error?.message ?? null };
    } catch (e) {
      console.error(`[Debug] Error checking table ${table}:`, e);
      results[table] = { ok: false, count: null, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  return json({
    url: client?.['url'] ?? undefined,
    results
  });
};

