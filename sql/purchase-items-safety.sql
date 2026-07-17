-- ============================================================================
-- Purchase line-item safety net: reversible deletes + edit audit
-- ----------------------------------------------------------------------------
-- Context: editing an achiziție used to delete every line before re-inserting
-- the new set (non-transactional). A rejected insert left the document with a
-- total but zero lines, unrecoverably (see purchase d4886450, wiped 2026-07-16).
--
-- The app code now (a) inserts new lines BEFORE deleting old ones, so a failed
-- save can no longer lose data, and (b) snapshots lines into the archive below
-- before any replace/delete. This migration adds the two pieces of storage that
-- back that behaviour. Nothing here changes how purchase_items is READ, so it
-- cannot introduce "ghost" lines anywhere (stock, totals, bookkeeper emails).
--
-- Idempotent — safe to paste into Supabase Studio's SQL editor more than once.
-- ============================================================================

-- 1) Who last edited a purchase (companion to the existing created_by).
alter table public.purchases
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

-- 2) Archive of removed / replaced purchase lines.
--    A plain snapshot with NO foreign key to purchases, so it survives even a
--    hard-deleted purchase and can always be read back for recovery.
create table if not exists public.purchase_items_archive (
  archive_id      uuid primary key default gen_random_uuid(),
  id              uuid,            -- original purchase_items.id
  purchase_id     uuid,           -- original purchase (may no longer exist)
  product_id      uuid,
  supplier_code   text,
  internal_code   text,
  description     text,
  quantity        numeric(12,3),
  unit_cost       numeric(12,2),
  vat_rate        numeric(5,2),
  line_total      numeric(12,2),
  add_to_catalog  boolean,
  item_created_at timestamptz,    -- original purchase_items.created_at
  archived_at     timestamptz not null default now(),
  archived_by     uuid references auth.users(id) on delete set null,
  archive_reason  text            -- 'update_replace' | 'purchase_delete'
);

create index if not exists purchase_items_archive_purchase_idx
  on public.purchase_items_archive (purchase_id);
create index if not exists purchase_items_archive_archived_at_idx
  on public.purchase_items_archive (archived_at desc);

-- Server-only audit store: enable RLS with no policies so it is reachable ONLY
-- through the service-role client the panel actions use. No browser/anon path.
alter table public.purchase_items_archive enable row level security;
