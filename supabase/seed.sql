-- Run after the migrations. Safe to run more than once.

insert into public.categories (slug, name, description, sort_order) values
  ('digital-art',   'Digital Art',   'Screens, pixels and light.', 1),
  ('ai-art',        'AI Art',        'Machine imagination.', 2),
  ('photography',   'Photography',   'Moments held still.', 3),
  ('3d-art',        '3D Art',        'Form with depth.', 4),
  ('classical-art', 'Classical Art', 'Timeless foundations.', 5),
  ('abstract-art',  'Abstract Art',  'Colour without rules.', 6),
  ('illustration',  'Illustration',  'Stories drawn.', 7),
  ('fantasy',       'Fantasy',       'Worlds that never were.', 8),
  ('architecture',  'Architecture',  'Space, imagined.', 9),
  ('pixel-art',     'Pixel Art',     'Small squares, big worlds.', 10),
  ('sculptures',    'Sculptures',    'Stone, light, volume.', 11),
  ('wallpapers',    'Wallpapers',    'Art for every screen.', 12)
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
  ('hero_label',       to_jsonb('The Future of Digital Art'::text)),
  ('hero_heading',     to_jsonb('Where Art Meets Imagination.'::text)),
  ('hero_description', to_jsonb('Enter a world of extraordinary creativity. Explore timeless masterpieces, discover emerging artists and experience digital art beyond boundaries.'::text)),
  ('announcement',     to_jsonb(''::text))
on conflict (key) do nothing;
