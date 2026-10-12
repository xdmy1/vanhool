-- ============================================================================
-- Facturi: retururile scad restul de plată
-- ----------------------------------------------------------------------------
-- O anexă de retur (document_returns) e o notă de credit: ce mai datorează
-- clientul pe o factură = total − retururi − încasat. Până acum statusul
-- Achitată / Parțial achitată se calcula din total − încasat, deci o factură
-- de 3833 cu retur 1880 și 2000 încasați rămânea „Parțial achitată, rest 1833"
-- deși clientul plătise tot ce a păstrat.
--
-- Codul face acum calculul corect la fiecare încasare, retur și anulare de
-- retur. Scriptul de față corectează O DATĂ facturile deja afectate.
-- Idempotent — poate fi rulat de mai multe ori. Necesită sql/document-returns.sql.
-- ============================================================================

-- Deschise (issued/sent/partial), dar acoperite de încasări după ce scădem
-- retururile → Achitată. Doar facturi cu o încasare înregistrată.
update public.invoices i
set status = 'paid',
    paid_at = coalesce(i.paid_at, i.updated_at, now()),
    updated_at = now()
where i.type = 'invoice'
  and i.status in ('issued', 'sent', 'partial')
  and coalesce(i.paid_amount, 0) > 0
  and coalesce(i.paid_amount, 0) >= i.total
      - coalesce((select sum(r.total) from public.document_returns r
                  where r.parent_type = 'invoice' and r.parent_id = i.id), 0)
      - 0.01;
