-- Storage RLS policies for the two private admin-only buckets:
--   • purchase-docs    — supplier invoices uploaded out of /panel/achizitii
--   • expense-receipts — chitanțe atașate la cheltuieli
--
-- Without these policies a client-side upload (the operator's browser
-- using their authenticated cookie) gets blocked with
-- `new row violates row-level security policy`, even though they ARE
-- an admin. Service-role calls still work because they bypass RLS,
-- so the bookkeeper email path (server-side admin client) is fine —
-- only the upload from the form was broken.
--
-- Both buckets stay PRIVATE — never make them public, scans of
-- supplier invoices / receipts shouldn't be reachable by URL guess.
-- Reads happen through signed URLs minted server-side on demand.
--
-- Idempotent: drop-if-exists before each create so re-running this
-- migration is safe.

-- purchase-docs ---------------------------------------------------------

drop policy if exists "purchase_docs_admin_select" on storage.objects;
drop policy if exists "purchase_docs_admin_insert" on storage.objects;
drop policy if exists "purchase_docs_admin_update" on storage.objects;
drop policy if exists "purchase_docs_admin_delete" on storage.objects;

create policy "purchase_docs_admin_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'purchase-docs' and public.is_admin());

create policy "purchase_docs_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'purchase-docs' and public.is_admin());

create policy "purchase_docs_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'purchase-docs' and public.is_admin())
  with check (bucket_id = 'purchase-docs' and public.is_admin());

create policy "purchase_docs_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'purchase-docs' and public.is_admin());

-- expense-receipts ------------------------------------------------------

drop policy if exists "expense_receipts_admin_select" on storage.objects;
drop policy if exists "expense_receipts_admin_insert" on storage.objects;
drop policy if exists "expense_receipts_admin_update" on storage.objects;
drop policy if exists "expense_receipts_admin_delete" on storage.objects;

create policy "expense_receipts_admin_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'expense-receipts' and public.is_admin());

create policy "expense_receipts_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'expense-receipts' and public.is_admin());

create policy "expense_receipts_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'expense-receipts' and public.is_admin())
  with check (bucket_id = 'expense-receipts' and public.is_admin());

create policy "expense_receipts_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'expense-receipts' and public.is_admin());
