-- ============================================================================
-- INTER BUS — Custom per-product spec fields
-- Adaugă o coloană jsonb pentru perechi {label, value} arbitrare pe produs:
--   dinți, densitate, tensiune nominală, lungime arc, etc. — admin alege
--   numele și valoarea, storefront le afișează doar dacă există.
-- Idempotent.
-- ============================================================================

alter table public.products
    add column if not exists custom_specs jsonb not null default '[]'::jsonb;
