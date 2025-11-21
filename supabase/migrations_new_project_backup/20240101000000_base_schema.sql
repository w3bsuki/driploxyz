-- Base Schema Recreation

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Enums
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'disputed', 'failed', 'completed');
CREATE TYPE product_condition AS ENUM ('brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair');
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');

-- Create Tables

CREATE TABLE admin_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action text NOT NULL,
    admin_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    details jsonb,
    ip_address text,
    target_id uuid,
    target_type text NOT NULL,
    user_agent text
);

CREATE TABLE admin_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action_label text,
    action_url text,
    country_code text,
    created_at timestamptz DEFAULT now(),
    data jsonb,
    is_read boolean,
    message text NOT NULL,
    priority text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    updated_at timestamptz,
    user_id uuid
);

CREATE TABLE auth_config_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    completed boolean,
    created_at timestamptz DEFAULT now(),
    description text NOT NULL,
    instructions text NOT NULL,
    task_type text NOT NULL
);

CREATE TABLE badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_description text,
    badge_icon text,
    badge_name text NOT NULL,
    badge_type text NOT NULL,
    created_at timestamptz DEFAULT now(),
    earned_at timestamptz,
    expires_at timestamptz,
    metadata jsonb,
    profile_id uuid NOT NULL
);

CREATE TABLE balance_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    amount numeric NOT NULL,
    balance_after numeric NOT NULL,
    balance_before numeric NOT NULL,
    created_at timestamptz DEFAULT now(),
    created_by uuid,
    description text NOT NULL,
    metadata jsonb,
    reference_id uuid,
    reference_type text,
    transaction_type text NOT NULL,
    user_id uuid NOT NULL
);

CREATE TABLE boost_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    boost_type text NOT NULL,
    boosted_at timestamptz,
    created_at timestamptz DEFAULT now(),
    credits_used integer NOT NULL,
    expires_at timestamptz NOT NULL,
    product_id uuid NOT NULL,
    status text,
    user_id uuid NOT NULL
);

CREATE TABLE brand_collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_type text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    description text,
    is_active boolean NOT NULL,
    is_featured boolean NOT NULL,
    logo_url text,
    name text NOT NULL,
    product_count integer NOT NULL,
    slug text NOT NULL,
    sort_order integer NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE brand_suggestions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    merged_to_brand text,
    status text,
    updated_at timestamptz,
    usage_count integer
);

CREATE TABLE brands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_description text,
    brand_logo_url text,
    brand_name text NOT NULL,
    business_registration text,
    contact_email text,
    contact_phone text,
    created_at timestamptz DEFAULT now(),
    profile_id uuid NOT NULL,
    subscription_active boolean,
    tax_id text,
    updated_at timestamptz,
    verification_documents jsonb,
    verified_brand boolean,
    website_url text
);

CREATE TABLE bundle_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id uuid NOT NULL,
    completed boolean,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz NOT NULL,
    product_ids uuid[] NOT NULL,
    seller_id uuid NOT NULL
);

CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    description text,
    image_url text,
    is_active boolean,
    level integer,
    name text NOT NULL,
    parent_id uuid,
    slug text NOT NULL,
    sort_order integer,
    updated_at timestamptz
);

CREATE TABLE conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    last_message_at timestamptz,
    last_message_content text,
    order_id uuid,
    participant_one_id uuid NOT NULL,
    participant_two_id uuid NOT NULL,
    product_id uuid,
    status text,
    unread_count_p1 integer,
    unread_count_p2 integer,
    updated_at timestamptz
);

CREATE TABLE country_config (
    country_code text PRIMARY KEY,
    commission_rate numeric,
    country_name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    currency text NOT NULL,
    is_active boolean,
    locale text NOT NULL,
    tax_rate numeric,
    updated_at timestamptz
);

CREATE TABLE discount_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    applicable_plans text[],
    code text NOT NULL,
    created_at timestamptz DEFAULT now(),
    currency text,
    description text,
    discount_type text NOT NULL,
    discount_value numeric NOT NULL,
    is_active boolean,
    maximum_discount numeric,
    metadata jsonb,
    minimum_amount numeric,
    name text,
    per_user_limit integer,
    updated_at timestamptz,
    usage_count integer,
    usage_limit integer,
    valid_from timestamptz,
    valid_until timestamptz
);

CREATE TABLE drip_nominations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_notes text,
    created_at timestamptz DEFAULT now(),
    metadata jsonb,
    nominated_at timestamptz,
    nominated_by uuid NOT NULL,
    product_id uuid NOT NULL,
    quality_score numeric,
    rejection_reason text,
    reviewed_at timestamptz,
    reviewed_by uuid,
    status text,
    updated_at timestamptz
);

