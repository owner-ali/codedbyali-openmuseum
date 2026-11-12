// Returns 'shared' | 'copied' | 'failed'
export async function shareLink({ title, url }) {
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return 'shared';
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'failed';
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok ? 'copied' : 'failed';
    } catch {
      return 'failed';
    }
  }
}

export const SITE_URL = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');
