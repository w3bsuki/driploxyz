-- Fix NULL token values that break Supabase Auth
-- This is a critical fix for production stability
-- Run this immediately on any environment experiencing auth issues

DO $$
BEGIN
  -- Update any NULL token values to empty strings
  -- Supabase Auth expects these to never be NULL
  UPDATE auth.users 
  SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, '')
  WHERE 
    confirmation_token IS NULL 
    OR recovery_token IS NULL
    OR email_change_token_new IS NULL
    OR email_change_token_current IS NULL;
    
  -- Log how many rows were affected
  RAISE NOTICE 'Fixed % users with NULL token values', ROW_COUNT;
END $$;