-- CodedByAli OpenMuseum: tables, constraints and indexes.
-- Run the migration files in order (0001 -> 0004) in the Supabase SQL editor.

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name  text not null default '' check (char_length(display_name) <= 60),
  bio           text check (char_length(bio) <= 600),
  country       text check (char_length(country) <= 80),
  avatar_path   text,
  website       text check (website is null or website ~* '^https?://'),
  social        jsonb not null default '{}'::jsonb,
  role          text not null default 'user' check (role in ('user', 'admin')),
  is_suspended  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -------------------------------------------------------------- categories
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null check (char_length(name) between 2 and 60),
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- artworks
create table public.artworks (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references public.profiles (id) on delete cascade,
  category_id      uuid not null references public.categories (id) on delete restrict,
  title            text not null check (char_length(title) between 3 and 90),
  slug             text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description      text check (char_length(description) <= 1200),
  tags             text[] not null default '{}' check (cardinality(tags) <= 8),
  image_path       text not null,
  preview_path     text,
  artist_name      text not null check (char_length(artist_name) between 1 and 80),
  license          text not null,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  featured         boolean not null default false,
  is_free          boolean not null default true,
  download_count   integer not null default 0 check (download_count >= 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index artworks_status_created_idx on public.artworks (status, created_at desc);
create index artworks_owner_idx          on public.artworks (owner_id);
create index artworks_category_idx       on public.artworks (category_id);
create index artworks_tags_idx           on public.artworks using gin (tags);

-- ----------------------------------------------------------- artwork_likes
create table public.artwork_likes (
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (artwork_id, user_id)
);
create index artwork_likes_user_idx on public.artwork_likes (user_id);

-- ---------------------------------------------------------------- comments
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 1000),
  is_hidden  boolean not null default false,
  created_at timestamptz not null default now()
);
create index comments_artwork_idx on public.comments (artwork_id, created_at);
create index comments_user_idx    on public.comments (user_id);

-- --------------------------------------------------------------- favorites
create table public.favorites (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, artwork_id)
);
create index favorites_artwork_idx on public.favorites (artwork_id);

-- ----------------------------------------------------------------- follows
create table public.follows (
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index follows_following_idx on public.follows (following_id);

-- ------------------------------------------------------------- exhibitions
create table public.exhibitions (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title        text not null check (char_length(title) between 3 and 90),
  subtitle     text,
  description  text,
  curator_note text,
  cover_path   text,
  start_date   date,
  end_date     date,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.exhibition_artworks (
  exhibition_id uuid not null references public.exhibitions (id) on delete cascade,
  artwork_id    uuid not null references public.artworks (id) on delete cascade,
  position      integer not null default 0,
  primary key (exhibition_id, artwork_id)
);
create index exhibition_artworks_artwork_idx on public.exhibition_artworks (artwork_id);

-- ----------------------------------------------------------------- reports
create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  artwork_id  uuid references public.artworks (id) on delete cascade,
  comment_id  uuid references public.comments (id) on delete cascade,
  reason      text not null check (char_length(reason) between 3 and 500),
  status      text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at  timestamptz not null default now(),
  check (artwork_id is not null or comment_id is not null)
);
create index reports_status_idx on public.reports (status, created_at desc);

-- ----------------------------------------------------------- site_settings
create table public.site_settings (
  key        text primary key check (key ~ '^[a-z0-9_]+$'),
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------- admin_logs
create table public.admin_logs (
  id          bigint generated always as identity primary key,
  admin_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  target_type text not null,
  target_id   text,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index admin_logs_created_idx on public.admin_logs (created_at desc);
