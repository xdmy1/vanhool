-- ============================================================================
-- STOCK ACCURACY OVERHAUL — the single source of truth for every stock move
-- ----------------------------------------------------------------------------
-- Problem this solves: every stock write in the app was a JS read-then-write
-- ("read 5, write 5-3"), many clamped at zero, and each feature (achiziții,
-- vânzare, proformă→factură, retur, anulare) invented its own restore logic.
-- The combination manufactured phantom stock and lost real stock.
--
-- The fix is one mechanism:
--   • `stock_movements` — an append-only ledger. Every stock change is a row
--     with a UNIQUE `ref`. Re-running the same operation (double-click, retry,
--     concurrent tab) hits the unique index and becomes a no-op.
--   • `apply_stock_movement()` — the ONLY way the app changes stock. It inserts
--     the ledger row and bumps products.stock_quantity by delta in ONE
--     transaction, using an atomic `stock = stock + delta` update (no lost
--     updates, no clamp — stock may go negative, because negative stock is a
--     true signal of oversell, while clamping fabricates stock on the reverse).
--   • `set_stock_absolute()` — for the product form's manual stock field. Locks
--     the row, computes the delta, records it in the ledger, sets the value.
--
-- Reversals (anulare comandă / void factură / anulare achiziție) are computed
-- FROM the ledger: they reverse what actually happened, never what the code
-- guesses should have happened.
--
-- Idempotent — safe to paste into Supabase Studio's SQL editor more than once.
-- RUN THIS BEFORE DEPLOYING THE MATCHING APP CODE.
--
-- NOTE for manual fixes from Supabase Studio: the SQL editor runs as role
-- `postgres` (no JWT), so the two functions below reject it by design. A
-- manual correction must insert the stock_movements row AND update
-- products.stock_quantity yourself, in one transaction.
-- ============================================================================

-- 0) Preconditions — fail LOUDLY with instructions instead of half-installing.
do $$
declare
  v_type text;
begin
  select data_type into v_type
    from information_schema.columns
   where table_schema = 'public' and table_name = 'products'
     and column_name = 'stock_quantity';
  if v_type is distinct from 'numeric' then
    raise exception 'PRECONDIȚIE: rulează întâi sql/units-of-measure-migration.sql — products.stock_quantity trebuie să fie numeric(12,3), este %', coalesce(v_type, 'lipsă');
  end if;
  if to_regclass('public.purchase_items_archive') is null then
    raise exception 'PRECONDIȚIE: rulează întâi sql/purchase-items-safety.sql — lipsește purchase_items_archive';
  end if;
  if to_regclass('public.panel_settings') is null then
    raise exception 'PRECONDIȚIE: rulează întâi sql/supabase-panel-migration.sql — lipsește panel_settings';
  end if;
end $$;

-- 1) The ledger --------------------------------------------------------------
create table if not exists public.stock_movements (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  -- numeric(12,3) mirrors products.stock_quantity (litri/metri keep decimals)
  delta       numeric(12,3) not null,
  reason      text not null,
  -- Deterministic idempotency key, e.g. 'purchase_post:<purchase_item_id>',
  -- 'sale:<order_id>:<product_id>'. UNIQUE = the same physical event can
  -- never move stock twice.
  ref         text not null unique,
  -- Denormalized backlinks (plain uuids, NO FKs on purpose: the ledger must
  -- survive hard-deletes of the documents it describes).
  order_id    uuid,
  purchase_id uuid,
  invoice_id  uuid,
  return_id   uuid,
  note        text,
  created_by  uuid,
  created_at  timestamptz not null default now()
);

create index if not exists stock_movements_product_idx  on public.stock_movements (product_id);
create index if not exists stock_movements_order_idx    on public.stock_movements (order_id) where order_id is not null;
create index if not exists stock_movements_purchase_idx on public.stock_movements (purchase_id) where purchase_id is not null;

alter table public.stock_movements enable row level security;
drop policy if exists stock_movements_read on public.stock_movements;
-- Admin-only read: customers must not see sales volumes / purchase history.
create policy stock_movements_read on public.stock_movements
  for select to authenticated using (public.is_admin());
grant select on public.stock_movements to authenticated, service_role;
-- What blocks client writes is RLS (enabled, SELECT-only policy → no path for
-- insert/update/delete), not the absence of grants — Supabase's default
-- privileges may have granted table rights at creation, so revoke explicitly.
revoke insert, update, delete on public.stock_movements from anon, authenticated;

-- The ledger epoch: the moment this migration first ran. Documents created
-- BEFORE it may have moved stock off-ledger (legacy snapshot restores are
-- allowed for them, once); documents created after it are ledger-only — zero
-- movements on a post-epoch document means zero stock was taken, full stop.
insert into public.panel_settings (key, value)
select 'stock.ledger_epoch', to_jsonb(now())
where not exists (
  select 1 from public.panel_settings where key = 'stock.ledger_epoch'
);

