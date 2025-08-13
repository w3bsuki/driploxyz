-- Driplo Marketplace - Row Level Security Policies
-- Migration: 003_implement_rls_policies
-- Description: Implements comprehensive RLS policies for all tables

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- CATEGORIES TABLE POLICIES
-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        )
    );

-- PROFILES TABLE POLICIES
-- Users can view all public profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles
    FOR SELECT USING (true);

-- Users can only insert their own profile (handled by trigger)
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- Users cannot delete their own profile (use Supabase Auth)
CREATE POLICY "Profiles cannot be deleted" ON public.profiles
    FOR DELETE USING (false);

-- PRODUCTS TABLE POLICIES
-- Anyone can view active products that are not sold
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Authenticated users can insert products
CREATE POLICY "Authenticated users can create products" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = seller_id);

-- Sellers can update their own products
CREATE POLICY "Sellers can update their own products" ON public.products
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = seller_id)
    WITH CHECK ((SELECT auth.uid()) = seller_id);

-- Sellers can delete their own products (soft delete by setting is_active = false)
CREATE POLICY "Sellers can delete their own products" ON public.products
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = seller_id);

-- PRODUCT IMAGES TABLE POLICIES
-- Anyone can view product images if the product is active
CREATE POLICY "Anyone can view product images" ON public.product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id AND p.is_active = true
        )
    );

-- Product owners can insert images for their products
CREATE POLICY "Product owners can insert images" ON public.product_images
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id AND p.seller_id = (SELECT auth.uid())
        )
    );

-- Product owners can update their product images
CREATE POLICY "Product owners can update images" ON public.product_images
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id AND p.seller_id = (SELECT auth.uid())
        )
    );

-- Product owners can delete their product images
CREATE POLICY "Product owners can delete images" ON public.product_images
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id AND p.seller_id = (SELECT auth.uid())
        )
    );

-- ORDERS TABLE POLICIES
-- Users can view orders they're involved in (as buyer or seller)
CREATE POLICY "Users can view their orders" ON public.orders
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) = buyer_id OR 
        (SELECT auth.uid()) = seller_id
    );

-- Buyers can create orders for products
CREATE POLICY "Buyers can create orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = buyer_id AND
        (SELECT auth.uid()) != seller_id AND
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id AND p.is_active = true AND p.is_sold = false
        )
    );

-- Only order participants can update orders (with restrictions)
CREATE POLICY "Order participants can update orders" ON public.orders
    FOR UPDATE TO authenticated
    USING (
        (SELECT auth.uid()) = buyer_id OR 
        (SELECT auth.uid()) = seller_id
    )
    WITH CHECK (
        (SELECT auth.uid()) = buyer_id OR 
        (SELECT auth.uid()) = seller_id
    );

-- Orders cannot be deleted
CREATE POLICY "Orders cannot be deleted" ON public.orders
    FOR DELETE USING (false);

-- MESSAGES TABLE POLICIES
-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) = sender_id OR 
        (SELECT auth.uid()) = receiver_id
    );

-- Authenticated users can send messages
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = sender_id AND
        (SELECT auth.uid()) != receiver_id AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = receiver_id)
    );

-- Users can update messages they sent (for read status, etc.)
CREATE POLICY "Users can update their sent messages" ON public.messages
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = receiver_id)
    WITH CHECK ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = receiver_id);

-- Users can delete messages they sent
CREATE POLICY "Users can delete their sent messages" ON public.messages
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = sender_id);

-- REVIEWS TABLE POLICIES
-- Anyone can view public reviews
CREATE POLICY "Anyone can view public reviews" ON public.reviews
    FOR SELECT USING (is_public = true);

-- Reviewers can view their own reviews (even private ones)
CREATE POLICY "Reviewers can view their own reviews" ON public.reviews
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = reviewer_id);

-- Reviewees can view reviews about them
CREATE POLICY "Reviewees can view reviews about them" ON public.reviews
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = reviewee_id);

-- Users can create reviews (with restrictions)
CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = reviewer_id AND
        (SELECT auth.uid()) != reviewee_id AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = reviewee_id) AND
        -- Can only review if there was a transaction (order) between them
        (
            product_id IS NULL OR 
            EXISTS (
                SELECT 1 FROM public.orders o 
                WHERE o.id = order_id 
                AND (
                    (o.buyer_id = (SELECT auth.uid()) AND o.seller_id = reviewee_id) OR
                    (o.seller_id = (SELECT auth.uid()) AND o.buyer_id = reviewee_id)
                )
                AND o.status = 'delivered'
            )
        )
    );

-- Reviewers can update their own reviews
CREATE POLICY "Reviewers can update their own reviews" ON public.reviews
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = reviewer_id)
    WITH CHECK ((SELECT auth.uid()) = reviewer_id);

-- Reviewers can delete their own reviews
CREATE POLICY "Reviewers can delete their own reviews" ON public.reviews
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = reviewer_id);

-- FAVORITES TABLE POLICIES
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites" ON public.favorites
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = user_id AND
        EXISTS (
            SELECT 1 FROM public.products p 
            WHERE p.id = product_id AND p.is_active = true
        )
    );

-- Users can remove their own favorites
CREATE POLICY "Users can remove their own favorites" ON public.favorites
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- Favorites cannot be updated
CREATE POLICY "Favorites cannot be updated" ON public.favorites
    FOR UPDATE USING (false);

-- ADDITIONAL SECURITY FUNCTIONS

-- Function to check if user can modify order status
CREATE OR REPLACE FUNCTION can_update_order_status(
    order_id UUID,
    new_status order_status,
    user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    order_record public.orders;
BEGIN
    SELECT * INTO order_record FROM public.orders WHERE id = order_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Only order participants can update
    IF user_id != order_record.buyer_id AND user_id != order_record.seller_id THEN
        RETURN FALSE;
    END IF;
    
    -- Status transition rules
    CASE order_record.status
        WHEN 'pending' THEN
            -- Buyer can cancel, seller can mark as paid
            RETURN (
                (user_id = order_record.buyer_id AND new_status = 'cancelled') OR
                (user_id = order_record.seller_id AND new_status = 'paid')
            );
        WHEN 'paid' THEN
            -- Seller can ship or cancel
            RETURN (
                user_id = order_record.seller_id AND 
                new_status IN ('shipped', 'cancelled')
            );
        WHEN 'shipped' THEN
            -- Buyer can mark as delivered, either can dispute
            RETURN (
                (user_id = order_record.buyer_id AND new_status = 'delivered') OR
                new_status = 'disputed'
            );
        WHEN 'delivered' THEN
            -- Either party can dispute within reasonable time
            RETURN (
                new_status = 'disputed' AND 
                order_record.delivered_at > NOW() - INTERVAL '30 days'
            );
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can message about a product
CREATE OR REPLACE FUNCTION can_message_about_product(
    sender_id UUID,
    receiver_id UUID,
    product_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Can't message yourself
    IF sender_id = receiver_id THEN
        RETURN FALSE;
    END IF;
    
    -- Product must exist and be active
    IF NOT EXISTS (
        SELECT 1 FROM public.products 
        WHERE id = product_id AND is_active = true
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Can message if:
    -- 1. You're interested in buying (messaging the seller)
    -- 2. You're the seller responding to inquiries
    RETURN EXISTS (
        SELECT 1 FROM public.products p 
        WHERE p.id = product_id AND (
            p.seller_id = receiver_id OR  -- messaging the seller
            p.seller_id = sender_id       -- seller responding
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;