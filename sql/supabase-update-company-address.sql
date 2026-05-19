-- =============================================================================
-- Update the company address used on every issued document (proforma, invoice,
-- delivery note, PO). Idempotent — run again safely after edits in /panel/setari.
-- =============================================================================

update public.panel_settings
   set value = to_jsonb('Stradela Dimo 9, Durlești, mun. Chișinău, Republica Moldova'::text),
       updated_at = now()
 where key = 'company.address';
