import { supabase } from '../lib/supabase';
import { prepareImage, randomId } from '../lib/image';
import { slugify } from '../lib/format';
import { removeFiles, uploadWithProgress } from './storage';
import { normalizeArtwork } from './catalog';

const SELECT = '*, categories(slug,name), profiles(id,username,display_name,country,avatar_path), artwork_likes(count)';

// Publishes a new artwork as "pending". Files go to artworks/<user id>/<random>.<ext>
// (storage policy: users can only write inside their own folder).
export async function createArtwork({ user, form, imageFile, previewFile, onProgress }) {
  const uploaded = [];
  try {
    const main = await prepareImage(imageFile, 2400);
    const imagePath = `${user.id}/${randomId()}.${main.ext}`;
    const hasPreview = !!previewFile;
    const prev = hasPreview ? await prepareImage(previewFile, 800) : null;
    const previewPath = prev ? `${user.id}/${randomId()}-preview.${prev.ext}` : null;

    const total = main.blob.size + (prev ? prev.blob.size : 0);
    let doneBytes = 0;
    const report = (loaded, size) => onProgress && onProgress((doneBytes + loaded * size) / total);

    await uploadWithProgress('artworks', imagePath, main.blob, (f) => report(f, main.blob.size));
    uploaded.push(imagePath);
    doneBytes += main.blob.size;
    if (prev) {
      await uploadWithProgress('artworks', previewPath, prev.blob, (f) => report(f, prev.blob.size));
      uploaded.push(previewPath);
    }
    if (onProgress) onProgress(1);

    const slug = `${slugify(form.title).slice(0, 60) || 'artwork'}-${randomId().slice(0, 6)}`;
    const { data, error } = await supabase
      .from('artworks')
      .insert({
        owner_id: user.id,
        category_id: form.categoryId,
        title: form.title.trim(),
        slug,
        description: form.description.trim(),
        tags: form.tags,
        image_path: imagePath,
        preview_path: previewPath,
        artist_name: form.artist.trim(),
        license: form.license,
        status: 'pending',
      })
      .select(SELECT)
      .single();
    if (error) throw error;
    return normalizeArtwork(data);
  } catch (e) {
    await removeFiles('artworks', uploaded).catch(() => {});
    throw e;
  }
}

export async function listMine(userId) {
  const { data, error } = await supabase.from('artworks').select(SELECT).eq('owner_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeArtwork);
}

// Editing sends the artwork back to review (enforced by a database trigger).
export async function updateArtwork(id, { title, description, tags, categoryId, license, artist }) {
  const { data, error } = await supabase
    .from('artworks')
    .update({ title: title.trim(), description: description.trim(), tags, category_id: categoryId, license, artist_name: artist.trim() })
    .eq('id', id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return normalizeArtwork(data);
}

export async function deleteArtwork(art) {
  const { error } = await supabase.from('artworks').delete().eq('id', art.id);
  if (error) throw error;
  await removeFiles('artworks', [art.imagePath, art.previewPath]).catch(() => {});
}

export async function listMyComments(userId) {
  // comments on artworks I own
  const { data, error } = await supabase
    .from('comments')
    .select('id, body, created_at, is_hidden, profiles(username, display_name), artworks!inner(id, title, slug, owner_id)')
    .eq('artworks.owner_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}

export async function listFollowers(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('created_at, profiles:follower_id(id, username, display_name)')
    .eq('following_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => r.profiles).filter(Boolean);
}

export async function listFollowing(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('created_at, profiles:following_id(id, username, display_name)')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => r.profiles).filter(Boolean);
}
