import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as demo from '../data/demo';
import { fetchLiveCatalog } from '../services/catalog';
import { isLive } from '../lib/supabase';

const ROOM_CATS = {
  ancient: ['classical-art', 'sculptures'],
  modern: ['abstract-art', 'illustration', 'photography'],
  digital: ['digital-art', 'pixel-art', '3d-art', 'wallpapers'],
  space: ['fantasy', 'architecture'],
  ai: ['ai-art'],
  abstract: ['abstract-art', 'wallpapers'],
};

const DEMO = {
  categories: demo.CATEGORIES,
  artworks: demo.ARTWORKS,
  artists: demo.ARTISTS,
  exhibitions: demo.EXHIBITIONS,
  settings: {},
  counts: null,
};
const EMPTY = { categories: [], artworks: [], artists: [], exhibitions: [], settings: {}, counts: null };

const Ctx = createContext(null);

export function CatalogProvider({ children }) {
  const [data, setData] = useState(isLive ? EMPTY : DEMO);
  const [loading, setLoading] = useState(isLive);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!isLive) return;
    setLoading(true);
    try {
      setData(await fetchLiveCatalog());
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load the museum.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const { categories, artworks, artists, exhibitions } = data;
    const getCategory = (slug) =>
      categories.find((c) => c.slug === slug) || categories[0] || { slug: '', name: 'Art', style: 'orbs' };
    const getArtist = (id) => artists.find((a) => a.id === id);
    const artworksByIds = (ids) => ids.map((id) => artworks.find((a) => a.id === id)).filter(Boolean);

    const newest = [...artworks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    let featured;
    let trending;
    if (isLive) {
      const flagged = artworks.filter((a) => a.featured);
      featured = [...flagged, ...newest.filter((a) => !a.featured)].slice(0, 7);
      trending = [...artworks].sort((a, b) => b.likeCount - a.likeCount).slice(0, 5);
    } else {
      featured = artworksByIds(demo.FEATURED_IDS);
      trending = artworksByIds(demo.TRENDING_IDS);
    }

    return {
      mode: isLive ? 'live' : 'demo',
      isLive,
      loading,
      error,
      refresh: load,
      categories,
      artworks,
      artists,
      exhibitions,
      settings: data.settings,
      counts: data.counts,
      rooms: demo.ROOMS,
      featured,
      trending,
      recent: newest.slice(0, 6),
      getCategory,
      getArtist,
      artistOf: (art) =>
        getArtist(art.artistId) || {
          id: art.artistId,
          slug: '',
          name: art.artistName || 'Unknown artist',
          city: '',
          discipline: 'Artist',
          bio: '',
          seed: art.seed,
          palette: art.palette,
        },
      getArtwork: (slug) => artworks.find((a) => a.slug === slug),
      getArtistBySlug: (slug) => artists.find((a) => a.slug === slug),
      getExhibition: (slug) => exhibitions.find((e) => e.slug === slug),
      artworksByArtist: (id) => artworks.filter((a) => a.artistId === id),
      artworksByIds,
      roomWorks: (room) => {
        if (!isLive) return artworksByIds(room.artworks);
        const cats = ROOM_CATS[room.slug] || [];
        const own = newest.filter((a) => cats.includes(a.category));
        const fill = newest.filter((a) => !cats.includes(a.category));
        return [...own, ...(own.length < 3 ? fill : [])].slice(0, 8);
      },
    };
  }, [data, loading, error, load]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCatalog must be used inside <CatalogProvider>');
  return v;
}
