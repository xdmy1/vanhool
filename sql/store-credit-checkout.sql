-- ============================================================================
-- Phase 2: apply store credit at storefront checkout
-- ----------------------------------------------------------------------------
-- The site operates in MDL, so only MDL credit is applied here (never
-- converted). These columns record how much store credit settled an order and
-- which credits it consumed, so consumption stays idempotent (a card order only
-- consumes credit once, on the paid callback — guarded by credit_consumed_at).
--
-- Idempotent — safe to paste into Supabase Studio's SQL editor more than once.
-- ============================================================================

alter table public.orders
  add column if not exists credit_applied numeric(12,2) not null default 0,
  -- [{ id, amount }] — which store credits this order drew down, and by how much.
  add column if not exists credit_ids jsonb not null default '[]'::jsonb,
  add column if not exists credit_consumed_at timestamptz;
