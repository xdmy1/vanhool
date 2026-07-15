-- Fix the cross-linked codes in purchase lot 2601317 (doc EUR, fx 20).
--
-- Root cause: a duplicate code was entered, so on posting one line linked to
-- the WRONG product:
--   line internal_code 10722097 (25 €)  -> linked to product part_code 11466108  (WRONG)
--   line internal_code 11466108 (3.9 €) -> left UNLINKED
--   no product with part_code 10722097 exists
-- Consequences: wrong cost (500 MDL instead of 78), doubled stock, part 10722097
-- not findable in Vânzare nouă.
--
-- This ONLY touches these two lines/products in this one lot.
--
-- RUN ONLY AFTER you stop editing this purchase in the panel, and run step 0
-- (preview) FIRST to confirm it still matches reality before the UPDATEs.

-- Lot + product ids (verified at diagnosis time):
--   purchase_id                       = 8b48b014-1853-4c47-915f-1f76af02a7a9
--   product for part 11466108 (exists)= fddc81fb-2af7-4a1c-b391-320e6307e667

-- ── 0. PREVIEW — confirm the cross-link is still present ─────────────────────
select pi.internal_code, pi.supplier_code, pi.quantity, pi.unit_cost,
       p.part_code as currently_linked_to
  from public.purchase_items pi
  left join public.products p on p.id = pi.product_id
 where pi.purchase_id = '8b48b014-1853-4c47-915f-1f76af02a7a9'
 order by pi.internal_code;

-- ── 1. Create the missing product for part 10722097 ─────────────────────────
--    Cost = 25 € × 20 = 500 MDL (0% VAT on this doc). Stock 1 (the line qty).
--    Kept internal (is_active=false, internal_only=true) like the rest of the lot.
insert into public.products (part_code, supplier_code, name_ro, slug, price, cost_price, stock_quantity, is_active, internal_only)
select '10722097', '1607984',
       coalesce(nullif(pi.description, ''), '10722097'),
       '10722097-' || left(pi.id::text, 6),
       round(500 * 1.30, 2),  -- default 30% markup; adjust later if needed
       500, 1, false, true
  from public.purchase_items pi
 where pi.purchase_id = '8b48b014-1853-4c47-915f-1f76af02a7a9'
   and pi.internal_code = '10722097'
   and not exists (select 1 from public.products where part_code = '10722097')
 limit 1;

-- ── 2. Re-link the two lines to the correct products ────────────────────────
--    line 10722097 -> the product part_code 10722097 (just created / existing)
update public.purchase_items pi
   set product_id = (select id from public.products where part_code = '10722097' limit 1)
 where pi.purchase_id = '8b48b014-1853-4c47-915f-1f76af02a7a9'
   and pi.internal_code = '10722097';

--    line 11466108 -> product fddc81fb (part_code 11466108)
update public.purchase_items pi
   set product_id = 'fddc81fb-2af7-4a1c-b391-320e6307e667'
 where pi.purchase_id = '8b48b014-1853-4c47-915f-1f76af02a7a9'
   and pi.internal_code = '11466108';

-- ── 3. Set the correct cost + stock on product 11466108 ─────────────────────
--    Its real line is 11466108 = 3.9 € × 20 = 78 MDL, qty 1.
--    (Only run if this lot is the sole source and no sale has moved stock yet —
--     otherwise adjust stock_quantity to the real count on hand.)
update public.products
   set cost_price = 78,
       stock_quantity = 1,
       supplier_code = '2500100'
 where id = 'fddc81fb-2af7-4a1c-b391-320e6307e667';

-- ── 4. Verify ───────────────────────────────────────────────────────────────
select p.part_code, p.supplier_code, p.cost_price, p.stock_quantity, p.is_active
  from public.products p
 where p.part_code in ('10722097', '11466108')
 order by p.part_code;
