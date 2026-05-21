-- =============================================================================
-- Defense-in-depth: enforce a case-insensitive unique index on part_code so
-- duplicate codes can't slip through any code path (admin form, panel sale
-- auto-create, future imports). Skips rows where part_code is null/empty.
--
-- Run the preflight first — if it returns any rows you have existing dupes
-- and must fix them (renaming or merging products) before the index will
-- build. The CREATE INDEX statement will error out otherwise.
-- =============================================================================

-- Preflight: list duplicate part_code groups (case-insensitive).
select upper(part_code) as code_upper, count(*) as copies,
       array_agg(id order by created_at) as product_ids
from public.products
where part_code is not null and part_code <> ''
group by upper(part_code)
having count(*) > 1
order by copies desc, code_upper;

-- Apply: unique case-insensitive index, partial so null/empty codes still allowed.
create unique index if not exists products_part_code_unique_idx
  on public.products (upper(part_code))
  where part_code is not null and part_code <> '';
