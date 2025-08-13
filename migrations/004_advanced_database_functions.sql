-- Driplo Marketplace - Advanced Database Functions and Triggers
-- Migration: 004_advanced_database_functions
-- Description: Advanced functions for search, analytics, and business logic

-- SEARCH FUNCTIONS

-- Advanced product search with filters
CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT DEFAULT NULL,
    category_ids UUID[] DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    conditions product_condition[] DEFAULT NULL,
    sizes TEXT[] DEFAULT NULL,
    brands TEXT[] DEFAULT NULL,
    location_filter TEXT DEFAULT NULL,
    seller_id_filter UUID DEFAULT NULL,
    sort_by TEXT DEFAULT 'created_at',
    sort_direction TEXT DEFAULT 'DESC',
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    price DECIMAL,
    brand VARCHAR,
    size VARCHAR,
    condition product_condition,
    location VARCHAR,
    seller_id UUID,
    seller_name VARCHAR,
    seller_rating DECIMAL,
    category_name VARCHAR,
    image_url TEXT,
    favorite_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.price,
        p.brand,
        p.size,
        p.condition,
        p.location,
        p.seller_id,
        pr.username AS seller_name,
        pr.rating AS seller_rating,
        c.name AS category_name,
        (SELECT pi.image_url FROM public.product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) AS image_url,
        p.favorite_count,
        p.created_at,
        CASE 
            WHEN search_query IS NOT NULL THEN 
                ts_rank(
                    to_tsvector('english', p.title || ' ' || p.description || ' ' || COALESCE(p.brand, '')),
                    plainto_tsquery('english', search_query)
                )
            ELSE 0
        END AS rank
    FROM public.products p
    LEFT JOIN public.profiles pr ON p.seller_id = pr.id
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE 
        p.is_active = true 
        AND p.is_sold = false
        AND (search_query IS NULL OR (
            to_tsvector('english', p.title || ' ' || p.description || ' ' || COALESCE(p.brand, ''))
            @@ plainto_tsquery('english', search_query)
        ))
        AND (category_ids IS NULL OR p.category_id = ANY(category_ids))
        AND (min_price IS NULL OR p.price >= min_price)
        AND (max_price IS NULL OR p.price <= max_price)
        AND (conditions IS NULL OR p.condition = ANY(conditions))
        AND (sizes IS NULL OR p.size = ANY(sizes))
        AND (brands IS NULL OR p.brand = ANY(brands))
        AND (location_filter IS NULL OR p.location ILIKE '%' || location_filter || '%')
        AND (seller_id_filter IS NULL OR p.seller_id = seller_id_filter)
    ORDER BY 
        CASE 
            WHEN sort_by = 'price' AND sort_direction = 'ASC' THEN p.price 
            WHEN sort_by = 'price' AND sort_direction = 'DESC' THEN -p.price
            WHEN sort_by = 'created_at' AND sort_direction = 'DESC' THEN extract(epoch from p.created_at) * -1
            WHEN sort_by = 'created_at' AND sort_direction = 'ASC' THEN extract(epoch from p.created_at)
            WHEN sort_by = 'popularity' THEN -p.favorite_count
            WHEN sort_by = 'relevance' AND search_query IS NOT NULL THEN -rank
            ELSE extract(epoch from p.created_at) * -1
        END
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Get product suggestions based on user preferences
CREATE OR REPLACE FUNCTION get_product_suggestions(
    user_id_param UUID,
    limit_count INTEGER DEFAULT 10
) RETURNS TABLE (
    id UUID,
    title VARCHAR,
    price DECIMAL,
    image_url TEXT,
    seller_name VARCHAR,
    seller_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.price,
        (SELECT pi.image_url FROM public.product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) AS image_url,
        pr.username AS seller_name,
        pr.rating AS seller_rating
    FROM public.products p
    LEFT JOIN public.profiles pr ON p.seller_id = pr.id
    WHERE 
        p.is_active = true 
        AND p.is_sold = false
        AND p.seller_id != user_id_param
        AND (
            -- Products in categories user has favorited
            p.category_id IN (
                SELECT DISTINCT prod.category_id 
                FROM public.favorites f
                JOIN public.products prod ON f.product_id = prod.id
                WHERE f.user_id = user_id_param
            )
            OR
            -- Products in price range of user's favorites
            p.price BETWEEN (
                SELECT COALESCE(AVG(prod.price) - STDDEV(prod.price), 0)
                FROM public.favorites f
                JOIN public.products prod ON f.product_id = prod.id
                WHERE f.user_id = user_id_param
            ) AND (
                SELECT COALESCE(AVG(prod.price) + STDDEV(prod.price), 999999)
                FROM public.favorites f
                JOIN public.products prod ON f.product_id = prod.id
                WHERE f.user_id = user_id_param
            )
        )
    ORDER BY 
        p.favorite_count DESC,
        p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ANALYTICS FUNCTIONS

-- Get seller analytics
CREATE OR REPLACE FUNCTION get_seller_analytics(
    seller_id_param UUID,
    days_back INTEGER DEFAULT 30
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_products', (
            SELECT COUNT(*) FROM public.products 
            WHERE seller_id = seller_id_param
        ),
        'active_products', (
            SELECT COUNT(*) FROM public.products 
            WHERE seller_id = seller_id_param AND is_active = true AND is_sold = false
        ),
        'sold_products', (
            SELECT COUNT(*) FROM public.products 
            WHERE seller_id = seller_id_param AND is_sold = true
        ),
        'total_sales', (
            SELECT COALESCE(SUM(o.total_amount), 0)
            FROM public.orders o
            WHERE o.seller_id = seller_id_param AND o.status = 'delivered'
        ),
        'recent_sales', (
            SELECT COALESCE(SUM(o.total_amount), 0)
            FROM public.orders o
            WHERE o.seller_id = seller_id_param 
            AND o.status = 'delivered'
            AND o.created_at > NOW() - INTERVAL '1 day' * days_back
        ),
        'average_order_value', (
            SELECT COALESCE(AVG(o.total_amount), 0)
            FROM public.orders o
            WHERE o.seller_id = seller_id_param AND o.status = 'delivered'
        ),
        'total_favorites', (
            SELECT COALESCE(SUM(p.favorite_count), 0)
            FROM public.products p
            WHERE p.seller_id = seller_id_param
        ),
        'rating', (
            SELECT rating FROM public.profiles WHERE id = seller_id_param
        ),
        'review_count', (
            SELECT review_count FROM public.profiles WHERE id = seller_id_param
        ),
        'response_rate', (
            -- Calculate message response rate
            SELECT CASE 
                WHEN received_count = 0 THEN 0
                ELSE (responded_count::FLOAT / received_count::FLOAT) * 100
            END
            FROM (
                SELECT 
                    COUNT(*) AS received_count,
                    COUNT(response.id) AS responded_count
                FROM public.messages received
                LEFT JOIN public.messages response ON (
                    response.sender_id = seller_id_param
                    AND response.receiver_id = received.sender_id
                    AND response.product_id = received.product_id
                    AND response.created_at > received.created_at
                    AND response.created_at <= received.created_at + INTERVAL '24 hours'
                )
                WHERE received.receiver_id = seller_id_param
                AND received.created_at > NOW() - INTERVAL '1 day' * days_back
            ) stats
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- BUSINESS LOGIC FUNCTIONS

-- Create order and mark product as sold
CREATE OR REPLACE FUNCTION create_order_transaction(
    buyer_id_param UUID,
    product_id_param UUID,
    shipping_address_param JSONB
) RETURNS UUID AS $$
DECLARE
    order_id UUID;
    product_record public.products;
BEGIN
    -- Get product details
    SELECT * INTO product_record 
    FROM public.products 
    WHERE id = product_id_param AND is_active = true AND is_sold = false;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found or already sold';
    END IF;
    
    IF product_record.seller_id = buyer_id_param THEN
        RAISE EXCEPTION 'Cannot buy your own product';
    END IF;
    
    -- Create order
    INSERT INTO public.orders (
        buyer_id,
        seller_id,
        product_id,
        total_amount,
        shipping_cost,
        shipping_address
    ) VALUES (
        buyer_id_param,
        product_record.seller_id,
        product_id_param,
        product_record.price + product_record.shipping_cost,
        product_record.shipping_cost,
        shipping_address_param
    ) RETURNING id INTO order_id;
    
    -- Mark product as sold
    UPDATE public.products 
    SET is_sold = true, sold_at = NOW()
    WHERE id = product_id_param;
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql;

-- Update product view count
CREATE OR REPLACE FUNCTION increment_product_view(
    product_id_param UUID
) RETURNS VOID AS $$
BEGIN
    UPDATE public.products 
    SET view_count = view_count + 1
    WHERE id = product_id_param AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Get conversation thread between users about a product
CREATE OR REPLACE FUNCTION get_conversation_thread(
    user1_id UUID,
    user2_id UUID,
    product_id_param UUID DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    sender_id UUID,
    receiver_id UUID,
    content TEXT,
    image_urls TEXT[],
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    sender_username VARCHAR,
    sender_avatar TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.image_urls,
        m.is_read,
        m.created_at,
        p.username AS sender_username,
        p.avatar_url AS sender_avatar
    FROM public.messages m
    LEFT JOIN public.profiles p ON m.sender_id = p.id
    WHERE 
        ((m.sender_id = user1_id AND m.receiver_id = user2_id) OR
         (m.sender_id = user2_id AND m.receiver_id = user1_id))
        AND (product_id_param IS NULL OR m.product_id = product_id_param)
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER FUNCTIONS

-- Update sales count when order is completed
CREATE OR REPLACE FUNCTION update_sales_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        -- Update seller's sales count
        UPDATE public.profiles
        SET sales_count = sales_count + 1
        WHERE id = NEW.seller_id;
        
        -- Update buyer's purchases count
        UPDATE public.profiles
        SET purchases_count = purchases_count + 1
        WHERE id = NEW.buyer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sales count
CREATE TRIGGER update_sales_count_trigger
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_sales_count();

-- Update last active timestamp when user performs actions
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET last_active_at = NOW()
    WHERE id = (SELECT auth.uid());
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for last active update
CREATE TRIGGER update_last_active_products
    AFTER INSERT OR UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();

CREATE TRIGGER update_last_active_messages
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();

CREATE TRIGGER update_last_active_orders
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();

-- UTILITY FUNCTIONS

-- Generate unique username
CREATE OR REPLACE FUNCTION generate_unique_username(base_username TEXT)
RETURNS TEXT AS $$
DECLARE
    username TEXT;
    counter INTEGER := 0;
BEGIN
    username := base_username;
    
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username) LOOP
        counter := counter + 1;
        username := base_username || counter::TEXT;
    END LOOP;
    
    RETURN username;
END;
$$ LANGUAGE plpgsql;

-- Clean old unread messages (for performance)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS VOID AS $$
BEGIN
    -- Delete messages older than 1 year that are unread
    DELETE FROM public.messages
    WHERE created_at < NOW() - INTERVAL '1 year'
    AND is_read = false;
    
    -- Update statistics
    ANALYZE public.messages;
END;
$$ LANGUAGE plpgsql;