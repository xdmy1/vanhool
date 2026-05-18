-- ============================================================================
-- "Available on order" lead-time column for products.
--
-- Semantics:
--   lead_time_days IS NULL   → only sellable from stock (legacy behaviour)
--   lead_time_days = 0       → ships the same day even when stock is empty
--   lead_time_days = 2/5/7   → ships in N days when stock is empty (the four
--                              standard options offered in the admin form)
--
-- Any non-null value lets the storefront accept orders past stock=0 and
-- shows a distinct "La comandă · {N} zile" badge instead of "Out of stock".
-- ============================================================================

alter table public.products
  add column if not exists lead_time_days int;

comment on column public.products.lead_time_days is
  'Null = sell only from stock. 0/2/5/7 = number of days until shipment when stock_quantity = 0.';

-- Optional non-negative guard so a typo can''t make it negative.
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_lead_time_days_nonneg'
  ) then
    alter table public.products
      add constraint products_lead_time_days_nonneg
      check (lead_time_days is null or lead_time_days >= 0);
  end if;
end $$;
