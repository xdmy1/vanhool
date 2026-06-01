-- Inspect cash drawer movements vs the currency of the originating order.
-- A row where order_currency='EUR' but amount has been counted as MDL is
-- inflating the drawer balance by ~20x for that single movement.

select
  m.id                                       as movement_id,
  to_char(m.occurred_at, 'YYYY-MM-DD HH24:MI') as occurred_at,
  m.direction,
  m.amount,
  m.reason,
  m.order_id,
  o.currency                                 as order_currency,
  o.total                                    as order_total,
  o.customer_name,
  case
    when m.order_id is null then 'manual / non-sale'
    when o.currency = 'MDL' then 'ok — already MDL'
    when o.currency in ('EUR','USD') then 'BUG — needs FX conversion'
    else 'unknown'
  end as verdict
from public.cash_register_movements m
left join public.orders o on o.id = m.order_id
order by m.occurred_at desc;
