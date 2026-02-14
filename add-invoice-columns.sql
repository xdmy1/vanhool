-- Add invoice tracking columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_url text;

