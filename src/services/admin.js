import { supabase } from '../lib/supabase';
import { normalizeArtwork } from './catalog';
import { prepareImage, randomId } from '../lib/image';
import { removeFiles, uploadWithProgress } from './storage';
import { slugify } from '../lib/format';

// Every call below is checked by Row Level Security in the database.
// If a non-admin somehow reached this code, Postgres would refuse the request.
const must = ({ data, error }) => {
  if (error) throw error;
  return data;
};

export const adminStats = async () => must(await supabase.rpc('admin_stats'));

export const listUsers = async () =>
  must(await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(500));

export const setUserFlags = async (id, patch) => must(await supabase.from('profiles').update(patch).eq('id', id).select().single());

export const listAllArtworks = async () => {
  const rows = must(
    await supabase
      .from('artworks')
      .select('*, categories(slug,name), profiles(id,username,display_name,country,avatar_path), artwork_likes(count)')
      .order('created_at', { ascending: false })
      .limit(500),
  );
  return rows.map(normalizeArtwork);
};

export const reviewArtwork = async (id, status, reason = null) =>
  must(await supabase.from('artworks').update({ status, rejection_reason: status === 'rejected' ? reason : null }).eq('id', id));

export const setFeatured = async (id, featured) => must(await supabase.from('artworks').update({ featured }).eq('id', id));

export const adminUpdateArtwork = async (id, patch) => must(await supabase.from('artworks').update(patch).eq('id', id));

export const adminDeleteArtwork = async (art) => {
  must(await supabase.from('artworks').delete().eq('id', art.id));
  await removeFiles('artworks', [art.imagePath, art.previewPath]).catch(() => {});
};

export const listCategories = async () => must(await supabase.from('categories').select('*').order('sort_order'));

export const saveCategory = async (c) => {
  const row = { name: c.name.trim(), slug: slugify(c.slug || c.name), description: c.description || null, sort_order: Number(c.sort_order) || 0 };
  return c.id ? must(await supabase.from('categories').update(row).eq('id', c.id)) : must(await supabase.from('categories').insert(row));
};

export const deleteCategory = async (id) => must(await supabase.from('categories').delete().eq('id', id));

export const listExhibitions = async () =>
  must(await supabase.from('exhibitions').select('*, exhibition_artworks(artwork_id, position)').order('created_at', { ascending: false }));

export async function uploadSiteImage(file, prefix, onProgress) {
  const prepared = await prepareImage(file, 1800);
  const path = `${prefix}/${randomId()}.${prepared.ext}`;
  await uploadWithProgress('site', path, prepared.blob, onProgress);
  return path;
}

export async function saveExhibition(ex, artworkIds) {
  const row = {
    title: ex.title.trim(),
    slug: ex.id ? ex.slug : `${slugify(ex.title).slice(0, 60)}-${randomId().slice(0, 4)}`,
    subtitle: ex.subtitle || null,
    description: ex.description || null,
    curator_note: ex.curator_note || null,
    cover_path: ex.cover_path || null,
    start_date: ex.start_date || null,
    end_date: ex.end_date || null,
    status: ex.status,
  };
  let id = ex.id;
  if (id) must(await supabase.from('exhibitions').update(row).eq('id', id));
  else id = must(await supabase.from('exhibitions').insert(row).select('id').single()).id;
  must(await supabase.from('exhibition_artworks').delete().eq('exhibition_id', id));
  if (artworkIds.length) {
    must(await supabase.from('exhibition_artworks').insert(artworkIds.map((aid, i) => ({ exhibition_id: id, artwork_id: aid, position: i }))));
  }
  return id;
}

export const deleteExhibition = async (id) => must(await supabase.from('exhibitions').delete().eq('id', id));

export const listReports = async () =>
  must(
    await supabase
      .from('reports')
      .select('*, reporter:reporter_id(username), artworks(id, title, slug), comments(id, body)')
      .order('created_at', { ascending: false })
      .limit(200),
  );

export const setReportStatus = async (id, status) => must(await supabase.from('reports').update({ status }).eq('id', id));

export const listAllComments = async () =>
  must(
    await supabase
      .from('comments')
      .select('id, body, is_hidden, created_at, profiles(username, display_name), artworks(title, slug)')
      .order('created_at', { ascending: false })
      .limit(200),
  );

export const setCommentHidden = async (id, hidden) => must(await supabase.from('comments').update({ is_hidden: hidden }).eq('id', id));
export const adminDeleteComment = async (id) => must(await supabase.from('comments').delete().eq('id', id));

export const saveSettings = async (obj) => {
  const rows = Object.entries(obj).map(([key, value]) => ({ key, value }));
  must(await supabase.from('site_settings').upsert(rows, { onConflict: 'key' }));
};

export const listLogs = async () =>
  must(await supabase.from('admin_logs').select('*, profiles:admin_id(username)').order('created_at', { ascending: false }).limit(200));
