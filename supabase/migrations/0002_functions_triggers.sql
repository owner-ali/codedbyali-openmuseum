-- Helper functions, protective triggers, audit logging and RPCs.

-- ------------------------------------------------------------ role helpers
-- SECURITY DEFINER so policies can ask "is this user an admin?" without
-- recursing into the profiles table's own RLS.
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and not p.is_suspended
  );
$$;

create or replace function public.is_active_member()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and not p.is_suspended
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_active_member() from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_active_member() to anon, authenticated;

-- -------------------------------------------------------------- timestamps
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_updated    before update on public.profiles    for each row execute function public.set_updated_at();
create trigger artworks_updated    before update on public.artworks    for each row execute function public.set_updated_at();
create trigger exhibitions_updated before update on public.exhibitions for each row execute function public.set_updated_at();
create trigger settings_updated    before update on public.site_settings for each row execute function public.set_updated_at();

-- --------------------------------------------------- profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  n integer := 0;
begin
  base := lower(regexp_replace(coalesce(split_part(new.email, '@', 1), ''), '[^a-zA-Z0-9]', '', 'g'));
  if char_length(base) < 3 then base := base || 'user'; end if;
  base := left(base, 24);
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;
  insert into public.profiles (id, username, display_name)
  values (new.id, candidate, left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), base), 60));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------- protect sensitive columns
-- A normal member can never change their own role or suspension flag.
-- auth.uid() is null when running from the SQL editor / service role, which is
-- how the first admin is created (see supabase/admin_setup.sql).
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.id := old.id;
    new.role := old.role;
    new.is_suspended := old.is_suspended;
  end if;
  return new;
end $$;

create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- Owners can edit their artwork, but every edit sends it back to review, and
-- they can never touch status, featured, download count or ownership.
create or replace function public.protect_artwork_columns()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if coalesce(current_setting('app.bypass_protect', true), '') = '1' then
    return new;
  end if;
  if auth.uid() is not null and not public.is_admin() then
    new.owner_id := old.owner_id;
    new.slug := old.slug;
    new.featured := old.featured;
    new.download_count := old.download_count;
    new.rejection_reason := null;
    new.status := 'pending';
  end if;
  return new;
end $$;

create trigger artworks_protect
  before update on public.artworks
  for each row execute function public.protect_artwork_columns();

-- --------------------------------------------------------- audit logging
-- Written by the database itself, so a compromised browser cannot skip it.
create or replace function public.log_admin_row()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  j jsonb;
begin
  if auth.uid() is null or not public.is_admin() then
    return null;
  end if;
  j := to_jsonb(coalesce(new, old));
  if tg_table_name = 'profiles' and (j ->> 'id')::uuid = auth.uid() then
    return null;
  end if;
  insert into public.admin_logs (admin_id, action, target_type, target_id, details)
  values (
    auth.uid(),
    lower(tg_op) || '_' || tg_table_name,
    tg_table_name,
    coalesce(j ->> 'id', j ->> 'key'),
    jsonb_strip_nulls(jsonb_build_object(
      'title', j ->> 'title',
      'name', j ->> 'name',
      'status', j ->> 'status',
      'reason', j ->> 'rejection_reason',
      'role', j ->> 'role',
      'suspended', j ->> 'is_suspended',
      'featured', j ->> 'featured',
      'hidden', j ->> 'is_hidden'
    ))
  );
  return null;
end $$;

create trigger log_artworks_upd after update on public.artworks
  for each row when (old.status is distinct from new.status or old.featured is distinct from new.featured)
  execute function public.log_admin_row();
create trigger log_artworks_del after delete on public.artworks
  for each row execute function public.log_admin_row();
create trigger log_comments_upd after update on public.comments
  for each row when (old.is_hidden is distinct from new.is_hidden)
  execute function public.log_admin_row();
create trigger log_comments_del after delete on public.comments
  for each row execute function public.log_admin_row();
create trigger log_profiles_upd after update on public.profiles
  for each row when (old.role is distinct from new.role or old.is_suspended is distinct from new.is_suspended)
  execute function public.log_admin_row();
create trigger log_categories after insert or update or delete on public.categories
  for each row execute function public.log_admin_row();
create trigger log_exhibitions after insert or update or delete on public.exhibitions
  for each row execute function public.log_admin_row();
create trigger log_reports_upd after update on public.reports
  for each row when (old.status is distinct from new.status)
  execute function public.log_admin_row();
create trigger log_settings after insert or update or delete on public.site_settings
  for each row execute function public.log_admin_row();

-- ------------------------------------------------------------------- RPCs
create or replace function public.increment_download(p_artwork_id uuid)
returns integer
language plpgsql security definer
set search_path = public
as $$
declare
  c integer;
begin
  perform set_config('app.bypass_protect', '1', true);
  update public.artworks
     set download_count = download_count + 1
   where id = p_artwork_id and status = 'approved' and is_free
  returning download_count into c;
  return c;
end $$;

create or replace function public.site_counts()
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'artworks',    (select count(*) from public.artworks where status = 'approved'),
    'artists',     (select count(distinct owner_id) from public.artworks where status = 'approved'),
    'exhibitions', (select count(*) from public.exhibitions where status = 'published'),
    'members',     (select count(*) from public.profiles)
  );
$$;

create or replace function public.admin_stats()
returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'members',      (select count(*) from public.profiles),
    'artworks',     (select count(*) from public.artworks),
    'approved',     (select count(*) from public.artworks where status = 'approved'),
    'pending',      (select count(*) from public.artworks where status = 'pending'),
    'rejected',     (select count(*) from public.artworks where status = 'rejected'),
    'likes',        (select count(*) from public.artwork_likes),
    'comments',     (select count(*) from public.comments),
    'open_reports', (select count(*) from public.reports where status = 'open'),
    'downloads',    (select coalesce(sum(download_count), 0) from public.artworks)
  );
end $$;

revoke all on function public.increment_download(uuid) from public;
revoke all on function public.site_counts() from public;
revoke all on function public.admin_stats() from public;
grant execute on function public.increment_download(uuid) to anon, authenticated;
grant execute on function public.site_counts() to anon, authenticated;
grant execute on function public.admin_stats() to authenticated;
