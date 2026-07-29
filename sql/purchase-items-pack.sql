-- ============================================================================
-- Split traceability on purchase lines
-- ----------------------------------------------------------------------------
-- When a purchased PACKAGE is split into sellable sub-units (1 butoi → 200
-- litri, 1 cutie → 12 buc), the line is rewritten to the sub-unit but we keep a
-- human-readable note of what was split so the bookkeeper sees the original
-- package on the forwarded purchase (e.g. "1 buc → 200 litri").
--
-- Idempotent — safe to paste into Supabase Studio's SQL editor more than once.
-- ============================================================================

alter table public.purchase_items
  add column if not exists pack_note text;
