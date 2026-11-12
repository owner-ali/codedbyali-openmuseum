import { supabase } from '../lib/supabase';

export async function fetchComments(artworkId) {
  const { data, error } = await supabase
    .from('comments')
    .select('id, body, created_at, user_id, is_hidden, profiles(username, display_name)')
    .eq('artwork_id', artworkId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) throw error;
  return data || [];
}

export async function addComment(artworkId, userId, body) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ artwork_id: artworkId, user_id: userId, body: body.trim() })
    .select('id, body, created_at, user_id, is_hidden, profiles(username, display_name)')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(id) {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
}

export async function reportItem({ reporterId, artworkId, commentId, reason }) {
  const { error } = await supabase.from('reports').insert({
    reporter_id: reporterId,
    artwork_id: artworkId || null,
    comment_id: commentId || null,
    reason: reason.trim(),
  });
  if (error) throw error;
}

export async function followerCount(profileId) {
  const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileId);
  return count || 0;
}
