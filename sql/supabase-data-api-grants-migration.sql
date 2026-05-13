-- ============================================================================
-- Data API grants — preserves supabase-js / PostgREST / GraphQL access past
-- Supabase's 2026-10-30 cutoff (and survives full schema re-runs on a fresh
-- project after 2026-05-30 when implicit exposure is removed).
--
-- This file is idempotent. Run it once on the live Inter Bus project to
-- pin the current behaviour explicitly, then keep it in the repo so any
-- future schema deploy carries the grants forward.
--
-- IMPORTANT: granting `all` on a table only opens the Data API endpoint —
-- the actual row-level access is still enforced by the RLS policies in
-- supabase-schema-all.sql. Tables already have RLS enabled (verified
-- 2026-05-13) so this migration cannot accidentally expose data.
-- ============================================================================

-- 1) Schema usage — required before any table grant can be exercised.
grant usage on schema public to anon, authenticated, service_role;

-- 2) Open every existing public table to the three Supabase roles. RLS
--    policies still gate who reads / writes which rows.
grant select, insert, update, delete on all tables in schema public
  to anon, authenticated;

grant all on all tables in schema public to service_role;

-- 3) Sequences (serial / identity columns) need usage + select for inserts
--    to populate auto-increment ids when called over the Data API.
grant usage, select on all sequences in schema public
  to anon, authenticated, service_role;

-- 4) Functions — keep parity with the per-function grants already in
--    supabase-schema-all.sql but covers anything we missed or that gets
--    added later.
grant execute on all functions in schema public
  to anon, authenticated, service_role;

-- 5) Default privileges — every NEW table / sequence / function created
--    in the `public` schema after this migration runs will automatically
--    receive the same grants. Without this, the next `create table` after
--    2026-10-30 would land invisible to the Data API.
alter default privileges in schema public
  grant select, insert, update, delete on tables
  to anon, authenticated;
alter default privileges in schema public
  grant all on tables to service_role;

alter default privileges in schema public
  grant usage, select on sequences
  to anon, authenticated, service_role;

alter default privileges in schema public
  grant execute on functions
  to anon, authenticated, service_role;

-- 6) Audit trail — record when this migration was applied so a future
--    schema audit can confirm everything is locked in.
do $$ begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'app_settings') then
    insert into public.app_settings (key, value, updated_at)
    values ('data_api_grants_applied_at', now()::text, now())
    on conflict (key) do update
      set value = excluded.value, updated_at = excluded.updated_at;
  end if;
end $$;
