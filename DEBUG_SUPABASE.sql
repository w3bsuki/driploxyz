-- Run these queries in Supabase SQL Editor to debug the issue

-- 1. Check if promotion_history table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'promotion_history';

-- 2. Check for triggers on products table that might insert into promotion_history
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'products';

-- 3. Check for foreign key constraints involving promotion_history
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'promotion_history' OR ccu.table_name = 'promotion_history');

-- 4. Check current RLS policies on promotion_history
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'promotion_history';

-- 5. Check if promotion_history has RLS enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'promotion_history';