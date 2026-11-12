-- Row Level Security. RLS is the real security layer: the browser only holds
-- the public anon key, and every rule below is enforced inside Postgres.

alter table public.profiles            enable row level security;
alter table public.categories          enable row level security;
alter table public.artworks            enable row level security;
alter table public.artwork_likes       enable row level security;
alter table public.comments            enable row level security;
alter table public.favorites           enable row level security;
alter table public.follows             enable row level security;
alter table public.exhibitions         enable row level security;
alter table public.exhibition_artworks enable row level security;
alter table public.reports             enable row level security;
alter table public.site_settings       enable row level security;
alter table public.admin_logs          enable row level security;

-- profiles: public read; you edit only yourself; admins edit anyone.
-- (role / is_suspended are additionally protected by a trigger.)
create policy profiles_select on public.profiles for select using (true);
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- categories
create policy categories_select on public.categories for select using (true);
create policy categories_admin on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- artworks: the public sees approved work only; owners see their own; admins see all.
create policy artworks_select on public.artworks for select
  using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy artworks_insert on public.artworks for insert to authenticated
  with check (
    owner_id = auth.uid()
    and status = 'pending'
    and featured = false
    and download_count = 0
    and rejection_reason is null
    and public.is_active_member()
  );
create policy artworks_update on public.artworks for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy artworks_delete on public.artworks for delete to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- likes
create policy likes_select on public.artwork_likes for select using (true);
create policy likes_insert on public.artwork_likes for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_member());
create policy likes_delete on public.artwork_likes for delete to authenticated
  using (user_id = auth.uid());

-- comments
create policy comments_select on public.comments for select
  using (is_hidden = false or user_id = auth.uid() or public.is_admin());
create policy comments_insert on public.comments for insert to authenticated
  with check (
    user_id = auth.uid()
    and is_hidden = false
    and public.is_active_member()
    and exists (select 1 from public.artworks a where a.id = artwork_id and a.status = 'approved')
  );
create policy comments_update_admin on public.comments for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy comments_delete on public.comments for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- favorites: private to each user
create policy favorites_select on public.favorites for select to authenticated using (user_id = auth.uid());
create policy favorites_insert on public.favorites for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_member());
create policy favorites_delete on public.favorites for delete to authenticated using (user_id = auth.uid());

-- follows: counts are public; you can only follow/unfollow as yourself
create policy follows_select on public.follows for select using (true);
create policy follows_insert on public.follows for insert to authenticated
  with check (follower_id = auth.uid() and public.is_active_member());
create policy follows_delete on public.follows for delete to authenticated using (follower_id = auth.uid());

-- exhibitions: published ones are public; drafts and all writes are admin only
create policy exhibitions_select on public.exhibitions for select
  using (status = 'published' or public.is_admin());
create policy exhibitions_admin on public.exhibitions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy exhibition_artworks_select on public.exhibition_artworks for select
  using (
    public.is_admin()
    or exists (select 1 from public.exhibitions e where e.id = exhibition_id and e.status = 'published')
  );
create policy exhibition_artworks_admin on public.exhibition_artworks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- reports: anyone signed in can file one; only admins manage them
create policy reports_insert on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and status = 'open' and public.is_active_member());
create policy reports_select on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin());
create policy reports_update_admin on public.reports for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy reports_delete_admin on public.reports for delete to authenticated using (public.is_admin());

-- site settings: public read, admin write
create policy settings_select on public.site_settings for select using (true);
create policy settings_admin on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- admin logs: admins can read. Nobody can write directly; only the audit triggers do.
create policy admin_logs_select on public.admin_logs for select to authenticated using (public.is_admin());
revoke insert, update, delete on public.admin_logs from anon, authenticated;
