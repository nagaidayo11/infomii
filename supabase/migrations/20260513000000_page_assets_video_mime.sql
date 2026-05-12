-- page-assets: allow editor video uploads (was image-only) and raise size cap for clips.
-- Without video/* in allowed_mime_types, Supabase returns e.g. "mime type video/mp4 is not supported".

update storage.buckets
set
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]::text[],
  file_size_limit = 104857600
where id = 'page-assets';
