import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url, parent, depends }) => {
  depends('messages:all');
  const { user } = await parent();

  if (!user) {
    throw redirect(303, '/login');
  }

  // Get conversation params from URL
  const searchParams = url.searchParams;
  const conversationParam = searchParams.get('conversation');
  
  // Fetch messages with related user and product data
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id (
        id,
        username,
        full_name,
        avatar_url,
        last_active_at
      ),
      receiver:receiver_id (
        id,
        username,
        full_name,
        avatar_url,
        last_active_at
      ),
      product:product_id (
        id,
        title,
        price,
        images:product_images (
          image_url,
          display_order
        )
      )
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  // ALWAYS fetch conversation user/product info if we have a conversation param
  let conversationUser = null;
  let conversationProduct = null;
  
  if (conversationParam) {
    const [sellerId, productId] = conversationParam.split('__');
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(sellerId)) {
      // Fetch seller info
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, last_active_at')
        .eq('id', sellerId)
        .single();
      
      conversationUser = sellerData;
    }
    
    // Fetch product info if provided
    if (productId && productId !== 'general' && uuidRegex.test(productId)) {
      const { data: productData } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          images:product_images (
            image_url,
            display_order
          )
        `)
        .eq('id', productId)
        .single();
      
      conversationProduct = productData;
    }
  }

  // Update user's last active time
  await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', user.id);

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
  }


  return {
    messages: messages || [],
    conversationUser,
    conversationProduct,
    conversationParam
  };
};