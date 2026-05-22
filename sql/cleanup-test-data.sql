-- =============================================================================
-- One-shot cleanup: drop two test purchases (8601124, 2600660) plus every
-- order/invoice/delivery-note/cash-movement that belongs to the customer
-- "Bobernaga Damian". Read the preflight output before running the DELETE
-- block; commit only when the counts look right.
-- =============================================================================

-- ---------- PREFLIGHT ----------
-- A. Test purchases (and their line items)
select 'purchases' as kind, id::text as ref, document_number, total::text as info
  from public.purchases
  where document_number in ('8601124', '2600660')
union all
select 'purchase_items', pi.id::text, pu.document_number, pi.description
  from public.purchase_items pi
  join public.purchases pu on pu.id = pi.purchase_id
  where pu.document_number in ('8601124', '2600660');

-- B. Bobernaga Damian's footprint
with t_orders as (
  select id from public.orders
   where customer_name ilike '%Bobernaga Damian%'
      or customer_email ilike '%bobernaga%'
      or user_id in (
        select id from public.profiles
         where full_name ilike '%Bobernaga Damian%'
            or email ilike '%bobernaga%'
      )
),
t_invoices as (
  select id from public.invoices
   where order_id in (select id from t_orders)
      or customer_snapshot->>'name' ilike '%Bobernaga Damian%'
)
select 'orders'        as kind, count(*) from t_orders
union all select 'invoices',       count(*) from t_invoices
union all select 'delivery_notes', count(*) from public.delivery_notes
                                   where order_id in (select id from t_orders)
union all select 'cash_movements', count(*) from public.cash_register_movements
                                   where order_id in (select id from t_orders);

-- ---------- DELETE (commit only after the preflight looks right) ----------
begin;

-- 1. Bobernaga Damian — children before parents.
with t_orders as (
  select id from public.orders
   where customer_name ilike '%Bobernaga Damian%'
      or customer_email ilike '%bobernaga%'
      or user_id in (
        select id from public.profiles
         where full_name ilike '%Bobernaga Damian%'
            or email ilike '%bobernaga%'
      )
)
delete from public.cash_register_movements
 where order_id in (select id from t_orders);

with t_orders as (
  select id from public.orders
   where customer_name ilike '%Bobernaga Damian%'
      or customer_email ilike '%bobernaga%'
      or user_id in (
        select id from public.profiles
         where full_name ilike '%Bobernaga Damian%'
            or email ilike '%bobernaga%'
      )
)
delete from public.delivery_notes
 where order_id in (select id from t_orders);

-- Invoices: by order link OR by name on the customer_snapshot. Clear the
-- proforma↔invoice cross-links first so they don't block FK deletes.
update public.invoices
   set converted_to_invoice_id = null
 where converted_to_invoice_id in (
   select id from public.invoices
    where order_id in (
            select id from public.orders
             where customer_name ilike '%Bobernaga Damian%'
                or customer_email ilike '%bobernaga%'
                or user_id in (
                  select id from public.profiles
                   where full_name ilike '%Bobernaga Damian%'
                      or email ilike '%bobernaga%'
                )
          )
       or customer_snapshot->>'name' ilike '%Bobernaga Damian%'
 );

with t_orders as (
  select id from public.orders
   where customer_name ilike '%Bobernaga Damian%'
      or customer_email ilike '%bobernaga%'
      or user_id in (
        select id from public.profiles
         where full_name ilike '%Bobernaga Damian%'
            or email ilike '%bobernaga%'
      )
)
delete from public.invoices
 where order_id in (select id from t_orders)
    or customer_snapshot->>'name' ilike '%Bobernaga Damian%';

delete from public.orders
 where customer_name ilike '%Bobernaga Damian%'
    or customer_email ilike '%bobernaga%'
    or user_id in (
      select id from public.profiles
       where full_name ilike '%Bobernaga Damian%'
          or email ilike '%bobernaga%'
    );

-- 2. The two test purchases. purchase_items uses ON DELETE CASCADE in the
-- migration but we delete explicitly first to be safe.
delete from public.purchase_items
 where purchase_id in (
   select id from public.purchases
    where document_number in ('8601124', '2600660')
 );

delete from public.purchases
 where document_number in ('8601124', '2600660');

-- If you're happy with the row counts above, commit. Otherwise rollback.
commit;
-- rollback;
