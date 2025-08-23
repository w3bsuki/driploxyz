import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
  const { user } = await safeGetSession();
  if (!user) return { orders: [] };

  // Get user's orders (both as buyer and seller)
  const { data: buyerOrders } = await supabase
    .from('orders')
    .select(`
      *,
      product:products(
        id,
        title,
        price,
        images
      ),
      seller:profiles!orders_seller_id_fkey(
        username,
        full_name
      )
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  const { data: sellerOrders } = await supabase
    .from('orders')
    .select(`
      *,
      product:products(
        id,
        title,
        price,
        images
      ),
      buyer:profiles!orders_buyer_id_fkey(
        username,
        full_name
      )
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  return {
    buyerOrders: buyerOrders || [],
    sellerOrders: sellerOrders || []
  };
};