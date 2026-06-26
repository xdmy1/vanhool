-- List every order tagged currency='EUR' so we can audit which ones are
-- legitimately EUR sales vs. which were entered as MDL but got the wrong
-- label (same root cause as the IB-00015 mismatch).
--
-- Sort by total DESC so the suspicious outliers float to the top — a
-- typical EUR sale is one to a few hundred EUR; anything in the
-- thousands per single line item is worth a second look.

select
  o.id                                          as order_id,
  to_char(o.created_at, 'YYYY-MM-DD HH24:MI')   as created,
  o.source,
  o.account_scope,
  o.status,
  o.currency,
  o.total,
  o.customer_name,
  o.customer_email,
  i.series || '-' || i.number                   as invoice_no
from public.orders o
left join public.invoices i on i.order_id = o.id
where o.currency = 'EUR'
order by o.total desc nulls last;
