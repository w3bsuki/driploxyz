import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url, parent, depends }) => {
  depends('messages:all');
  const { user } = await parent();

  if (!user) {
    throw redirect(303, '/login');
  }

  // Get conversation params from URL
  const searchParams = url.searchParams;
  const conversationParam = searchParams.get('conversation');
  
  
  // Use optimized view for better performance
  const { data: messages, error: messagesError } = await supabase
    .from('messages_with_details' as any)
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false }) as any;
  
  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
  }

  // ALWAYS fetch conversation user/product info if we have a conversation param
  let conversationUser = null;
  let conversationProduct = null;
  
  if (conversationParam) {
    const parts = conversationParam.split('__');
    const [sellerId, productId] = parts.length >= 2 ? parts : [parts[0], 'general'];
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (sellerId && uuidRegex.test(sellerId)) {
      // Fetch seller info
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, last_active_at')
        .eq('id', sellerId)
        .single();
      
      conversationUser = sellerData;
    }
    
    // Fetch product info if provided and not general
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

  // Mark messages as read using the optimized function
  if (conversationParam && messages) {
    const parts = conversationParam.split('__');
    const [otherUserId, productId] = parts.length >= 2 ? parts : [parts[0], 'general'];
    
    // Use the database function to mark messages as read
    await supabase.rpc('mark_messages_as_read' as any, {
      p_sender_id: otherUserId,
      p_product_id: productId === 'general' ? null : productId
    });
  }

  // Count unread messages for the user
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  return {
    messages: messages || [],
    conversationUser,
    conversationProduct,
    conversationParam,
    unreadCount: unreadCount || 0
  };
};

export const actions: Actions = {
  sendMessage: async ({ request, locals: { supabase }, parent }) => {
    const { user } = await parent();
    
    if (!user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const message = formData.get('message') as string;
    const receiverId = formData.get('receiverId') as string;
    const productId = formData.get('productId') as string;

    if (!message?.trim()) {
      return fail(400, { error: 'Message cannot be empty' });
    }

    if (!receiverId) {
      return fail(400, { error: 'Receiver ID is required' });
    }

    // Insert the message
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: message.trim(),
        product_id: productId || null
      });

    if (error) {
      console.error('Error sending message:', error);
      return fail(500, { error: 'Failed to send message' });
    }

    return { success: true };
  }
};