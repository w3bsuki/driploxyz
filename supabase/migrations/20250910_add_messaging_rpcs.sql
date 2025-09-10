-- Add missing RPC functions for messaging system
-- These functions are required by ConversationService.ts

-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS public.get_user_conversations(uuid, int);
DROP FUNCTION IF EXISTS public.get_conversation_messages(uuid, uuid, uuid, timestamptz, int);
DROP FUNCTION IF EXISTS public.mark_conversation_read(uuid, uuid, uuid);

-- ============================================================================
-- 1. get_user_conversations - Get all conversations for a user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_conversations(
  p_user_id uuid,
  p_limit int DEFAULT 50
)
RETURNS TABLE(
  conversation_id text,
  other_user_id uuid,
  other_user_name text,
  other_user_avatar text,
  other_user_last_active timestamptz,
  product_id uuid,
  product_title text,
  product_price numeric,
  product_image text,
  order_id uuid,
  order_status text,
  order_total numeric,
  last_message text,
  last_message_time timestamptz,
  unread_count bigint,
  is_product_conversation boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH conversation_users AS (
    -- Get all users this person has messaged with
    SELECT DISTINCT
      CASE 
        WHEN m.sender_id = p_user_id THEN m.receiver_id
        ELSE m.sender_id 
      END as other_user_id,
      m.product_id,
      m.order_id,
      CASE 
        WHEN m.product_id IS NOT NULL THEN m.receiver_id || '__' || m.product_id::text
        ELSE m.receiver_id || '__general'
      END as conversation_id
    FROM messages m
    WHERE m.sender_id = p_user_id OR m.receiver_id = p_user_id
  ),
  conversation_data AS (
    SELECT 
      cu.conversation_id,
      cu.other_user_id,
      cu.product_id,
      cu.order_id,
      p.username as other_user_name,
      p.avatar_url as other_user_avatar,
      p.last_active_at as other_user_last_active,
      pr.title as product_title,
      pr.price as product_price,
      (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = pr.id ORDER BY pi.sort_order LIMIT 1) as product_image,
      o.status::text as order_status,
      o.total_amount as order_total,
      -- Get last message
      (
        SELECT m.content 
        FROM messages m 
        WHERE (m.sender_id = p_user_id AND m.receiver_id = cu.other_user_id)
           OR (m.sender_id = cu.other_user_id AND m.receiver_id = p_user_id)
        AND (cu.product_id IS NULL OR m.product_id = cu.product_id)
        ORDER BY m.created_at DESC 
        LIMIT 1
      ) as last_message,
      -- Get last message time
      (
        SELECT m.created_at 
        FROM messages m 
        WHERE (m.sender_id = p_user_id AND m.receiver_id = cu.other_user_id)
           OR (m.sender_id = cu.other_user_id AND m.receiver_id = p_user_id)
        AND (cu.product_id IS NULL OR m.product_id = cu.product_id)
        ORDER BY m.created_at DESC 
        LIMIT 1
      ) as last_message_time,
      -- Count unread messages
      (
        SELECT COUNT(*)
        FROM messages m
        WHERE m.sender_id = cu.other_user_id 
        AND m.receiver_id = p_user_id
        AND m.is_read = false
        AND (cu.product_id IS NULL OR m.product_id = cu.product_id)
      ) as unread_count,
      cu.product_id IS NOT NULL as is_product_conversation
    FROM conversation_users cu
    LEFT JOIN profiles p ON p.id = cu.other_user_id
    LEFT JOIN products pr ON pr.id = cu.product_id
    LEFT JOIN orders o ON o.id = cu.order_id
  )
  SELECT 
    cd.conversation_id,
    cd.other_user_id,
    COALESCE(cd.other_user_name, 'Unknown User') as other_user_name,
    cd.other_user_avatar,
    cd.other_user_last_active,
    cd.product_id,
    cd.product_title,
    cd.product_price,
    cd.product_image,
    cd.order_id,
    cd.order_status,
    cd.order_total,
    cd.last_message,
    cd.last_message_time,
    cd.unread_count,
    cd.is_product_conversation
  FROM conversation_data cd
  WHERE cd.last_message_time IS NOT NULL
  ORDER BY cd.last_message_time DESC
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- 2. get_conversation_messages - Get messages for specific conversation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_conversation_messages(
  p_user_id uuid,
  p_other_user_id uuid,
  p_product_id uuid DEFAULT NULL,
  p_before_time timestamptz DEFAULT NULL,
  p_limit int DEFAULT 30
)
RETURNS TABLE(
  id uuid,
  sender_id uuid,
  receiver_id uuid,
  product_id uuid,
  order_id uuid,
  content text,
  created_at timestamptz,
  is_read boolean,
  status text,
  delivered_at timestamptz,
  read_at timestamptz,
  message_type text,
  sender_info jsonb,
  receiver_info jsonb,
  order_info jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.product_id,
    m.order_id,
    m.content,
    m.created_at,
    m.is_read,
    m.status::text,
    m.delivered_at,
    m.read_at,
    m.message_type,
    -- Sender info
    jsonb_build_object(
      'id', sender.id,
      'username', sender.username,
      'full_name', sender.full_name,
      'avatar_url', sender.avatar_url
    ) as sender_info,
    -- Receiver info
    jsonb_build_object(
      'id', receiver.id,
      'username', receiver.username,
      'full_name', receiver.full_name,
      'avatar_url', receiver.avatar_url
    ) as receiver_info,
    -- Order info (if applicable)
    CASE 
      WHEN m.order_id IS NOT NULL THEN
        jsonb_build_object(
          'id', o.id,
          'status', o.status,
          'total_amount', o.total_amount,
          'created_at', o.created_at
        )
      ELSE NULL
    END as order_info
  FROM messages m
  LEFT JOIN profiles sender ON sender.id = m.sender_id
  LEFT JOIN profiles receiver ON receiver.id = m.receiver_id
  LEFT JOIN orders o ON o.id = m.order_id
  WHERE 
    -- Must be between the two users
    ((m.sender_id = p_user_id AND m.receiver_id = p_other_user_id) 
     OR (m.sender_id = p_other_user_id AND m.receiver_id = p_user_id))
    -- Product filter
    AND (p_product_id IS NULL OR m.product_id = p_product_id)
    -- Time filter for pagination
    AND (p_before_time IS NULL OR m.created_at < p_before_time)
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- 3. mark_conversation_read - Mark messages as read for a conversation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.mark_conversation_read(
  p_user_id uuid,
  p_other_user_id uuid,
  p_product_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update messages from other user to current user as read
  UPDATE messages 
  SET 
    is_read = true,
    read_at = now()
  WHERE 
    sender_id = p_other_user_id 
    AND receiver_id = p_user_id 
    AND is_read = false
    AND (p_product_id IS NULL OR product_id = p_product_id);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_conversations(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_conversation_messages(uuid, uuid, uuid, timestamptz, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid, uuid, uuid) TO authenticated;