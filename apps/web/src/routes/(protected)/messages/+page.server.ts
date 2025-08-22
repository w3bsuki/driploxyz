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
  
  
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('id, content, sender_id, receiver_id, product_id, is_read, created_at')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });
  
  
  // Batch fetch user and product data to avoid N+1 queries
  let enhancedMessages = messages || [];
  
  if (messages && messages.length > 0) {
    // Collect unique user IDs and product IDs
    const userIds = [...new Set(messages.flatMap(m => [m.sender_id, m.receiver_id]))];
    const productIds = [...new Set(messages.filter(m => m.product_id).map(m => m.product_id))];
    
    // Batch fetch all profiles (only needed fields)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds);
    
    // Batch fetch all products with images
    let products = [];
    if (productIds.length > 0) {
      const { data: productData } = await supabase
        .from('products')
        .select('*, images:product_images(*)')
        .in('id', productIds);
      products = productData || [];
    }
    
    // Create lookup maps for O(1) access
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    const productMap = new Map(products.map(p => [p.id, p]));
    
    // Map data to messages
    enhancedMessages = messages.map(msg => ({
      ...msg,
      sender: profileMap.get(msg.sender_id) || null,
      receiver: profileMap.get(msg.receiver_id) || null,
      product: msg.product_id ? productMap.get(msg.product_id) || null : null
    }));
  }

  // ALWAYS fetch conversation user/product info if we have a conversation param
  let conversationUser = null;
  let conversationProduct = null;
  
  if (conversationParam) {
    const parts = conversationParam.split('__');
    const [sellerId, productId] = parts.length >= 2 ? parts : [parts[0], 'general'];
    
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

  // Mark messages as read when user opens the conversation
  if (conversationParam && messages) {
    const parts = conversationParam.split('__');
    const [sellerId, productId] = parts.length >= 2 ? parts : [parts[0], 'general'];
    
    const messagesToMarkRead = messages.filter(
      msg => msg.receiver_id === user.id && 
             msg.sender_id === sellerId && 
             (productId === 'general' ? !msg.product_id : msg.product_id === productId) &&
             !msg.is_read
    );

    if (messagesToMarkRead.length > 0) {
      const messageIds = messagesToMarkRead.map(msg => msg.id);
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);
    }
  }

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
  }

  // Count unread messages for the user
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  return {
    messages: enhancedMessages,
    conversationUser,
    conversationProduct,
    conversationParam,
    unreadCount: unreadCount || 0
  };
};