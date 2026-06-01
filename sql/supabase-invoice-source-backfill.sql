-- ============================================================================
-- Backfill panel sales into the invoices table.
--
-- Background: `createManualSale` started writing rows to `public.invoices`
-- only after a later refactor — every sale created BEFORE that change exists
-- only as an `orders` row (with source='panel'). The operator can't see those
-- sales under /panel/facturi.
--
-- This migration:
--   1) Adds a `source` column on invoices so we can tell apart rows that
--      were mirrored from a panel sale (`sale`), proper invoices issued
--      directly (`invoice`), or invoices that came from converting a
--      proforma (`proforma_conv`).
--   2) Mirrors every `orders` row with source='panel' that doesn't yet
--      have a matching invoice — generating sequential numbers from the
--      `panel_settings("invoice.next_number")` counter so we don't clash
--      with future invoices.
--   3) Bumps that counter by the number of rows backfilled.
--
-- Idempotent: the SELECT inside the INSERT uses `not exists`, so re-running
-- inserts zero rows and the counter bump becomes a +0 no-op.
-- ============================================================================

-- 1) Source column + check constraint -----------------------------------------
alter table public.invoices
  add column if not exists source text not null default 'invoice';

do $$ begin
  alter table public.invoices
    add constraint invoices_source_check
    check (source in ('invoice','sale','proforma_conv','manual'));
exception when duplicate_object then null; end $$;

create index if not exists invoices_source_idx on public.invoices (source);

-- 2) Backfill missing rows ----------------------------------------------------
do $$
declare
  start_num int;
  series_val text;
  inserted_count int;
begin
  -- Read current counter + series from panel_settings (with sane defaults so
  -- this works on a fresh install where the keys haven't been seeded yet).
  select coalesce((value::text)::int, 1)
    into start_num
    from public.panel_settings
    where key = 'invoice.next_number';
  if start_num is null then start_num := 1; end if;

  select coalesce(replace(value::text, '"', ''), 'IB')
    into series_val
    from public.panel_settings
    where key = 'invoice.series';
  if series_val is null then series_val := 'IB'; end if;

  -- Mirror each legacy panel order into invoices, assigning sequential
  -- numbers from `start_num`. row_number() guarantees uniqueness within the
  -- batch; the unique-ish (series, number) pair across the whole table is
  -- not strictly enforced, so this stays compatible with existing rows.
  with legacy as (
    select
      o.id                                    as order_id,
      o.account_scope,
      o.customer_name,
      o.customer_email,
      o.customer_phone,
      o.customer_address,
      o.items,
      coalesce(o.subtotal, 0)                 as subtotal,
      coalesce(o.total, 0)                    as total,
      o.status                                as order_status,
      o.payment_method,
      o.created_at,
      row_number() over (order by o.created_at) - 1 as rn
    from public.orders o
    where o.source = 'panel'
      and not exists (
        select 1 from public.invoices i where i.order_id = o.id
      )
  )
  insert into public.invoices (
    order_id, account_scope, type, series, number,
    issued_date, paid_at, currency,
    customer_snapshot, items_snapshot,
    subtotal, vat_amount, total,
    status, source, created_at, updated_at
  )
  select
    l.order_id,
    l.account_scope,
    'invoice',
    series_val,
    lpad((start_num + l.rn)::text, 5, '0'),
    l.created_at::date,
    case
      when l.payment_method = 'already_paid' or l.order_status = 'delivered'
        then l.created_at
      else null
    end,
    'MDL',
    jsonb_build_object(
      'name',    l.customer_name,
      'email',   l.customer_email,
      'phone',   l.customer_phone,
      'address', l.customer_address
    ),
    coalesce(l.items, '[]'::jsonb),
    l.subtotal,
    0,
    l.total,
    case
      when l.payment_method = 'already_paid' or l.order_status = 'delivered'
        then 'paid'
      else 'issued'
    end,
    'sale',
    l.created_at,
    l.created_at
  from legacy l;

  get diagnostics inserted_count = row_count;

  -- 3) Bump the counter so future invoices don't reuse the backfilled numbers.
  if inserted_count > 0 then
    insert into public.panel_settings (key, value, updated_at)
    values (
      'invoice.next_number',
      to_jsonb(start_num + inserted_count),
      now()
    )
    on conflict (key) do update
      set value = excluded.value, updated_at = excluded.updated_at;

    raise notice 'Backfilled % panel sales into invoices (starting at #%)',
      inserted_count, lpad(start_num::text, 5, '0');
  else
    raise notice 'No panel sales to backfill.';
  end if;
end $$;
