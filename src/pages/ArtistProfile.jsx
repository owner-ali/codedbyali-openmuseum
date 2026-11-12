import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, ExternalLink, MapPin, UserPlus } from 'lucide-react';
import Seo from '../components/common/Seo';
import Reveal from '../components/common/Reveal';
import Button from '../components/common/Button';
import Notice from '../components/common/Notice';
import EmptyState from '../components/common/EmptyState';
import ArtPiece from '../components/gallery/ArtPiece';
import MasonryGallery from '../components/gallery/MasonryGallery';
import NotFound from './NotFound';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';
import { useFavorites } from '../context/FavoritesContext';
import { isLive, supabase } from '../lib/supabase';
import { normalizeArtist } from '../services/catalog';
import { followerCount } from '../services/community';

const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u) ? u : '');

export default function ArtistProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getArtistBySlug, artworksByArtist, loading } = useCatalog();
  const { user } = useAuth();
  const { isFollowing, toggleFollow, requiresLogin } = useFavorites();
  const [fetched, setFetched] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [followers, setFollowers] = useState(null);

  const inCatalog = getArtistBySlug(slug);
  const artist = inCatalog || fetched;

  // Artists with no approved artwork yet are not in the catalog: load their profile directly.
  useEffect(() => {
    if (!isLive || inCatalog || loading) return undefined;
    let dead = false;
    setFetching(true);
    supabase.from('profiles').select('*').eq('username', slug).maybeSingle().then(({ data }) => {
      if (!dead) {
        setFetched(data ? normalizeArtist(data) : null);
        setFetching(false);
      }
    });
    return () => {
      dead = true;
    };
  }, [slug, inCatalog, loading]);

  useEffect(() => {
    if (!isLive || !artist) return undefined;
    let dead = false;
    followerCount(artist.id).then((n) => !dead && setFollowers(n));
    return () => {
      dead = true;
    };
  }, [artist]);

  if (!artist) return loading || fetching ? null : <NotFound />;

  const works = artworksByArtist(artist.id);
  const following = isFollowing(artist);
  const isMe = user && user.id === artist.id;
  const links = [
    ...(safeUrl(artist.website) ? [['Website', artist.website]] : []),
    ...Object.entries(artist.social || {}).filter(([, v]) => safeUrl(v)).map(([k, v]) => [k, v]),
  ];

  const onFollow = async () => {
    if (requiresLogin) return navigate('/login');
    const ok = await toggleFollow(artist);
    if (ok && followers !== null) setFollowers((n) => n + (following ? -1 : 1));
  };

  return (
    <>
      <Seo title={artist.name} description={`${artist.name}${artist.discipline ? `, ${artist.discipline}` : ''}${artist.city ? ` from ${artist.city}` : ''}. ${artist.bio}`.slice(0, 280)} />
      <header className="relative overflow-hidden pt-32 sm:pt-40">
        <div className="absolute inset-x-0 top-0 h-[55%] opacity-60"><ArtPiece art={{ ...artist, alt: '' }} variant="waves" /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/70 to-ink" />
        <div className="container-x relative pb-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-end">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-neon/60 shadow-[0_0_50px_rgba(0,229,255,.25)] sm:h-44 sm:w-44">
              <ArtPiece art={{ ...artist, imageUrl: artist.avatarUrl, alt: `${artist.name} avatar` }} variant="orbs" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow mb-3">{artist.discipline}</p>
              <h1 className="break-words font-display text-[clamp(2.2rem,6vw,5rem)] font-bold leading-none tracking-tight">{artist.name}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/65">
                {artist.city && <span className="flex items-center gap-2"><MapPin size={15} className="text-neon" /> {artist.city}</span>}
                {followers !== null && <span>{followers} {followers === 1 ? 'follower' : 'followers'}</span>}
              </p>
            </div>
            {isMe ? (
              <Button to="/dashboard?tab=profile" variant="ghost">Edit profile</Button>
            ) : (
              <Button variant={following ? 'ghost' : 'primary'} onClick={onFollow} aria-pressed={following}>
                {following ? <><Check size={16} /> Following</> : <><UserPlus size={16} /> Follow</>}
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="container-x grid gap-10 py-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <h2 className="eyebrow mb-4">Biography</h2>
          <p className="whitespace-pre-line text-lg leading-relaxed text-white/70">{artist.bio || 'This artist has not written a biography yet.'}</p>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5">
          <h2 className="eyebrow mb-4">Links</h2>
          {links.length === 0 ? (
            <p className="text-sm text-muted">No links added yet.</p>
          ) : (
            <ul className="space-y-2">
              {links.map(([k, v]) => (
                <li key={k}><a href={v} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-2 text-white/80 hover:text-neon"><ExternalLink size={14} /> <span className="capitalize">{k}</span></a></li>
              ))}
            </ul>
          )}
          {artist.demo && <Notice className="mt-5">Demo artist. Following is saved on this device.</Notice>}
        </Reveal>
      </section>

      <section className="container-x py-10">
        <h2 className="eyebrow mb-8">Artwork ({works.length})</h2>
        {works.length === 0 ? (
          <EmptyState title="No published artwork yet" text="Approved artwork will appear here.">{isMe && <Link to="/upload" className="text-neon underline">Upload artwork</Link>}</EmptyState>
        ) : (
          <MasonryGallery items={works} />
        )}
      </section>
    </>
  );
}
