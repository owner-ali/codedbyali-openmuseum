import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Notice from '../components/common/Notice';
import EmptyState from '../components/common/EmptyState';
import ErrorBoundary from '../components/common/ErrorBoundary';
import GalleryCss from '../components/gallery/GalleryCss';
import { useArtModal } from '../context/ArtModalContext';
import { useCatalog } from '../context/CatalogContext';
import { hasWebGL, isLowPower, prefersReducedMotion } from '../lib/device';

const MuseumScene = lazy(() => import('../components/3d/MuseumScene'));

export default function VirtualMuseum() {
  const { open } = useArtModal();
  const { rooms, roomWorks, getArtist, loading } = useCatalog();
  const [roomIdx, setRoomIdx] = useState(0);
  const [index, setIndex] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const [cfg, setCfg] = useState(null);
  const [visible, setVisible] = useState(true);
  const stageRef = useRef(null);

  const room = rooms[roomIdx];
  const works = roomWorks(room);
  const canFullscreen = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;

  useEffect(() => {
    setCfg({ webgl: hasWebGL(), quality: isLowPower() ? 'low' : 'high', reduced: prefersReducedMotion() });
  }, []);

  useEffect(() => setIndex(0), [roomIdx]);

  const go = useCallback((dir) => setIndex((i) => (works.length ? (i + dir + works.length) % works.length : 0)), [works.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
    };
    const onFs = () => setIsFull(!!document.fullscreenElement);
    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, [go]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen?.().catch(() => {});
  };

  const inspect = useCallback((art) => open(art, works), [open, works]);
  const current = works[index];
  const artist = current ? getArtist(current.artistId) : null;
  const css = (
    <GalleryCss works={works} room={room} index={index} setIndex={setIndex} go={go} onInspect={inspect} />
  );

  return (
    <>
      <Seo title="Virtual Museum" description="Walk through six themed 3D rooms at CodedByAli OpenMuseum, from Ancient Civilization to Abstract World." />
      <PageHero
        eyebrow="Virtual museum"
        title="Step inside the gallery."
        accent={['inside']}
        description="Pick a room and glide from artwork to artwork. Use the arrows, swipe, or your keyboard, and tap the glowing + to inspect a piece."
      />

      <section className="container-x pb-6">
        <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0" role="tablist" aria-label="Museum rooms">
          {rooms.map((r, i) => (
            <button
              key={r.slug}
              type="button"
              role="tab"
              aria-selected={i === roomIdx}
              onClick={() => setRoomIdx(i)}
              className={`shrink-0 border px-4 py-3 text-left transition-colors ${i === roomIdx ? 'border-neon bg-neon/10' : 'border-white/15 hover:border-white/40'}`}
            >
              <span className="block font-display text-[0.6rem] tracking-[0.25em] text-muted">ROOM {String(i + 1).padStart(2, '0')}</span>
              <span className={`mt-0.5 block font-display text-sm font-bold ${i === roomIdx ? 'text-neon' : ''}`}>{r.name}</span>
            </button>
          ))}
        </div>

        {works.length === 0 ? (
          <EmptyState title={loading ? 'Loading the gallery' : 'This room is empty'} text="Artwork approved by curators in the matching categories will hang here." />
        ) : (
          <div ref={stageRef} className={`relative overflow-hidden border border-white/10 bg-ink ${isFull ? 'h-screen' : 'h-[68svh] min-h-[460px]'}`}>
            {!cfg ? null : !cfg.webgl ? (
              css
            ) : (
              <ErrorBoundary fallback={css}>
                <Suspense fallback={css}>
                  <MuseumScene
                    key={room.slug}
                    works={works}
                    room={room}
                    index={Math.min(index, works.length - 1)}
                    onSelect={setIndex}
                    onInspect={inspect}
                    quality={cfg.quality}
                    reduced={cfg.reduced}
                    active={visible}
                  />
                </Suspense>
              </ErrorBoundary>
            )}

            <button type="button" onClick={() => go(-1)} aria-label="Previous artwork" className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/20 bg-ink/60 backdrop-blur hover:border-neon">
              <ChevronLeft />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next artwork" className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/20 bg-ink/60 backdrop-blur hover:border-neon">
              <ChevronRight />
            </button>
            {canFullscreen && (
              <button type="button" onClick={toggleFull} aria-label={isFull ? 'Exit full-screen museum' : 'Enter full-screen museum'} className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center border border-white/20 bg-ink/60 backdrop-blur hover:border-neon">
                {isFull ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            )}

            {current && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink via-ink/70 to-transparent px-5 pb-5 pt-14 text-center">
                <p className="font-display text-[0.65rem] uppercase tracking-[0.3em] text-neon">{room.name} · {index + 1} / {works.length}</p>
                <p className="mt-1 font-serif text-2xl sm:text-3xl" aria-live="polite">{current.title}</p>
                <p className="text-sm text-white/60">{artist?.name}</p>
              </div>
            )}
          </div>
        )}

        {cfg && !cfg.webgl && <Notice className="mt-6">Your device does not support WebGL, so you are seeing the lightweight 2D gallery wall.</Notice>}
      </section>
    </>
  );
}
