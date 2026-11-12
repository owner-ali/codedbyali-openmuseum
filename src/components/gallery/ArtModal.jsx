import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Download, Maximize2, Share2, X } from 'lucide-react';
import ArtPiece from './ArtPiece';
import FavoriteButton from './FavoriteButton';
import LikeButton from './LikeButton';
import { useArtModal } from '../../context/ArtModalContext';
import { useCatalog } from '../../context/CatalogContext';
import { downloadArtwork } from '../../lib/download.jsx';
import { shareLink, SITE_URL } from '../../lib/share';

export default function ArtModal() {
  const { active, list, close, step } = useArtModal();
  const { artistOf, getCategory } = useCatalog();
  const [full, setFull] = useState(false);
  const [msg, setMsg] = useState('');
  const closeRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (full) setFull(false);
        else close();
      } else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [active, full, close, step]);

  useEffect(() => {
    if (!active) setFull(false);
    setMsg('');
  }, [active]);

  const flash = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2200);
  };

  const onShare = async () => {
    if (!active) return;
    const r = await shareLink({ title: active.title, url: `${SITE_URL}/artwork/${active.slug}` });
    if (r === 'copied') flash('Link copied');
    else if (r === 'shared') flash('Shared');
  };

  const onDownload = async () => {
    try {
      await downloadArtwork(active);
    } catch (e) {
      flash(e.message || 'Download failed');
    }
  };

  const artist = active ? artistOf(active) : null;
  const catName = active ? active.categoryName || getCategory(active.category).name : '';

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="modal"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/85 p-0 backdrop-blur-md sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`${active.title} preview`}
        >
          <motion.div
            key={active.id}
            className="relative grid max-h-[100svh] w-full max-w-6xl overflow-y-auto border border-white/10 bg-panel md:max-h-[90svh] md:grid-cols-[1.2fr_1fr]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/5] max-h-[70svh] w-full bg-ink md:aspect-auto md:max-h-none md:min-h-[520px]">
              <ArtPiece art={active} fit={active.imageUrl ? 'meet' : 'slice'} />
              <button type="button" onClick={() => setFull(true)} aria-label="Open full-screen viewer" className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center border border-white/20 bg-ink/60 backdrop-blur hover:border-neon">
                <Maximize2 size={18} />
              </button>
              {list.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label="Previous artwork" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-ink/60 backdrop-blur hover:border-neon">
                    <ChevronLeft size={20} />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label="Next artwork" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-ink/60 backdrop-blur hover:border-neon">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-8">
              <button ref={closeRef} type="button" onClick={close} aria-label="Close preview" className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center border border-white/15 bg-ink/70 hover:border-neon md:bg-transparent">
                <X size={20} />
              </button>
              <p className="font-display text-[0.65rem] uppercase tracking-[0.25em] text-neon">{catName}</p>
              <h2 className="mt-3 pr-10 font-serif text-3xl leading-tight sm:text-4xl">{active.title}</h2>
              {artist.slug ? (
                <Link to={`/artists/${artist.slug}`} onClick={close} className="mt-2 text-white/70 underline-offset-4 hover:text-neon hover:underline">
                  {artist.name}
                </Link>
              ) : (
                <p className="mt-2 text-white/70">{artist.name}</p>
              )}
              <p className="mt-5 leading-relaxed text-white/65">{active.description}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {active.tags.map((t) => (
                  <li key={t} className="border border-white/10 px-2.5 py-1 text-xs text-white/60">#{t}</li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted">
                {active.demo ? 'Demo placeholder artwork generated by CodedByAli. ' : ''}Licence: {active.license}.
              </p>

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-8">
                <FavoriteButton art={active} />
                <LikeButton art={active} />
                <button type="button" onClick={onShare} aria-label="Share artwork link" className="flex h-10 items-center gap-2 border border-white/15 bg-ink/60 px-3 text-sm hover:border-neon">
                  {msg === 'Link copied' ? <Check size={16} className="text-neon" /> : <Share2 size={16} />}
                  {msg || 'Share'}
                </button>
                {active.free && (
                  <button type="button" onClick={onDownload} className="flex h-10 items-center gap-2 border border-white/15 bg-ink/60 px-3 text-sm hover:border-neon">
                    <Download size={16} /> Free download
                  </button>
                )}
                <Link to={`/artwork/${active.slug}`} onClick={close} className="ml-auto flex h-10 items-center gap-2 bg-neon px-4 font-display text-xs font-medium uppercase tracking-[0.14em] text-ink hover:bg-white">
                  Details <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {full && (
              <motion.div
                key="full"
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setFull(false);
                }}
              >
                <div className="h-full w-full max-w-[1100px] p-3 sm:p-8">
                  <ArtPiece art={active} fit="meet" />
                </div>
                <button type="button" onClick={() => setFull(false)} aria-label="Close full-screen viewer" className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center border border-white/25 bg-ink/70 hover:border-neon">
                  <X size={22} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
