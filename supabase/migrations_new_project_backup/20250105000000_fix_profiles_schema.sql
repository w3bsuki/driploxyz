-- Fix profiles schema missing column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_seller boolean DEFAULT false;
