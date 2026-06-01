-- =============================================================================
-- Backfill invoices for orders that never got one (e.g. conta2 panel sales
-- before the "always-mirror" fix). One invoice per order, status follows the
-- order's payment method, currency carries through, numbers come from the
-- next free slot in the existing M-series. Idempotent: skips orders that
-- already have an invoice attached.
-- =============================================================================

do $$
declare
  o record;
  next_num integer;
  series_prefix text := 'M';
begin
  -- Resume numbering from the highest existing M-series invoice number.
  select coalesce(max(nullif(number, '')::int), 0) + 1
    into next_num
    from public.invoices
    where series = series_prefix;

  for o in
    select id, account_scope, currency, customer_name, customer_email,
           customer_phone, customer_address, items, subtotal, total,
           payment_method, created_at, user_id
      from public.orders o
      where not exists (select 1 from public.invoices i where i.order_id = o.id)
      order by created_at asc
  loop
    insert into public.invoices (
      order_id, account_scope, type, series, number, issued_date,
      paid_at, currency, customer_snapshot, items_snapshot,
      subtotal, vat_amount, total, status
    ) values (
      o.id,
      o.account_scope,
      'invoice',
      series_prefix,
      lpad(next_num::text, 5, '0'),
      o.created_at::date,
      case when o.payment_method = 'already_paid' then o.created_at else null end,
      coalesce(o.currency, 'MDL'),
      jsonb_build_object(
        'name', o.customer_name,
        'email', o.customer_email,
        'phone', o.customer_phone,
        'address', o.customer_address
      ),
      coalesce(o.items, '[]'::jsonb),
      coalesce(o.subtotal, o.total),
      0,
      coalesce(o.total, 0),
      case when o.payment_method = 'already_paid' then 'paid' else 'issued' end
    );
    next_num := next_num + 1;
  end loop;

  -- Bump panel_settings counter so future automatic numbering doesn't collide.
  update public.panel_settings
     set value = to_jsonb(next_num),
         updated_at = now()
   where key = 'invoice.next_number';
end $$;
