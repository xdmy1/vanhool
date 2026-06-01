-- Fix IB-00015 only.
--
-- The sale was made in EUR (orders.currency='EUR', orders.total=3292.50
-- which matches the sum of the item unit prices — they're realistic EUR
-- retail prices for those bus parts). The originating order is already
-- correct; only the mirrored invoice row was backfilled with the wrong
-- currency label.
--
-- This script only flips invoices.currency MDL → EUR. The 3292.50 figure
-- stays — that's the right EUR amount. After running, /panel/facturi
-- will show IB-00015 as "3292.50 EUR".

update public.invoices
set currency   = 'EUR',
    updated_at = now()
where series = 'IB' and number = '00015';
