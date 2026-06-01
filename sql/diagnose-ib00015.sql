-- Inspect what's actually stored for IB-00015 — answers whether the EUR
-- selection from the wizard ever reached the database, or whether the
-- 3292.50 figure was committed as MDL from the start.

select
  i.series || '-' || i.number  as invoice_no,
  i.currency                    as invoice_currency,
  i.total                       as invoice_total,
  i.subtotal                    as invoice_subtotal,
  i.created_at                  as invoice_created,
  o.id                          as order_id,
  o.currency                    as order_currency,
  o.total                       as order_total,
  o.subtotal                    as order_subtotal,
  o.items                       as order_items
from public.invoices i
left join public.orders o on o.id = i.order_id
where i.series = 'IB' and i.number = '00015';
