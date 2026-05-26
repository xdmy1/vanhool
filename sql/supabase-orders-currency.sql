-- =============================================================================
-- Add a currency column to public.orders so panel sales (especially Conta 2)
-- can record EUR/USD transactions. Defaults to MDL so existing rows keep
-- their semantics. Idempotent.
-- =============================================================================

alter table public.orders
  add column if not exists currency text not null default 'MDL'
    check (currency in ('MDL', 'EUR', 'USD'));
