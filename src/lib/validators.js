export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
export const MAX_IMAGE_MB = 10;

// Returns an error message, or '' when the file is acceptable.
// SVG is intentionally rejected (it can embed scripts). Executables never pass the allow-list.
export function validateImage(file) {
  if (!file) return 'Please choose an image.';
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, WebP or GIF images are allowed.';
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `Image is too large. Maximum size is ${MAX_IMAGE_MB} MB.`;
  }
  if (file.size === 0) return 'This file is empty.';
  return '';
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
