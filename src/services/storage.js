import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from '../lib/supabase';

// Upload with real progress (the supabase-js client cannot report it), using the
// storage REST endpoint with the signed-in user's token. RLS + bucket limits still apply.
export async function uploadWithProgress(bucket, path, blob, onProgress) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please log in again to upload.');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('Content-Type', blob.type || 'application/octet-stream');
    xhr.setRequestHeader('cache-control', 'max-age=31536000');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(path);
      else {
        let msg = 'Upload failed.';
        try {
          msg = JSON.parse(xhr.responseText).message || msg;
        } catch {
          /* ignore */
        }
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error('Network error while uploading.'));
    xhr.send(blob);
  });
}

export async function removeFiles(bucket, paths) {
  const list = paths.filter(Boolean);
  if (!list.length) return;
  await supabase.storage.from(bucket).remove(list);
}