-- 2) The one true stock write ------------------------------------------------
create or replace function public.apply_stock_movement(
  p_product_id uuid,
  p_delta      numeric,
  p_reason     text,
  p_ref        text,
  p_order_id    uuid default null,
  p_purchase_id uuid default null,
  p_invoice_id  uuid default null,
  p_return_id   uuid default null,
  p_note        text default null,
  p_created_by  uuid default null
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SECURITY DEFINER bypasses the products RLS, so gate it HERE: only panel
  -- admins and the service-role backend may move stock. Without this check,
  -- any authenticated B2B customer could rewrite inventory via a raw RPC call.
  if not (coalesce(auth.role(), '') = 'service_role' or public.is_admin()) then
    raise exception 'stock_ledger: forbidden';
  end if;

  if p_product_id is null or coalesce(length(trim(p_ref)), 0) = 0 then
    return false;
  end if;
  if not exists (select 1 from products where id = p_product_id) then
    return false;
  end if;

  insert into stock_movements
    (product_id, delta, reason, ref, order_id, purchase_id, invoice_id, return_id, note, created_by)
  values
    (p_product_id, round(coalesce(p_delta, 0), 3), coalesce(p_reason, 'adjust'), p_ref,
     p_order_id, p_purchase_id, p_invoice_id, p_return_id, p_note, p_created_by)
  on conflict (ref) do nothing;

  if not found then
    return false; -- this exact event already moved stock; no-op
  end if;

  -- Atomic increment: no read-then-write, no clamp. Negative stock is allowed
  -- and MEANT to be visible — it says "we sold what the system didn't have".
  -- Same rounding as the ledger row, so ledger Σ and cached stock never drift.
  update products
     set stock_quantity = round(coalesce(stock_quantity, 0) + round(coalesce(p_delta, 0), 3), 3)
   where id = p_product_id;

  return true;
end;
$$;

revoke all on function public.apply_stock_movement(uuid, numeric, text, text, uuid, uuid, uuid, uuid, text, uuid) from public;
grant execute on function public.apply_stock_movement(uuid, numeric, text, text, uuid, uuid, uuid, uuid, text, uuid)
  to authenticated, service_role;

-- 3) Manual absolute set (product form's stock field) ------------------------
create or replace function public.set_stock_absolute(
  p_product_id uuid,
  p_quantity   numeric,
  p_reason     text,
  p_ref        text,
  p_created_by uuid default null
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cur   numeric;
  v_delta numeric;
begin
  -- Same admin/service gate as apply_stock_movement — see the comment there.
  if not (coalesce(auth.role(), '') = 'service_role' or public.is_admin()) then
    raise exception 'stock_ledger: forbidden';
  end if;

  if p_product_id is null or coalesce(length(trim(p_ref)), 0) = 0 then
    return false;
  end if;

  select stock_quantity into v_cur from products where id = p_product_id for update;
  if not found then
    return false;
  end if;

  v_delta := round(coalesce(p_quantity, 0) - coalesce(v_cur, 0), 3);
  if v_delta = 0 then
    return true; -- nothing to change; still a success for the caller
  end if;

  insert into stock_movements (product_id, delta, reason, ref, note, created_by)
  values (p_product_id, v_delta, coalesce(p_reason, 'manual_adjust'), p_ref,
          'set ' || coalesce(v_cur, 0)::text || ' -> ' || coalesce(p_quantity, 0)::text,
          p_created_by)
  on conflict (ref) do nothing;

  if not found then
    return false;
  end if;

  update products
     set stock_quantity = round(coalesce(p_quantity, 0), 3)
   where id = p_product_id;

  return true;
end;
$$;

revoke all on function public.set_stock_absolute(uuid, numeric, text, text, uuid) from public;
grant execute on function public.set_stock_absolute(uuid, numeric, text, text, uuid)
  to authenticated, service_role;

-- 4) search_codes must also index products.supplier_code ---------------------
-- The normalized resolver (restock matching) reads search_codes; a product
-- created in the admin with only supplier_code set was invisible to it, so a
-- restock could still mint a duplicate. Add the missing branch + backfill.
create or replace function public.products_rebuild_search_codes()
returns trigger
language plpgsql
as $$
declare
    codes text[] := '{}';
    extracted text[];
begin
    if new.part_code is not null and length(trim(new.part_code)) > 0 then
        codes := array_append(codes, public.normalize_code(new.part_code));
    end if;

    if new.supplier_code is not null and length(trim(new.supplier_code)) > 0 then
        codes := array_append(codes, public.normalize_code(new.supplier_code));
    end if;

    if new.barcode is not null and length(trim(new.barcode)) > 0 then
        codes := array_append(codes, public.normalize_code(new.barcode));
    end if;

    if new.oem_codes is not null and array_length(new.oem_codes, 1) is not null then
        select array_agg(public.normalize_code(c))
            into extracted
            from unnest(new.oem_codes) as c
            where c is not null and length(trim(c)) > 0;
        if extracted is not null then
            codes := codes || extracted;
        end if;
    end if;

    if new.cross_references is not null
       and jsonb_typeof(new.cross_references) = 'array' then
        select array_agg(public.normalize_code(elem->>'code'))
            into extracted
            from jsonb_array_elements(new.cross_references) as elem
            where elem ? 'code'
              and length(trim(coalesce(elem->>'code',''))) > 0;
        if extracted is not null then
            codes := codes || extracted;
        end if;
    end if;

    new.search_codes := (
        select coalesce(array_agg(distinct c), '{}'::text[])
        from unnest(codes) as c
        where c is not null and length(c) > 0
    );

    return new;
end;
$$;

-- Trigger already exists (supabase-product-codes-migration.sql); replacing the
-- function above is enough. Backfill so existing rows pick up supplier_code:
update public.products set search_codes = search_codes;

-- 5) Archive keeps unit + pack_note ------------------------------------------
-- A restored split line ("1 butoi -> 200 litri") must come back as litri, not
-- as "buc", and the split trace must survive the archive round-trip.
alter table public.purchase_items_archive add column if not exists unit text;
alter table public.purchase_items_archive add column if not exists pack_note text;

-- 6) Retire the legacy Odoo absolute stock setter ----------------------------
-- Odoo is gone; an absolute setter that bypasses the ledger must not survive.
drop function if exists public.set_stock_from_odoo(integer, numeric);
