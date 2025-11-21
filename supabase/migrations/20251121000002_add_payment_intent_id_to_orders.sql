-- Migration: Add payment_intent_id to orders table
-- Created: 2025-11-21
-- Description: Adds payment_intent_id column to orders table for idempotency and tracking

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_intent_id text;

CREATE INDEX IF NOT EXISTS orders_payment_intent_id_idx ON orders(payment_intent_id);
