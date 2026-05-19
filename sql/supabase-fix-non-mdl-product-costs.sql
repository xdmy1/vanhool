-- =============================================================================
-- Fix products auto-created (or prefilled) from non-MDL purchases before the
-- EUR→MDL conversion fix landed (commits 1fb99be / ffd96e9 / 20fcce9).
--
-- Symptom: a 155 EUR purchase line landed on the product as cost_price=155
-- and price=201.50 (= 155 × 1.3) instead of cost_price=3100, price=4030
-- (= 155 × 20 × 1.3) — so the sale wizard showed a tenth of the real price.
--
-- Strategy: for every product linked to a purchase line whose purchase is
-- in EUR or USD, recompute cost_price/price using the purchase's explicit
-- fx_rate, else fall back to the fixed reference table (EUR=20, USD=17).
-- The `abs(p.cost_price - pi.unit_cost) < 0.01` guard skips products whose
-- cost has already been adjusted manually or correctly converted, so this
-- script is idempotent and safe to re-run.
-- =============================================================================

-- Pre-flight: list everything that would change.
select
  p.id as product_id,
  p.part_code,
  p.name_ro,
  p.cost_price as cost_current,
  round((pi.unit_cost *
    coalesce(pu.fx_rate, case pu.currency when 'EUR' then 20 when 'USD' then 17 else 1 end)
  )::numeric, 2) as cost_new,
  pu.document_number,
  pu.currency,
  pu.fx_rate
from purchase_items pi
join purchases pu on pu.id = pi.purchase_id
join products p on p.id = pi.product_id
where pu.currency in ('EUR', 'USD')
  and abs(coalesce(p.cost_price, 0) - pi.unit_cost) < 0.01;

-- Apply the fix.
with bad as (
  select
    pi.product_id,
    pi.unit_cost as src_cost,
    coalesce(
      pu.fx_rate,
      case pu.currency when 'EUR' then 20 when 'USD' then 17 else 1 end
    ) as rate
  from purchase_items pi
  join purchases pu on pu.id = pi.purchase_id
  where pi.product_id is not null
    and pu.currency in ('EUR', 'USD')
)
update products p
set
  cost_price = round((b.src_cost * b.rate)::numeric, 2),
  price = round((b.src_cost * b.rate * 1.3)::numeric, 2)
from bad b
where p.id = b.product_id
  and abs(coalesce(p.cost_price, 0) - b.src_cost) < 0.01;
