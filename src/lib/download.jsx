import { renderToStaticMarkup } from 'react-dom/server';
import ArtPiece from '../components/gallery/ArtPiece';
import { isLive, supabase } from './supabase';

function save(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// Demo artworks are generated SVG. Live artworks download the real image and
// bump the download counter through a database function (approved + free only).
export async function downloadArtwork(art) {
  if (art.imageUrl) {
    const res = await fetch(art.imageUrl);
    if (!res.ok) throw new Error('Could not download this image.');
    const blob = await res.blob();
    const ext = (art.imagePath || '').split('.').pop() || 'jpg';
    save(blob, `${art.slug}-codedbyali-openmuseum.${ext}`);
    if (isLive) await supabase.rpc('increment_download', { p_artwork_id: art.id });
    return;
  }
  const svg = renderToStaticMarkup(<ArtPiece art={art} width={1600} height={2000} />);
  save(new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${svg}`], { type: 'image/svg+xml' }), `${art.slug}-codedbyali-openmuseum.svg`);
}
