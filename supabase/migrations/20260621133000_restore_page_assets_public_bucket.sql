-- page-assets must stay a public bucket: guest pages and <img> tags load files via
-- getPublicUrl() without auth headers. Setting public=false breaks all stored images (403).
-- Listing is limited by object-level RLS; direct URL access for known paths is intentional.

update storage.buckets
set public = true
where id = 'page-assets';

-- Ensure anon can read objects by direct URL / API (guest pages + editor preview)
drop policy if exists "anon read page assets" on storage.objects;
create policy "anon read page assets"
on storage.objects
for select
to anon
using (bucket_id = 'page-assets');
