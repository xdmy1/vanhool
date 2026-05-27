-- =============================================================================
-- Wipe four test delivery notes (FL-00004..FL-00007) and everything wired to
-- them: the originating orders, any fiscal invoice, cash inflow, and restore
-- the decremented stock from each order's items snapshot. Read the preflight
-- output first; commit only when the counts look right.
-- =============================================================================

-- ---------- PREFLIGHT ----------
-- Notes + their orders.
select dn.id as note_id, dn.series, dn.number, dn.status,
       dn.customer_name, dn.order_id
  from public.delivery_notes dn
  where dn.number in ('00004', '00005', '00006', '00007')
    and dn.series = 'FL'
  order by dn.number;

-- Counts of dependents.
with t as (
  select order_id, id as note_id
    from public.delivery_notes
   where number in ('00004', '00005', '00006', '00007') and series = 'FL'
)
select 'delivery_notes' as kind, count(*) from t
union all select 'orders',        count(*) from public.orders        where id in (select order_id from t where order_id is not null)
union all select 'invoices',      count(*) from public.invoices      where order_id in (select order_id from t where order_id is not null)
union all select 'cash_movements',count(*) from public.cash_register_movements where order_id in (select order_id from t where order_id is not null);

-- ---------- APPLY ----------
begin;

-- 1. Restore stock from each order's items snapshot.
do $$
declare
  o record;
  it jsonb;
  pid uuid;
  qty numeric;
begin
  for o in
    select o.id as order_id, o.items
      from public.orders o
      where o.id in (
        select order_id from public.delivery_notes
         where number in ('00004', '00005', '00006', '00007') and series = 'FL'
           and order_id is not null
      )
  loop
    for it in select * from jsonb_array_elements(coalesce(o.items, '[]'::jsonb))
    loop
      pid := nullif(it->>'productId', '')::uuid;
      qty := coalesce((it->>'quantity')::numeric, 0);
      if pid is null or qty <= 0 then continue; end if;
      update public.products
         set stock_quantity = coalesce(stock_quantity, 0) + qty
       where id = pid;
    end loop;
  end loop;
end $$;

-- 2. Delete dependents (cash → invoices → delivery_notes → orders).
delete from public.cash_register_movements
 where order_id in (
   select order_id from public.delivery_notes
    where number in ('00004', '00005', '00006', '00007') and series = 'FL'
      and order_id is not null
 );

-- Clear proforma → invoice cross-links that would block invoice deletes.
update public.invoices
   set converted_to_invoice_id = null
 where converted_to_invoice_id in (
   select id from public.invoices
    where order_id in (
      select order_id from public.delivery_notes
       where number in ('00004', '00005', '00006', '00007') and series = 'FL'
         and order_id is not null
    )
 );

delete from public.invoices
 where order_id in (
   select order_id from public.delivery_notes
    where number in ('00004', '00005', '00006', '00007') and series = 'FL'
      and order_id is not null
 );

-- Capture the order ids before we wipe the notes, then delete notes.
create temp table _o_ids as
  select distinct order_id
    from public.delivery_notes
   where number in ('00004', '00005', '00006', '00007') and series = 'FL'
     and order_id is not null;

delete from public.delivery_notes
 where number in ('00004', '00005', '00006', '00007') and series = 'FL';

delete from public.orders
 where id in (select order_id from _o_ids);

drop table _o_ids;

commit;
-- rollback;
