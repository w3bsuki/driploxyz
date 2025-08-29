-- Driplo Marketplace - Social Features (Followers + Messaging View/RPC)
-- Migration: 006_social_features
-- Description: Adds followers table with RLS and a view/RPCs for messaging details

-- =============================
-- 1) FOLLOWERS TABLE + RLS
-- =============================

-- Create followers table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'followers'
  ) THEN
    CREATE TABLE public.followers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(follower_id, following_id)
    );

    CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON public.followers(follower_id);
    CREATE INDEX IF NOT EXISTS idx_followers_following_id ON public.followers(following_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Allow public read of follower relationships (for profile pages)
DROP POLICY IF EXISTS followers_read ON public.followers;
CREATE POLICY followers_read ON public.followers
  FOR SELECT USING (true);

-- Only authenticated users can follow (insert where follower_id = auth.uid())
DROP POLICY IF EXISTS followers_insert ON public.followers;
CREATE POLICY followers_insert ON public.followers
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = follower_id);

-- Only the follower can unfollow (delete)
DROP POLICY IF EXISTS followers_delete ON public.followers;
CREATE POLICY followers_delete ON public.followers
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = follower_id);

-- Optional: prevent following yourself at the database level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'followers_self_follow_check'
  ) THEN
    ALTER TABLE public.followers
      ADD CONSTRAINT followers_self_follow_check CHECK (follower_id <> following_id);
  END IF;
END $$;

-- ===================================================
-- 2) messages_with_details VIEW for enriched messages
-- ===================================================

-- Drop and recreate for idempotency and easier iteration
DROP VIEW IF EXISTS public.messages_with_details;
CREATE OR REPLACE VIEW public.messages_with_details AS
SELECT 
  m.*,
  -- Minimal sender details as JSONB
  jsonb_build_object(
    'id', s.id,
    'username', s.username,
    'full_name', s.full_name,
    'avatar_url', s.avatar_url,
    'last_active_at', s.last_active_at
  ) AS sender,
  -- Minimal receiver details as JSONB
  jsonb_build_object(
    'id', r.id,
    'username', r.username,
    'full_name', r.full_name,
    'avatar_url', r.avatar_url,
    'last_active_at', r.last_active_at
  ) AS receiver,
  -- Minimal product details as JSONB (including first image)
  jsonb_build_object(
    'id', p.id,
    'title', p.title,
    'price', p.price,
    'images', (
      SELECT COALESCE(json_agg(json_build_object('image_url', pi.image_url) ORDER BY pi.sort_order), '[]'::json)
      FROM public.product_images pi 
      WHERE pi.product_id = p.id
    )
  ) AS product
FROM public.messages m
LEFT JOIN public.profiles s ON s.id = m.sender_id
LEFT JOIN public.profiles r ON r.id = m.receiver_id
LEFT JOIN public.products p ON p.id = m.product_id;

-- Helpful indexes for messaging performance (no-op if they exist)
CREATE INDEX IF NOT EXISTS idx_messages_sr_created ON public.messages (sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_product_created ON public.messages (product_id, created_at DESC);

-- =====================================
-- 3) RPC: mark_messages_as_read (optional)
-- =====================================

-- Marks messages from a specific sender (and optional product) as read for the current user
DROP FUNCTION IF EXISTS public.mark_messages_as_read(UUID, UUID);
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_sender_id UUID,
  p_product_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE public.messages
  SET is_read = TRUE
  WHERE receiver_id = (SELECT auth.uid())
    AND sender_id = p_sender_id
    AND (
      (p_product_id IS NULL AND product_id IS NULL) OR
      (p_product_id IS NOT NULL AND product_id = p_product_id)
    );

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

