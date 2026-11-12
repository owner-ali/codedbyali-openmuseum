import { hashString } from '../lib/seed';
import { PALETTES } from '../data/demo';
import { publicUrl, supabase } from '../lib/supabase';

// Turns Supabase rows into the same shapes the demo data uses, so every
// component works identically in demo mode and live mode.
const ASPECTS = ['4/5', '1/1', '3/4', '5/6'];

export function normalizeArtwork(row) {
  const likes = Array.isArray(row.artwork_likes) ? row.artwork_likes[0]?.count ?? 0 : 0;
  const owner = row.profiles || {};
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.categories?.slug || '',
    categoryName: row.categories?.name || '',
    artistId: row.owner_id,
    artistName: row.artist_name || owner.display_name || owner.username || 'Unknown artist',
    createdAt: (row.created_at || '').slice(0, 10),
    tags: row.tags || [],
    description: row.description || '',
    seed: hashString(row.slug || row.id),
    palette: PALETTES[hashString(row.id) % PALETTES.length],
    aspect: ASPECTS[hashString(row.id) % ASPECTS.length],
    alt: `${row.title} by ${row.artist_name || owner.display_name || 'an artist'}`,
    imageUrl: publicUrl('artworks', row.image_path),
    previewUrl: row.preview_path ? publicUrl('artworks', row.preview_path) : '',
    imagePath: row.image_path,
    previewPath: row.preview_path,
    license: row.license,
    free: row.is_free,
    downloads: row.download_count || 0,
    status: row.status,
    rejectionReason: row.rejection_reason,
    featured: row.featured,
    likeCount: likes,
    demo: false,
  };
}

export function normalizeArtist(row) {
  return {
    id: row.id,
    slug: row.username,
    name: row.display_name || row.username,
    city: row.country || '',
    discipline: 'Artist',
    bio: row.bio || '',
    website: row.website || '',
    social: row.social || {},
    avatarUrl: row.avatar_path ? publicUrl('avatars', row.avatar_path) : '',
    seed: hashString(row.username),
    palette: PALETTES[hashString(row.id) % PALETTES.length],
    demo: false,
  };
}

const ART_SELECT =
  '*, categories(slug,name), profiles!owner_id(id,username,display_name,country,avatar_path), artwork_likes(count)';

export async function fetchLiveCatalog() {
  const [cats, arts, exh, settings, counts] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('artworks').select(ART_SELECT).eq('status', 'approved').order('created_at', { ascending: false }).limit(500),
    supabase
      .from('exhibitions')
      .select('*, exhibition_artworks(artwork_id, position)')
      .eq('status', 'published')
      .order('start_date', { ascending: false }),
    supabase.from('site_settings').select('key,value'),
    supabase.rpc('site_counts'),
  ]);
  const firstError = [cats, arts, exh, settings].find((r) => r.error);
  if (firstError) throw firstError.error;

  const artworks = (arts.data || []).map(normalizeArtwork);

  const artistMap = new Map();
  (arts.data || []).forEach((r) => {
    if (r.profiles && !artistMap.has(r.profiles.id)) artistMap.set(r.profiles.id, normalizeArtist(r.profiles));
  });

  const exhibitions = (exh.data || []).map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    subtitle: e.subtitle || '',
    description: e.description || '',
    curator: e.curator_note || '',
    start: e.start_date || '',
    end: e.end_date || '',
    status: e.status,
    coverUrl: e.cover_path ? publicUrl('site', e.cover_path) : '',
    seed: hashString(e.slug),
    palette: PALETTES[hashString(e.id) % PALETTES.length],
    style: ['planet', 'arch', 'city', 'grid', 'blobs', 'flow'][hashString(e.slug) % 6],
    artworks: (e.exhibition_artworks || []).sort((a, b) => a.position - b.position).map((x) => x.artwork_id),
    demo: false,
  }));

  const settingsObj = {};
  (settings.data || []).forEach((s) => {
    settingsObj[s.key] = s.value;
  });

  return {
    categories: (cats.data || []).map((c) => ({ slug: c.slug, name: c.name, blurb: c.description || '', style: STYLE[c.slug] || 'orbs', id: c.id })),
    artworks,
    artists: [...artistMap.values()],
    exhibitions,
    settings: settingsObj,
    counts: counts.data || null,
  };
}

const STYLE = {
  'digital-art': 'grid',
  'ai-art': 'flow',
  photography: 'bokeh',
  '3d-art': 'cubes',
  'classical-art': 'arch',
  'abstract-art': 'orbs',
  illustration: 'blobs',
  fantasy: 'mountains',
  architecture: 'city',
  'pixel-art': 'pixel',
  sculptures: 'bust',
  wallpapers: 'waves',
};