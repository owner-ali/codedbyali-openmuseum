// Client-side image preparation: resize large photos and convert to WebP so
// uploads are small and pages load fast. GIFs are left untouched (animation).
export async function prepareImage(file, maxSide = 2000, quality = 0.86) {
  if (file.type === 'image/gif') return { blob: file, ext: 'gif', type: 'image/gif' };
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality));
    bitmap.close?.();
    if (blob && blob.type === 'image/webp') return { blob, ext: 'webp', type: 'image/webp' };
  } catch {
    /* fall through to the original file */
  }
  const ext = file.type === 'image/png' ? 'png' : 'jpg';
  return { blob: file, ext, type: file.type };
}

export function randomId() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
