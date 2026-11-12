-- Storage buckets. The server enforces file size and MIME type, so executables
-- and SVG (which can carry scripts) are rejected no matter what the browser sends.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('artworks', 'artworks', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars',  'avatars',  true,  2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('site',     'site',     true,  2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Users may only write inside a folder named after their own user id.
create policy "own folder insert" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('artworks', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_active_member()
  );

create policy "own folder select" on storage.objects for select to authenticated
  using (
    bucket_id in ('artworks', 'avatars')
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "own folder update" on storage.objects for update to authenticated
  using (
    bucket_id in ('artworks', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own folder delete" on storage.objects for delete to authenticated
  using (
    bucket_id in ('artworks', 'avatars')
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- Branding / exhibition covers: admins only
create policy "site admin write" on storage.objects for all to authenticated
  using (bucket_id = 'site' and public.is_admin())
  with check (bucket_id = 'site' and public.is_admin());
