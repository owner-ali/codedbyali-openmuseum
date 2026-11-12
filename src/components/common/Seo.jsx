import { useEffect } from 'react';
import { SITE_URL } from '../../lib/share';

const BRAND = 'CodedByAli OpenMuseum';
const DEFAULT_DESC =
  'CodedByAli OpenMuseum is a futuristic digital art museum and global artist community. Discover Art. Experience History. Explore Creativity.';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function Seo({ title, description = DEFAULT_DESC, path }) {
  useEffect(() => {
    const full = title ? `${title} — ${BRAND}` : `${BRAND} — Discover Art. Experience History. Explore Creativity.`;
    const url = `${SITE_URL}${path ?? window.location.pathname}`;
    document.title = full;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', full);
    setMeta('name', 'twitter:description', description);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }, [title, description, path]);
  return null;
}
