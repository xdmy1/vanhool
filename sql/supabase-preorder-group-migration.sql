-- ============================================================================
-- Multi-item preorders.
--
-- The existing `preorders` table holds one row per part. To support a single
-- preorder request that covers several parts (the common case once a customer
-- asks for "everything for the next service"), we introduce an optional
-- group identifier: every row created from the same multi-item form
-- submission shares the same UUID.
--
-- The column is nullable so legacy single-part rows stay valid without
-- backfill. Listing code can later GROUP BY preorder_group_id to collapse a
-- batch into a single visible card.
-- ============================================================================

alter table public.preorders
  add column if not exists preorder_group_id uuid;

create index if not exists preorders_group_id_idx
  on public.preorders (preorder_group_id);

-- Also track when the operator manually fires the "receipt" email
-- ("cererea ta a fost înregistrată, te contactăm cu prețul"). Kept
-- separate from confirmation_sent_at so we can offer BOTH a receipt
-- email (right after creation) and a confirmation email (once price
-- + ETA are locked in) without one overwriting the other.
alter table public.preorders
  add column if not exists receipt_sent_at timestamptz;
