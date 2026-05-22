-- =============================================================================
-- Strip diacritics and non-ASCII characters from existing product slugs so
-- the storefront route matcher (which compares URL-decoded UTF-8 against the
-- stored slug) doesn't 404 on Romanian-flavoured links. Idempotent: rerunning
-- on already-clean slugs is a no-op.
--
-- Only touches rows whose slug actually contains non-ASCII bytes — leaves
-- everything else alone.
-- =============================================================================

-- Preflight: which slugs would change?
select id, part_code, slug,
       lower(
         regexp_replace(
           regexp_replace(unaccent(slug), '[^a-z0-9]+', '-', 'g'),
           '^-+|-+$', '', 'g'
         )
       ) as new_slug
  from public.products
 where slug ~ '[^a-zA-Z0-9-]'
 order by created_at desc;

-- Apply (uncomment to run):
-- update public.products
--    set slug = lower(
--          regexp_replace(
--            regexp_replace(unaccent(slug), '[^a-z0-9]+', '-', 'g'),
--            '^-+|-+$', '', 'g'
--          )
--        )
--  where slug ~ '[^a-zA-Z0-9-]';
