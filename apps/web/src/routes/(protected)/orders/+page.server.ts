import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
  const { session, user } = await safeGetSession();
  
  if (!session || !user) {
    throw error(401, 'Unauthorized');
  }

  try {
    // Get user's purchases (orders where they are the buyer) - simplified
    const { data: buyerOrders, error: buyerError } = await supabase
      .from('orders')
      .select(`
        id,
        product_id,
        seller_id,
        status,
        total_amount,
        shipping_cost,
        shipping_address,
        tracking_number,
        notes,
        created_at,
        updated_at,
        shipped_at,
        delivered_at
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    // Get user's sales (orders where they are the seller) - simplified
    const { data: sellerOrders, error: sellerError } = await supabase
      .from('orders')
      .select(`
        id,
        product_id,
        buyer_id,
        status,
        total_amount,
        shipping_cost,
        shipping_address,
        tracking_number,
        notes,
        created_at,
        updated_at,
        shipped_at,
        delivered_at
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (buyerError) {
      console.error('Error fetching buyer orders:', buyerError);
    }
    
    if (sellerError) {
      console.error('Error fetching seller orders:', sellerError);
    }

    // Get product details for all orders
    const allProductIds = [
      ...(buyerOrders || []).map(o => o.product_id),
      ...(sellerOrders || []).map(o => o.product_id)
    ].filter(Boolean);
    
    let products: any[] = [];
    if (allProductIds.length > 0) {
      const { data: productData } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          condition,
          size,
          product_images (image_url)
        `)
        .in('id', allProductIds);
      products = productData || [];
    }

    // Get seller/buyer profile details
    const sellerIds = (buyerOrders || []).map(o => o.seller_id).filter(Boolean);
    const buyerIds = (sellerOrders || []).map(o => o.buyer_id).filter(Boolean);
    const allProfileIds = [...sellerIds, ...buyerIds].filter(Boolean);
    
    let profiles: any[] = [];
    if (allProfileIds.length > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          full_name
        `)
        .in('id', allProfileIds);
      profiles = profileData || [];
    }

    // Transform the data for easier use in the UI
    const transformedBuyerOrders = (buyerOrders || []).map(order => {
      const product = products.find(p => p.id === order.product_id);
      const seller = profiles.find(p => p.id === order.seller_id);
      return {
        ...order,
        product: product ? {
          ...product,
          first_image: product.product_images?.[0]?.image_url || null
        } : null,
        seller
      };
    });

    const transformedSellerOrders = (sellerOrders || []).map(order => {
      const product = products.find(p => p.id === order.product_id);
      const buyer = profiles.find(p => p.id === order.buyer_id);
      return {
        ...order,
        product: product ? {
          ...product,
          first_image: product.product_images?.[0]?.image_url || null
        } : null,
        buyer
      };
    });

    // Get unread notifications for this user
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false });

    return {
      buyerOrders: transformedBuyerOrders,
      sellerOrders: transformedSellerOrders,
      orders: transformedBuyerOrders, // For backwards compatibility
      unreadNotifications: notifications?.length || 0
    };

  } catch (err) {
    console.error('Error in orders page load:', err);
    throw error(500, 'Failed to load orders');
  }
};