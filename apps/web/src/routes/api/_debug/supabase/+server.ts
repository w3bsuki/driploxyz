import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { createServerSupabase } from '$lib/auth/index';
import type { SupabaseClient } from '@supabase/supabase-js';

export const GET: RequestHandler = async ({ cookies, fetch, locals }) => {
  if (!dev) return new Response('Not found', { status: 404 });

  let client;
  try {
    // Try to use existing client or create a new one
    client = locals.supabase || createServerSupabase(cookies, fetch);
    console.log('[Debug] Supabase client initialized:', client ? 'Success' : 'Failed');
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
      const { error, count } = await client.from(table as 'products' | 'categories' | 'profiles').select('*', { head: true, count: 'exact' });
      results[table] = { ok: !error, count: count ?? null, error: error?.message ?? null };
      console.log(`[Debug] Table ${table}:`, results[table]);
    } catch (e) {
      console.error(`[Debug] Error checking table ${table}:`, e);
      results[table] = { ok: false, count: null, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  // Try a simple products query to see if data is accessible
  try {
    const { data: products, error: productsError } = await client
      .from('products')
      .select('id, title, price')
      .limit(5);
    
    console.log('[Debug] Products query result:', {
      count: products?.length || 0,
      error: productsError?.message || 'None',
      sample: products?.[0] || 'None'
    });
    
    return json({
      url: (client as SupabaseClient & { url?: string })?.url ?? undefined,
      results,
      productsTest: {
        count: products?.length || 0,
        error: productsError?.message || null,
        sample: products?.[0] || null
      }
    });
  } catch (error) {
    console.error('[Debug] Products query error:', error);
    return json({
      url: (client as SupabaseClient & { url?: string })?.url ?? undefined,
      results,
      productsTest: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

