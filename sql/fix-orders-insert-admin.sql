-- =============================================================================
-- Let admins insert orders on behalf of any customer from the panel sale
-- wizard. The original policy only allowed user_id IS NULL (guest checkout)
-- or user_id = auth.uid() (customer placing their own order), so panel
-- sales against an existing client tripped RLS: "new row violates row-level
-- security policy for table orders".
-- Idempotent — drop+create.
-- =============================================================================

drop policy if exists "orders_insert_self_or_guest" on public.orders;
create policy "orders_insert_self_or_guest" on public.orders
    for insert
    with check (
      user_id is null
      or user_id = auth.uid()
      or public.is_admin()
    );
