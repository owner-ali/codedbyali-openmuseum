import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Download, Flag, Maximize2, Share2 } from 'lucide-react';
import Seo from '../components/common/Seo';
import Reveal from '../components/common/Reveal';
import Button from '../components/common/Button';
import Notice from '../components/common/Notice';
import ArtPiece from '../components/gallery/ArtPiece';
import FavoriteButton from '../components/gallery/FavoriteButton';
import LikeButton from '../components/gallery/LikeButton';
import ArtCard from '../components/gallery/ArtCard';
import Comments from '../components/artwork/Comments';
import NotFound from './NotFound';
import { useArtModal } from '../context/ArtModalContext';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../context/CatalogContext';
import { downloadArtwork } from '../lib/download.jsx';
import { shareLink, SITE_URL } from '../lib/share';
import { formatDate } from '../lib/format';
import { reportItem } from '../services/community';

export default function ArtworkDetails() {
  const { slug } = useParams();
  const { getArtwork, artworks, artistOf, getCategory, loading } = useCatalog();
  const { user } = useAuth();
  const { open } = useArtModal();
  const [msg, setMsg] = useState('');
  const art = getArtwork(slug);
  if (!art) return loading ? null : <NotFound />;

  const artist = artistOf(art);
  const catName = art.categoryName || getCategory(art.category).name;
  const related = artworks
    .filter((a) => a.id !== art.id && a.category === art.category)
    .concat(artworks.filter((a) => a.id !== art.id && a.category !== art.category && a.artistId === art.artistId))
    .slice(0, 3);

  const flash = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2600);
  };

  const onShare = async () => {
    const r = await shareLink({ title: art.title, url: `${SITE_URL}/artwork/${art.slug}` });
    if (r === 'copied') flash('Link copied');
    else if (r === 'shared') flash('Shared');
    else flash('Could not share');
  };

  const onDownload = async () => {
    try {
      await downloadArtwork(art);
    } catch (e) {
      flash(e.message || 'Download failed');
    }
  };

  const onReport = async () => {
    if (!user) return flash('Log in to report');
    const reason = window.prompt('Why are you reporting this artwork?');
    if (!reason || reason.trim().length < 3) return;
    try {
      await reportItem({ reporterId: user.id, artworkId: art.id, reason });
      flash('Report sent. Thank you.');
    } catch (e) {
      flash(e.message || 'Could not send report');
    }
  };

  return (
    <>
      <Seo title={art.title} description={`${art.title} by ${artist.name}. ${art.description}`.slice(0, 280)} />
      <div className="container-x pb-10 pt-28 sm:pt-36">
        <Link to="/explore" className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 hover:text-neon">
          <ArrowLeft size={16} /> Back to museum
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <Reveal>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[640px] overflow-hidden border border-white/10 bg-panel shadow-[0_0_80px_rgba(124,58,237,.18)]">
              <ArtPiece art={art} fit={art.imageUrl ? 'meet' : 'slice'} />
              <button type="button" onClick={() => open(art, [art])} aria-label="Open full-screen viewer" className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center border border-white/20 bg-ink/60 backdrop-blur hover:border-neon">
                <Maximize2 size={18} />
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="eyebrow mb-4">{catName}</p>
            <h1 className="font-serif text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[1]">{art.title}</h1>
            {artist.slug ? (
              <Link to={`/artists/${artist.slug}`} className="mt-4 inline-block text-lg text-white/75 underline-offset-4 hover:text-neon hover:underline">{artist.name}</Link>
            ) : (
              <p className="mt-4 text-lg text-white/75">{artist.name}</p>
            )}
            <p className="mt-6 whitespace-pre-line leading-relaxed text-white/65">{art.description}</p>

            {art.tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {art.tags.map((t) => <li key={t} className="border border-white/10 px-2.5 py-1 text-xs text-white/60">#{t}</li>)}
              </ul>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-px border border-white/10 bg-white/10 text-sm">
              {[
                ['Published', formatDate(art.createdAt)],
                ['Category', catName],
                ['Licence', art.license],
                ['Price', art.free ? 'Free' : 'Not for sale'],
                ...(art.demo ? [] : [['Likes', art.likeCount], ['Downloads', art.downloads]]),
              ].map(([k, v]) => (
                <div key={k} className="bg-ink p-4">
                  <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">{k}</dt>
                  <dd className="mt-1 text-white/85">{v}</dd>
                </div>
              ))}
            </dl>
            {art.demo && <p className="mt-3 text-xs text-muted">Demo placeholder artwork generated by CodedByAli.</p>}

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <FavoriteButton art={art} />
              <LikeButton art={art} />
              <button type="button" onClick={onShare} className="flex h-10 items-center gap-2 border border-white/15 bg-ink/60 px-3 text-sm hover:border-neon">
                {msg === 'Link copied' ? <Check size={16} className="text-neon" /> : <Share2 size={16} />} Share
              </button>
              {art.free && <Button onClick={onDownload} size="sm"><Download size={16} /> Free download</Button>}
              {!art.demo && (
                <button type="button" onClick={onReport} aria-label="Report artwork" className="flex h-10 w-10 items-center justify-center text-muted hover:text-neon"><Flag size={16} /></button>
              )}
            </div>
            {msg && <Notice className="mt-4">{msg}</Notice>}
          </Reveal>
        </div>
      </div>

      <section className="container-x py-12">
        <h2 className="eyebrow mb-6">Comments</h2>
        <div className="max-w-3xl"><Comments art={art} /></div>
      </section>

      {related.length > 0 && (
        <section className="container-x py-12">
          <h2 className="eyebrow mb-8">More to explore</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => <ArtCard key={a.id} art={a} list={related} aspect="4/5" />)}
          </div>
        </section>
      )}
    </>
  );
}
