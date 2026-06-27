-- Backfill products.cost_price to GROSS (what actually came out of
-- the bank account = unit_cost × (1 + vat_rate/100)).
--
-- Before this backfill, postPurchase wrote the NET unit_cost as
-- products.cost_price. Margin calculations on proforma/invoice +
-- the +30% / -15% markup shortcuts therefore computed against the
-- wrong base for any part with TVA — a 1000-net VAT-20 part shows
-- "cost 1000" when the real cash out was 1200. Operator's exact
-- quote: "piesa cu TVA ne-a costat 1200 nu 1000".
--
-- This statement multiplies cost_price by the vat factor from the
-- product's MOST RECENT purchase_item row (DISTINCT ON keeps the
-- newest per product_id). Products that have never been linked to a
-- purchase, or whose latest purchase had vat_rate=0, are left
-- untouched.
--
-- IDEMPOTENT — re-running is safe in the sense that it will multiply
-- AGAIN, doubling. ONLY RUN ONCE. If you suspect partial application,
-- DON'T re-run. Verify with the diagnostic query at the bottom first.
--
-- Run in Supabase Studio SQL editor.

begin;

with latest_purchase_item as (
  select distinct on (product_id)
    product_id,
    vat_rate
  from public.purchase_items
  where product_id is not null
  order by product_id, created_at desc
)
update public.products p
set cost_price = round((p.cost_price * (1 + lpi.vat_rate / 100.0))::numeric, 2)
from latest_purchase_item lpi
where p.id = lpi.product_id
  and p.cost_price is not null
  and lpi.vat_rate > 0;

commit;

-- Sanity check — run AFTER the UPDATE to see how many products were
-- touched and what the new vs old spread looks like:
--
-- select count(*) as products_with_vat_purchases
-- from public.products p
-- join (
--   select distinct on (product_id) product_id, vat_rate
--   from public.purchase_items
--   where product_id is not null
--   order by product_id, created_at desc
-- ) lpi on lpi.product_id = p.id
-- where lpi.vat_rate > 0;
