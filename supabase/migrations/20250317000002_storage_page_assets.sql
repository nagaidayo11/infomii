-- Storage bucket for page assets (images in editor cards).
-- Public bucket: images are readable without auth for guest pages.
-- If this fails, create bucket "page-assets" (public) manually in Supabase Dashboard > Storage.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'page-assets',
  'page-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- RLS: authenticated users can upload; public read (bucket is public)
create policy "Authenticated users can upload page assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'page-assets');

create policy "Authenticated users can update own uploads"
on storage.objects
for update
to authenticated
using (bucket_id = 'page-assets');

create policy "Authenticated users can delete own uploads"
on storage.objects
for delete
to authenticated
using (bucket_id = 'page-assets');
