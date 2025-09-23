import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const { data, error } = await locals.supabase
    .from('products')
    .select('id, title, profiles!products_seller_id_fkey(username)')
    .eq('is_active', true)
    .eq('country_code', locals.country || 'BG')
    .not('title', 'ilike', '%UK%')
    .not('title', 'ilike', '%TEST%')
    .not('title', 'ilike', '%London%')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    return json({ error: 'Failed to fetch recent listings' }, { status: 500 });
  }

  return json(data?.map(p => ({
    id: p.id,
    title: p.title.slice(0, 30) + (p.title.length > 30 ? '...' : ''),
    user: p.profiles?.username || 'User'
  })) || []);
};