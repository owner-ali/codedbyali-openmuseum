import { useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as THREE from 'three';
import ArtPiece from '../gallery/ArtPiece';

// Turns an artwork (generated SVG or a real image URL) into a WebGL texture.
// Images are down-scaled and cover-cropped to protect phone GPUs.
const W = 512;
const H = 646;
const cache = new Map();
const keyOf = (art) => art.imageUrl || `gen:${art.slug}`;

function toTexture(img) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const iw = img.naturalWidth || img.width || W;
  const ih = img.naturalHeight || img.height || H;
  const target = W / H;
  let sw = iw;
  let sh = ih;
  if (iw / ih > target) sw = ih * target;
  else sh = iw / target;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, W, H);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function useArtTexture(art) {
  const k = keyOf(art);
  const [tex, setTex] = useState(() => cache.get(k) || null);

  useEffect(() => {
    if (cache.has(k)) {
      setTex(cache.get(k));
      return undefined;
    }
    let dead = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (dead) return;
      try {
        const t = toTexture(img);
        cache.set(k, t);
        setTex(t);
      } catch {
        /* tainted canvas or decode failure: keep placeholder */
      }
    };
    if (art.imageUrl) {
      img.src = art.imageUrl;
    } else {
      const svg = renderToStaticMarkup(<ArtPiece art={art} width={W} height={H} />);
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    return () => {
      dead = true;
    };
  }, [k, art]);

  return tex;
}
