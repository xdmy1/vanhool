-- ============================================================================
-- Currency-aware cash register movements.
--
-- Before this migration, cash_register_movements stored only `amount` as a
-- plain numeric — so a 3292.50 EUR sale ended up adding 3292.50 to the
-- drawer balance as if it were MDL, inflating the till total by ~20x for
-- every foreign-currency cash sale.
--
-- This migration:
--   1) Adds `currency` (the unit `amount` is denominated in) and
--      `amount_mdl` (the same value converted to MDL at the rate used at
--      the time of recording, so historical balances reconcile to a
--      single base currency).
--   2) Backfills both columns for existing rows:
--        • Rows tied to an order → inherit `orders.currency`.
--        • Manual rows (top_up / withdrawal / adjustment) → assume MDL.
--      `amount_mdl` is computed via a fixed reference table
--      (MDL=1, EUR=20, USD=17) — same table the wizard uses.
--   3) Makes `currency` NOT NULL with default 'MDL' so future inserts
--      that forget the column still behave sanely.
-- ============================================================================

alter table public.cash_register_movements
  add column if not exists currency  text,
  add column if not exists amount_mdl numeric(12,2),
  add column if not exists fx_rate    numeric(10,4);

-- Backfill currency from the linked order; fallback MDL for manual rows.
update public.cash_register_movements m
set currency = coalesce(
  (select o.currency from public.orders o where o.id = m.order_id),
  'MDL'
)
where m.currency is null;

-- Backfill amount_mdl and fx_rate using fixed reference rates.
update public.cash_register_movements m
set
  fx_rate = case m.currency
    when 'EUR' then 20.0
    when 'USD' then 17.0
    else 1.0
  end,
  amount_mdl = round(
    m.amount * case m.currency
      when 'EUR' then 20.0
      when 'USD' then 17.0
      else 1.0
    end,
    2
  )
where m.amount_mdl is null;

-- Lock the currency column down going forward.
alter table public.cash_register_movements
  alter column currency set default 'MDL',
  alter column currency set not null;

do $$ begin
  alter table public.cash_register_movements
    add constraint cash_currency_check
    check (currency in ('MDL','EUR','USD'));
exception when duplicate_object then null; end $$;

-- Report how much MDL was "phantom" cash on the drawer before the fix.
do $$
declare
  before_total numeric;
  after_total  numeric;
begin
  select coalesce(sum(case when direction='in' then amount else -amount end), 0)
    into before_total
    from public.cash_register_movements
    where drawer = 'main';
  select coalesce(sum(case when direction='in' then amount_mdl else -amount_mdl end), 0)
    into after_total
    from public.cash_register_movements
    where drawer = 'main';
  raise notice
    'Cash drawer "main": raw-amount balance = %, MDL-correct balance = %, delta = %',
    before_total, after_total, after_total - before_total;
end $$;
