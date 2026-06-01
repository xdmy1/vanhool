-- Fix IB-00015 manually.
--
-- Replace 165.00 with the actual EUR amount the customer paid. Run after
-- diagnose-ib00015.sql so you know whether the order row needs the same
-- fix or only the invoice.

-- 1) Set the invoice to the EUR amount you actually charged
update public.invoices
set
  currency = 'EUR',
  total    = 165.00,     -- <-- replace with the real EUR amount
  subtotal = 165.00,     -- <-- same number unless TVA breakdown differs
  updated_at = now()
where series = 'IB' and number = '00015';

-- 2) Mirror the same correction onto the originating order so totals
--    reconcile everywhere the order row is read (dashboard, reports, etc.)
update public.orders o
set
  currency = 'EUR',
  total    = 165.00,
  subtotal = 165.00,
  updated_at = now()
from public.invoices i
where i.series = 'IB'
  and i.number = '00015'
  and i.order_id = o.id;
