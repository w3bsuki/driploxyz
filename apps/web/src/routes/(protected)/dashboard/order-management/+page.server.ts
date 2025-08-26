import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
  const { safeGetSession, supabase } = locals;
  const { session, user } = await safeGetSession();
  
  if (!session || !user) {
    throw redirect(303, '/login');
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  // Get all orders for this user (as buyer or seller)
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      product:products(
        id,
        title,
        price,
        images,
        first_image,
        seller_id
      ),
      buyer:profiles!buyer_id(
        id,
        username,
        full_name,
        avatar_url
      ),
      seller:profiles!seller_id(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false });
  
  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  }
  
  return {
    user,
    profile,
    orders: orders || []
  };
};