CREATE TABLE favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    product_id uuid NOT NULL,
    user_id uuid NOT NULL
);

CREATE TABLE followers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    follower_id uuid,
    following_id uuid
);

CREATE TABLE manual_config_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    completed boolean,
    created_at timestamptz DEFAULT now(),
    description text NOT NULL,
    instructions text NOT NULL,
    priority text NOT NULL,
    task_type text NOT NULL
);

CREATE TABLE messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content text NOT NULL,
    conversation_id uuid,
    country_code text,
    created_at timestamptz DEFAULT now(),
    delivered_at timestamptz,
    image_urls text[],
    is_read boolean,
    message_type text,
    order_id uuid,
    product_id uuid,
    read_at timestamptz,
    receiver_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    status message_status
);

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action_required boolean,
    action_url text,
    category text,
    created_at timestamptz DEFAULT now(),
    data jsonb,
    dismissed boolean,
    dismissed_at timestamptz,
    expires_at timestamptz,
    message text NOT NULL,
    order_id uuid,
    priority text,
    read boolean,
    title text NOT NULL,
    type text NOT NULL,
    user_id uuid NOT NULL
);

CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    order_id uuid NOT NULL,
    price numeric NOT NULL,
    product_id uuid NOT NULL,
    quantity integer,
    size text
);

CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    archived boolean,
    archived_at timestamptz,
    bundle_discount numeric,
    buyer_id uuid NOT NULL,
    buyer_rated boolean,
    cancelled_at timestamptz,
    cancelled_reason text,
    commission_rate numeric,
    completion_notes text,
    country_code text,
    created_at timestamptz DEFAULT now(),
    currency text,
    delivered_at timestamptz,
    is_bundle boolean,
    items_count integer,
    notes text,
    payment_method text,
    platform_fee numeric,
    product_id uuid NOT NULL,
    rating_reminder_sent boolean,
    refund_amount numeric,
    refund_reason text,
    refunded_at timestamptz,
    seller_id uuid NOT NULL,
    seller_net_amount numeric,
    seller_rated boolean,
    service_fee numeric,
    shipped_at timestamptz,
    shipping_address jsonb,
    shipping_cost numeric,
    status order_status,
    tax_amount numeric,
    total_amount numeric NOT NULL,
    tracking_number text,
    updated_at timestamptz
);

CREATE TABLE payout_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_notes text,
    amount numeric NOT NULL,
    created_at timestamptz DEFAULT now(),
    currency text,
    metadata jsonb,
    net_amount numeric,
    payout_method jsonb NOT NULL,
    processed_at timestamptz,
    processed_by uuid,
    reference_number text,
    rejection_reason text,
    requested_at timestamptz,
    reviewed_at timestamptz,
    status text,
    transaction_fee numeric,
    updated_at timestamptz,
    user_id uuid NOT NULL
);

CREATE TABLE presence (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    last_seen timestamptz,
    status text,
    typing_in_conversation text,
    user_id uuid NOT NULL
);

CREATE TABLE product_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alt_text text,
    created_at timestamptz DEFAULT now(),
    display_order integer,
    image_url text NOT NULL,
    product_id uuid NOT NULL,
    sort_order integer
);

CREATE TABLE product_slug_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    changed_at timestamptz,
    old_slug text NOT NULL,
    product_id uuid NOT NULL
);

CREATE TABLE product_views (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    ip_address text,
    product_id uuid NOT NULL,
    user_agent text,
    user_id uuid
);

CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    archived_at timestamptz,
    auto_archive_after_days integer,
    boost_history_id uuid,
    boost_priority integer,
    boost_type text,
    boosted_until timestamptz,
    brand text,
    brand_collection_id uuid,
    category_id uuid NOT NULL,
    color text,
    commission_rate numeric,
    condition product_condition NOT NULL,
    country_code text,
    created_at timestamptz DEFAULT now(),
    custom_subcategory text,
    description text NOT NULL,
    drip_admin_notes text,
    drip_approved_at timestamptz,
    drip_nominated_at timestamptz,
    drip_nominated_by uuid,
    drip_quality_score numeric,
    drip_rejected_at timestamptz,
    drip_rejection_reason text,
    drip_reviewed_by uuid,
    drip_status text,
    favorite_count integer NOT NULL,
    is_active boolean,
    is_boosted boolean,
    is_drip_candidate boolean,
    is_featured boolean,
    is_sold boolean,
    location text,
    material text,
    net_earnings numeric,
    platform_fee numeric,
    price numeric NOT NULL,
    region text,
    search_vector tsvector,
    seller_id uuid NOT NULL,
    shipping_cost numeric,
    size text,
    slug text,
    slug_locked boolean,
    sold_at timestamptz,
    status text,
    tags text[],
    title text NOT NULL,
    updated_at timestamptz,
    view_count integer
);

CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    is_seller boolean DEFAULT false,
    account_locked_until timestamptz,
    account_type text,
    avatar_url text,
    avg_shipping_hours numeric,
    bio text,
    boost_credits_used_this_month integer,
    brand_status text,
    country_code text,
    created_at timestamptz DEFAULT now(),
    currency text,
    current_balance numeric,
    date_of_birth date,
    failed_login_attempts integer,
    followers_count integer,
    following_count integer,
    full_name text,
    grace_period_ends_at timestamptz,
    last_active_at timestamptz,
    last_boost_reset_date timestamptz,
    last_password_change timestamptz,
    last_payout_at timestamptz,
    last_stats_update timestamptz,
    location text,
    monthly_views integer,
    on_time_shipping_rate numeric,
    onboarding_completed boolean,
    payout_method jsonb,
    payout_settings jsonb,
    phone text,
    premium_boosts_remaining integer,
    purchases_count integer,
    rating numeric,
    rating_breakdown jsonb,
    region text,
    response_time_hours numeric,
    review_count integer,
    role user_role,
    sales_count integer,
    seller_metrics jsonb,
    social_links jsonb,
    subscription_expires_at timestamptz,
    subscription_tier text,
    total_boosts_used integer,
    total_reviews integer,
    total_sales integer,
    total_sales_value numeric,
    total_withdrawn numeric,
    two_factor_enabled boolean,
    updated_at timestamptz,
    username text,
    verification_documents jsonb,
    verification_status text,
    verified boolean,
    weekly_sales_count integer
);

CREATE TABLE reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    comment text,
    communication_rating numeric,
    country_code text,
    created_at timestamptz DEFAULT now(),
    helpful_count integer,
    image_urls text[],
    is_public boolean,
    is_verified_purchase boolean,
    order_id uuid,
    product_id uuid,
    product_quality_rating numeric,
    rating numeric NOT NULL,
    reviewee_id uuid NOT NULL,
    reviewer_id uuid NOT NULL,
    shipping_rating numeric,
    title text,
    updated_at timestamptz
);

CREATE TABLE seller_balances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    available_balance numeric,
    created_at timestamptz DEFAULT now(),
    currency text,
    last_payout_at timestamptz,
    pending_balance numeric,
    total_earned numeric,
    total_withdrawn numeric,
    updated_at timestamptz,
    user_id uuid
);

CREATE TABLE slug_processing_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attempts integer NOT NULL,
    created_at timestamptz DEFAULT now(),
    error_message text,
    max_attempts integer NOT NULL,
    product_id uuid NOT NULL,
    status text NOT NULL,
    updated_at timestamptz
);

CREATE TABLE subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    analytics_access boolean,
    created_at timestamptz DEFAULT now(),
    currency text NOT NULL,
    description text,
    features jsonb,
    is_active boolean,
    max_listings integer,
    max_photos_per_listing integer,
    name text NOT NULL,
    plan_type text NOT NULL,
    price_monthly numeric NOT NULL,
    price_yearly numeric NOT NULL,
    priority_support boolean,
    slug text NOT NULL,
    stripe_price_id_monthly text,
    stripe_price_id_yearly text,
    updated_at timestamptz
);

CREATE TABLE system_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action text NOT NULL,
    created_at timestamptz DEFAULT now(),
    message text,
    metadata jsonb
);

CREATE TABLE transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    amount_total numeric NOT NULL,
    buyer_id uuid NOT NULL,
    commission_amount numeric NOT NULL,
    country_code text,
    created_at timestamptz DEFAULT now(),
    currency text NOT NULL,
    metadata jsonb,
    order_id uuid NOT NULL,
    payment_status text,
    payout_date timestamptz,
    payout_reference text,
    payout_status text,
    processed_at timestamptz,
    product_price numeric,
    seller_earnings numeric NOT NULL,
    seller_id uuid NOT NULL,
    shipping_cost numeric,
    status text NOT NULL,
    stripe_payment_intent_id text NOT NULL,
    updated_at timestamptz
);

CREATE TABLE user_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    amount numeric NOT NULL,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    currency text NOT NULL,
    failed_at timestamptz,
    metadata jsonb,
    plan_type text,
    refunded_at timestamptz,
    status text NOT NULL,
    stripe_payment_intent_id text NOT NULL,
    user_id uuid NOT NULL
);

