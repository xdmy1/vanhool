-- =============================================================================
-- Add currency to public.delivery_notes so the printable sheet matches the
-- sale's actual currency (MDL/EUR/USD), not a hardcoded "MDL". Defaults to
-- MDL so existing rows keep their semantics. Idempotent.
-- =============================================================================

alter table public.delivery_notes
  add column if not exists currency text not null default 'MDL'
    check (currency in ('MDL', 'EUR', 'USD'));
