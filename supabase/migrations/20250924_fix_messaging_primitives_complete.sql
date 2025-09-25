-- Fix Missing Messaging Primitives & Schema Consistency - Complete Migration
-- This migration contains all changes applied via MCP to align repo with remote DB
-- Date: 2025-09-24
-- Priority 1: Create conversations table and missing messaging RPCs
-- Priority 2: Add same_country_as_user() helper function
-- Priority 3: Fix schema consistency gaps

-- ============================================================================
-- PART 1: CREATE CONVERSATIONS TABLE AND MESSAGING INFRASTRUCTURE
-- ============================================================================

-- Create conversations table to support existing RPCs
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_one_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_two_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- Conversation context
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,     -- Order-related conversations
  last_message_at TIMESTAMPTZ,
  last_message_content TEXT,
  unread_count_p1 INTEGER DEFAULT 0,
  unread_count_p2 INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate conversations and self-conversations
  CONSTRAINT conversations_unique_participants
    UNIQUE (participant_one_id, participant_two_id),
  CONSTRAINT conversations_no_self_conversation
    CHECK (participant_one_id != participant_two_id)
);

-- Add helpful indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant_one ON conversations(participant_one_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_two ON conversations(participant_two_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_product_id ON conversations(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_order_id ON conversations(order_id) WHERE order_id IS NOT NULL;

-- RLS policies for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  participant_one_id = auth.uid() OR
  participant_two_id = auth.uid()
);

CREATE POLICY "Users can create conversations they participate in"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (
  (participant_one_id = auth.uid() OR participant_two_id = auth.uid()) AND
  participant_one_id != participant_two_id
);

CREATE POLICY "Participants can update conversation metadata"
ON conversations FOR UPDATE
TO authenticated
USING (
  participant_one_id = auth.uid() OR
  participant_two_id = auth.uid()
);

-- ============================================================================
-- PART 2: CREATE HELPER FUNCTIONS FOR MESSAGING SYSTEM
-- ============================================================================

-- Function to find or create conversation between two users
CREATE OR REPLACE FUNCTION find_or_create_conversation(
  p_user_one_id UUID,
  p_user_two_id UUID,
  p_product_id UUID DEFAULT NULL,
  p_order_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id UUID;
  v_participant_one_id UUID;
  v_participant_two_id UUID;
BEGIN
  -- Ensure consistent ordering of participants (smaller UUID first)
  IF p_user_one_id < p_user_two_id THEN
    v_participant_one_id := p_user_one_id;
    v_participant_two_id := p_user_two_id;
  ELSE
    v_participant_one_id := p_user_two_id;
    v_participant_two_id := p_user_one_id;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant_one_id = v_participant_one_id
    AND participant_two_id = v_participant_two_id;

  -- Create if doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (
      participant_one_id,
      participant_two_id,
      product_id,
      order_id
    ) VALUES (
      v_participant_one_id,
      v_participant_two_id,
      p_product_id,
      p_order_id
    ) RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- Function to update conversation metadata when messages are sent
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id UUID;
  v_sender_is_participant_one BOOLEAN;
BEGIN
  -- Find or create conversation
  v_conversation_id := find_or_create_conversation(
    NEW.sender_id,
    NEW.receiver_id,
    NEW.product_id,
    NEW.order_id
  );

  -- Update the message with conversation_id (add this column if needed)
  NEW.conversation_id := v_conversation_id;

  -- Determine which participant sent the message
  SELECT (participant_one_id = NEW.sender_id) INTO v_sender_is_participant_one
  FROM conversations
  WHERE id = v_conversation_id;

  -- Update conversation metadata
  UPDATE conversations SET
    last_message_at = NEW.created_at,
    last_message_content = LEFT(NEW.content, 100), -- Preview of last message
    unread_count_p1 = CASE
      WHEN v_sender_is_participant_one THEN unread_count_p1
      ELSE unread_count_p1 + 1
    END,
    unread_count_p2 = CASE
      WHEN v_sender_is_participant_one THEN unread_count_p2 + 1
      ELSE unread_count_p2
    END,
    updated_at = NOW()
  WHERE id = v_conversation_id;

  RETURN NEW;
END;
$$;

-- Add conversation_id column to messages table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages'
    AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
  END IF;
END $$;

-- Create trigger to automatically update conversations when messages are sent
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- ============================================================================
-- PART 3: IMPLEMENT same_country_as_user() HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION same_country_as_user(p_user_country_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_user_country TEXT;
BEGIN
  -- Get current user's country code
  SELECT country_code INTO v_current_user_country
  FROM profiles
  WHERE id = auth.uid();

  -- If no user or no country, default to true (no filtering)
  IF v_current_user_country IS NULL OR p_user_country_code IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check if countries match
  RETURN v_current_user_country = p_user_country_code;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION same_country_as_user(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION find_or_create_conversation(UUID, UUID, UUID, UUID) TO authenticated;

-- ============================================================================
-- PART 4: FIX SCHEMA CONSISTENCY GAPS
-- ============================================================================

-- Fix locale code standardization (ua -> uk for Ukraine)
UPDATE country_config
SET locale = 'uk'
WHERE country_code = 'UA' AND locale = 'ua';

-- Drop the duplicate search_products_secure function (keep the better implementation)
-- First, let's check which version exists and keep the one with proper country_code field
DROP FUNCTION IF EXISTS search_products_secure(text, uuid, numeric, numeric, text, integer);

-- Create the unified search_products_secure function
CREATE OR REPLACE FUNCTION search_products_secure(
  search_query TEXT DEFAULT '',
  p_category_id UUID DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_country_code TEXT DEFAULT 'BG',
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  condition TEXT,
  size TEXT,
  brand TEXT,
  created_at TIMESTAMPTZ,
  seller_username TEXT,
  seller_avatar TEXT,
  category_name TEXT,
  image_urls TEXT[],
  is_promoted BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.price,
    p.condition::text,
    p.size,
    p.brand,
    p.created_at,
    prof.username as seller_username,
    prof.avatar_url as seller_avatar,
    cat.name as category_name,
    COALESCE(
      ARRAY(
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY pi.display_order ASC
        LIMIT 5
      ),
      ARRAY[]::text[]
    ) as image_urls,
    COALESCE(p.is_boosted OR p.is_featured, false) as is_promoted
  FROM products p
  JOIN profiles prof ON p.seller_id = prof.id
  LEFT JOIN categories cat ON p.category_id = cat.id
  WHERE p.is_active = true
    AND p.is_sold = false
    AND p.country_code = p_country_code
    AND (
      search_query = ''
      OR p.search_vector @@ plainto_tsquery('english', search_query)
      OR p.title ILIKE '%' || search_query || '%'
      OR p.brand ILIKE '%' || search_query || '%'
    )
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
  ORDER BY
    (p.is_boosted OR p.is_featured) DESC NULLS LAST,
    p.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_products_secure(text, uuid, numeric, numeric, text, integer) TO public;

-- ============================================================================
-- PART 5: AUTO-CREATE CONVERSATIONS FOR ORDER TRANSACTIONS
-- ============================================================================

-- Function to create conversation when order is placed
CREATE OR REPLACE FUNCTION create_order_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Create conversation between buyer and seller for this order
  v_conversation_id := find_or_create_conversation(
    NEW.buyer_id,
    NEW.seller_id,
    NEW.product_id,
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- Create trigger to auto-create conversations for orders
DROP TRIGGER IF EXISTS trigger_create_order_conversation ON orders;
CREATE TRIGGER trigger_create_order_conversation
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_conversation();

-- ============================================================================
-- PART 6: BACKFILL EXISTING DATA (FIXED)
-- ============================================================================

-- Backfill conversations from existing messages (properly handle NULL product_ids)
INSERT INTO conversations (
  participant_one_id,
  participant_two_id,
  product_id,
  last_message_at,
  last_message_content,
  created_at,
  updated_at
)
SELECT DISTINCT
  CASE
    WHEN m.sender_id < m.receiver_id THEN m.sender_id
    ELSE m.receiver_id
  END as participant_one_id,
  CASE
    WHEN m.sender_id < m.receiver_id THEN m.receiver_id
    ELSE m.sender_id
  END as participant_two_id,
  m.product_id,
  latest.last_message_at,
  latest.last_content,
  earliest.first_message_at,
  latest.last_message_at
FROM messages m
INNER JOIN (
  SELECT
    CASE WHEN sender_id < receiver_id THEN sender_id ELSE receiver_id END as p1,
    CASE WHEN sender_id < receiver_id THEN receiver_id ELSE sender_id END as p2,
    product_id,
    MAX(created_at) as last_message_at,
    (ARRAY_AGG(content ORDER BY created_at DESC))[1] as last_content
  FROM messages
  GROUP BY p1, p2, product_id
) latest ON (
  CASE WHEN m.sender_id < m.receiver_id THEN m.sender_id ELSE m.receiver_id END = latest.p1 AND
  CASE WHEN m.sender_id < m.receiver_id THEN m.receiver_id ELSE m.sender_id END = latest.p2 AND
  (m.product_id IS NULL AND latest.product_id IS NULL OR m.product_id = latest.product_id)
)
INNER JOIN (
  SELECT
    CASE WHEN sender_id < receiver_id THEN sender_id ELSE receiver_id END as p1,
    CASE WHEN sender_id < receiver_id THEN receiver_id ELSE sender_id END as p2,
    product_id,
    MIN(created_at) as first_message_at
  FROM messages
  GROUP BY p1, p2, product_id
) earliest ON (
  latest.p1 = earliest.p1 AND
  latest.p2 = earliest.p2 AND
  (latest.product_id IS NULL AND earliest.product_id IS NULL OR latest.product_id = earliest.product_id)
)
ON CONFLICT (participant_one_id, participant_two_id) DO NOTHING;

-- Update messages with conversation_id references
UPDATE messages m
SET conversation_id = c.id
FROM conversations c
WHERE (
  (m.sender_id = c.participant_one_id AND m.receiver_id = c.participant_two_id) OR
  (m.sender_id = c.participant_two_id AND m.receiver_id = c.participant_one_id)
)
AND (m.product_id IS NULL AND c.product_id IS NULL OR m.product_id = c.product_id)
AND m.conversation_id IS NULL;

-- Backfill unread counts
UPDATE conversations c
SET
  unread_count_p1 = (
    SELECT COUNT(*)
    FROM messages m
    WHERE m.conversation_id = c.id
      AND m.sender_id = c.participant_two_id
      AND m.is_read = false
  ),
  unread_count_p2 = (
    SELECT COUNT(*)
    FROM messages m
    WHERE m.conversation_id = c.id
      AND m.sender_id = c.participant_one_id
      AND m.is_read = false
  );

-- ============================================================================
-- FINAL TOUCHES: Add updated_at trigger for conversations
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();