CREATE TABLE user_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    amount_paid numeric,
    auto_renewal boolean,
    cancel_at_period_end boolean,
    canceled_at timestamptz,
    created_at timestamptz DEFAULT now(),
    currency text,
    current_period_end timestamptz,
    current_period_start timestamptz,
    discount_code text,
    discount_percent numeric,
    expiry_warning_sent boolean,
    final_price numeric,
    grace_period_days integer,
    metadata jsonb,
    original_price numeric,
    payment_method jsonb,
    plan_id uuid NOT NULL,
    renewal_reminder_sent boolean,
    status text NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    subscription_source text,
    trial_end timestamptz,
    updated_at timestamptz,
    user_id uuid NOT NULL
);

CREATE TABLE username_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    changed_at timestamptz,
    old_username text NOT NULL,
    user_id uuid NOT NULL
);

-- Add Foreign Key Constraints

ALTER TABLE admin_actions ADD CONSTRAINT admin_actions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES profiles(id);

ALTER TABLE admin_notifications ADD CONSTRAINT admin_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

ALTER TABLE badges ADD CONSTRAINT badges_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id);

ALTER TABLE balance_history ADD CONSTRAINT balance_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);
ALTER TABLE balance_history ADD CONSTRAINT balance_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

ALTER TABLE boost_history ADD CONSTRAINT boost_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE boost_history ADD CONSTRAINT boost_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

ALTER TABLE brands ADD CONSTRAINT brands_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id);

ALTER TABLE bundle_sessions ADD CONSTRAINT bundle_sessions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES profiles(id);
ALTER TABLE bundle_sessions ADD CONSTRAINT bundle_sessions_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES profiles(id);

ALTER TABLE categories ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES categories(id);

ALTER TABLE conversations ADD CONSTRAINT conversations_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE conversations ADD CONSTRAINT conversations_participant_one_id_fkey FOREIGN KEY (participant_one_id) REFERENCES profiles(id);
ALTER TABLE conversations ADD CONSTRAINT conversations_participant_two_id_fkey FOREIGN KEY (participant_two_id) REFERENCES profiles(id);
ALTER TABLE conversations ADD CONSTRAINT conversations_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE drip_nominations ADD CONSTRAINT drip_nominations_nominated_by_fkey FOREIGN KEY (nominated_by) REFERENCES profiles(id);
ALTER TABLE drip_nominations ADD CONSTRAINT drip_nominations_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE drip_nominations ADD CONSTRAINT drip_nominations_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id);

ALTER TABLE favorites ADD CONSTRAINT favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

ALTER TABLE followers ADD CONSTRAINT followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES profiles(id);
ALTER TABLE followers ADD CONSTRAINT followers_following_id_fkey FOREIGN KEY (following_id) REFERENCES profiles(id);

ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id);
ALTER TABLE messages ADD CONSTRAINT messages_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE messages ADD CONSTRAINT messages_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES profiles(id);
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id);

ALTER TABLE notifications ADD CONSTRAINT notifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id);

ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE orders ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES profiles(id);
ALTER TABLE orders ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE orders ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES profiles(id);

ALTER TABLE payout_requests ADD CONSTRAINT payout_requests_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES profiles(id);
ALTER TABLE payout_requests ADD CONSTRAINT payout_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

ALTER TABLE product_images ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE product_slug_history ADD CONSTRAINT product_slug_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE product_views ADD CONSTRAINT product_views_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE products ADD CONSTRAINT products_boost_history_id_fkey FOREIGN KEY (boost_history_id) REFERENCES boost_history(id);
ALTER TABLE products ADD CONSTRAINT products_brand_collection_id_fkey FOREIGN KEY (brand_collection_id) REFERENCES brand_collections(id);
ALTER TABLE products ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id);
ALTER TABLE products ADD CONSTRAINT products_drip_nominated_by_fkey FOREIGN KEY (drip_nominated_by) REFERENCES profiles(id);
ALTER TABLE products ADD CONSTRAINT products_drip_reviewed_by_fkey FOREIGN KEY (drip_reviewed_by) REFERENCES profiles(id);
ALTER TABLE products ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES profiles(id);

ALTER TABLE reviews ADD CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE reviews ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);
ALTER TABLE reviews ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES profiles(id);
ALTER TABLE reviews ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES profiles(id);

ALTER TABLE seller_balances ADD CONSTRAINT seller_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

ALTER TABLE slug_processing_queue ADD CONSTRAINT slug_processing_queue_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE transactions ADD CONSTRAINT transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id);

ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id);

ALTER TABLE username_history ADD CONSTRAINT username_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);
