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
  
  console.log('[SERVER] Loading messages page');
  console.log('[SERVER] User ID:', user.id);
  console.log('[SERVER] Conversation param:', conversationParam);
  
  // Verify auth session
  const { data: { session } } = await supabase.auth.getSession();
  console.log('[SERVER] Auth session valid:', !!session);
  console.log('[SERVER] Session user ID:', session?.user?.id);
  
  // SIMPLE WORKING QUERY
  console.log('[SERVER] ============= FETCHING MESSAGES =============');
  console.log('[SERVER] User:', user.id);
  console.log('[SERVER] Session:', !!session);
  
  // Test with service role to bypass RLS
  const { data: testMessages } = await supabase
    .from('messages') 
    .select('*')
    .limit(5);
  console.log('[SERVER] Test query (no RLS):', testMessages?.length || 0, 'messages');
  
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });
  
  console.log('[SERVER] Query result:');
  console.log('[SERVER] - Message count:', messages?.length || 0);
  console.log('[SERVER] - Error:', messagesError);
  if (messages && messages.length > 0) {
    console.log('[SERVER] - First message:', messages[0].content.substring(0, 50));
    console.log('[SERVER] - Last message:', messages[messages.length - 1].content.substring(0, 50));
  } else {
    console.log('[SERVER] NO MESSAGES RETURNED!');
    // Try with RPC
    const { data: rpcMessages, error: rpcError } = await supabase
      .rpc('get_user_messages', { user_id: user.id });
    console.log('[SERVER] RPC messages:', rpcMessages?.length || 0, 'error:', rpcError);
  }
  
  // Enhance messages with user and product data manually
  if (messages && messages.length > 0) {
    for (let msg of messages) {
      // Get sender
      const { data: sender } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', msg.sender_id)
        .single();
      msg.sender = sender;
      
      // Get receiver
      const { data: receiver } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', msg.receiver_id)
        .single();
      msg.receiver = receiver;
      
      // Get product if exists
      if (msg.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('*, images:product_images(*)')
          .eq('id', msg.product_id)
          .single();
        msg.product = product;
      }
    }
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
    console.error('[SERVER] Error fetching messages:', messagesError);
  } else {
    console.log('[SERVER] Fetched', messages?.length || 0, 'messages');
    if (messages && messages.length > 0) {
      console.log('[SERVER] First message:', {
        id: messages[0].id,
        sender_id: messages[0].sender_id,
        receiver_id: messages[0].receiver_id,
        product_id: messages[0].product_id,
        content: messages[0].content?.substring(0, 50)
      });
    }
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