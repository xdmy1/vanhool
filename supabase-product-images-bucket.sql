-- ============================================================================
-- Storage bucket for product images — run once in Supabase SQL Editor.
-- ============================================================================
-- Creates a public bucket (so the URL is fetchable without auth) and the RLS
-- policies needed to let admin users upload / update / delete files. Reads
-- are open to everyone; the storefront just embeds the public URL.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

-- Anyone can read a file from this bucket.
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects for select
to public
using (bucket_id = 'product-images');

-- Admin profiles can upload.
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'product-images'
    and exists (
        select 1 from public.profiles
        where id = auth.uid() and is_admin = true
    )
);

-- Admin profiles can replace existing files.
drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
on storage.objects for update
to authenticated
using (
    bucket_id = 'product-images'
    and exists (
        select 1 from public.profiles
        where id = auth.uid() and is_admin = true
    )
)
with check (
    bucket_id = 'product-images'
    and exists (
        select 1 from public.profiles
        where id = auth.uid() and is_admin = true
    )
);

-- Admin profiles can remove old files.
drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'product-images'
    and exists (
        select 1 from public.profiles
        where id = auth.uid() and is_admin = true
    )
);
