-- ============================================================================
-- Accountant "Introdus" (entered) state for invoices + purchases.
-- Paste into Supabase Studio SQL editor. IDEMPOTENT — safe to re-run.
--
-- When the operator sends a factură/proformă or achiziție to the bookkeeper,
-- the email carries a signed "Marchează ca INTRODUS" button. Clicking it stamps
-- accountant_entered_at, which the panel shows as INTRODUS (vs NEINTRODUS while
-- only sent). accountant_sent_at (the "TRIMIS" stamp) already exists.
-- ============================================================================

alter table public.invoices
  add column if not exists accountant_entered_at timestamptz;

alter table public.purchases
  add column if not exists accountant_entered_at timestamptz;
