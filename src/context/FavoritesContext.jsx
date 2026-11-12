import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { isLive, supabase } from '../lib/supabase';

// Demo mode: favourites, follows and likes live in this browser (localStorage).
// Live mode: they live in Supabase, tied to the signed-in account.
const KEYS = { fav: 'cbaom:favorites', follow: 'cbaom:following', like: 'cbaom:likes' };

function read(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export const keyArt = (art) => (isLive ? art.id : art.slug);
export const keyArtist = (artist) => (isLive ? artist.id : artist.slug);

const Ctx = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(() => (isLive ? [] : read(KEYS.fav)));
  const [following, setFollowing] = useState(() => (isLive ? [] : read(KEYS.follow)));
  const [likes, setLikes] = useState(() => (isLive ? [] : read(KEYS.like)));
  const [adjust, setAdjust] = useState({});

  useEffect(() => {
    if (!isLive) return undefined;
    if (!user) {
      setFavorites([]);
      setFollowing([]);
      setLikes([]);
      return undefined;
    }
    let dead = false;
    (async () => {
      const [f, fo, l] = await Promise.all([
        supabase.from('favorites').select('artwork_id').eq('user_id', user.id),
        supabase.from('follows').select('following_id').eq('follower_id', user.id),
        supabase.from('artwork_likes').select('artwork_id').eq('user_id', user.id),
      ]);
      if (dead) return;
      setFavorites((f.data || []).map((r) => r.artwork_id));
      setFollowing((fo.data || []).map((r) => r.following_id));
      setLikes((l.data || []).map((r) => r.artwork_id));
    })();
    return () => {
      dead = true;
    };
  }, [user]);

  useEffect(() => {
    if (!isLive) write(KEYS.fav, favorites);
  }, [favorites]);
  useEffect(() => {
    if (!isLive) write(KEYS.follow, following);
  }, [following]);
  useEffect(() => {
    if (!isLive) write(KEYS.like, likes);
  }, [likes]);

  const value = useMemo(() => {
    const requiresLogin = isLive && !user;

    // Optimistic toggle; rolls back if the database refuses.
    const flip = async ({ key, list, setList, add, remove }) => {
      if (requiresLogin) return false;
      const has = list.includes(key);
      setList((l) => (has ? l.filter((k) => k !== key) : [...l, key]));
      if (!isLive) return true;
      const { error } = has ? await remove() : await add();
      if (error) {
        setList((l) => (has ? [...l, key] : l.filter((k) => k !== key)));
        return false;
      }
      return true;
    };

    return {
      requiresLogin,
      favorites,
      following,
      likes,
      isFavorite: (art) => favorites.includes(keyArt(art)),
      isLiked: (art) => likes.includes(keyArt(art)),
      isFollowing: (artist) => following.includes(keyArtist(artist)),
      likeCountOf: (art) => (art.likeCount || 0) + (adjust[keyArt(art)] || 0),
      toggleFavorite: (art) =>
        flip({
          key: keyArt(art),
          list: favorites,
          setList: setFavorites,
          add: () => supabase.from('favorites').insert({ user_id: user.id, artwork_id: art.id }),
          remove: () => supabase.from('favorites').delete().eq('user_id', user.id).eq('artwork_id', art.id),
        }),
      toggleFollow: (artist) =>
        flip({
          key: keyArtist(artist),
          list: following,
          setList: setFollowing,
          add: () => supabase.from('follows').insert({ follower_id: user.id, following_id: artist.id }),
          remove: () => supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', artist.id),
        }),
      toggleLike: async (art) => {
        const k = keyArt(art);
        const had = likes.includes(k);
        const ok = await flip({
          key: k,
          list: likes,
          setList: setLikes,
          add: () => supabase.from('artwork_likes').insert({ user_id: user.id, artwork_id: art.id }),
          remove: () => supabase.from('artwork_likes').delete().eq('user_id', user.id).eq('artwork_id', art.id),
        });
        if (ok) setAdjust((a) => ({ ...a, [k]: (a[k] || 0) + (had ? -1 : 1) }));
        return ok;
      },
    };
  }, [favorites, following, likes, adjust, user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return v;
}
