-- =============================================================================
-- Delete only the four delivery notes FL-00004..FL-00007. Nothing else —
-- orders, invoices, cash movements and stock stay untouched. Unlink the
-- order's delivery_note_id pointer first so the FK doesn't block.
-- =============================================================================

update public.orders
   set delivery_note_id = null
 where delivery_note_id in (
   select id from public.delivery_notes
    where series = 'FL' and number in ('00004', '00005', '00006', '00007')
 );

delete from public.delivery_notes
 where series = 'FL' and number in ('00004', '00005', '00006', '00007');
