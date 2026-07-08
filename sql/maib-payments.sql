-- ============================================================================
-- maib card payments — orders + payments columns.
-- Paste into Supabase Studio SQL editor. IDEMPOTENT — safe to re-run.
--
-- Adds the 'card' payment method + a payment lifecycle on orders, so a card
-- order stays pending (no stock decrement / no emails) until maib confirms it
-- on the callback. Also fixes the payments table's stray EUR default.
-- ============================================================================

-- 1. Allow payment_method = 'card' (keep the existing values).
alter table public.orders
  drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('paynet', 'cash', 'transfer', 'already_paid', 'card'));

-- 2. Payment lifecycle on the order. promo_code is snapshotted so the callback
--    can bump promo usage only once the card payment actually succeeds.
alter table public.orders
  add column if not exists payment_status text
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  add column if not exists maib_pay_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists promo_code text;

-- 3. Audit trail lives in the existing payments table — fix its currency
--    default (was 'EUR'; this shop charges MDL).
alter table public.payments
  alter column currency set default 'MDL';

-- 4. Phase 2 — card pay-link on proformas/invoices (invoices table).
alter table public.invoices
  add column if not exists maib_pay_id text,
  add column if not exists payment_status text
    check (payment_status in ('pending', 'paid', 'failed', 'refunded'));
