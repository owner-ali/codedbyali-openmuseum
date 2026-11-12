import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, SearchX } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Notice from '../components/common/Notice';
import EmptyState from '../components/common/EmptyState';
import Reveal from '../components/common/Reveal';
import ArtPiece from '../components/gallery/ArtPiece';
import { useArtModal } from '../context/ArtModalContext';
import { useCatalog } from '../context/CatalogContext';
import { downloadArtwork } from '../lib/download.jsx';

const COLLECTIONS = [
  { title: 'Wallpapers', text: 'Art sized for your screens.', category: 'wallpapers' },
  { title: 'Pixel Art', text: 'Small squares, big worlds.', category: 'pixel-art' },
  { title: 'Abstract Colour', text: 'Pure rhythm and tone.', category: 'abstract-art' },
];

export default function Store() {
  const { open } = useArtModal();
  const { artworks, categories, artistOf, getCategory, isLive } = useCatalog();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [err, setErr] = useState('');

  const free = useMemo(() => artworks.filter((a) => a.free), [artworks]);
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return free.filter((a) => {
      if (cat !== 'all' && a.category !== cat) return false;
      if (!term) return true;
      return [a.title, artistOf(a).name, ...a.tags].join(' ').toLowerCase().includes(term);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [free, q, cat]);

  const download = async (art) => {
    setErr('');
    try {
      await downloadArtwork(art);
    } catch (e) {
      setErr(e.message || 'Download failed.');
    }
  };

  return (
    <>
      <Seo title="Digital Art Store" description="Free digital artwork downloads with clear licence and attribution information from CodedByAli OpenMuseum." />
      <PageHero
        eyebrow="Digital art store"
        title="Free art, clearly licensed."
        accent={['licensed.']}
        description="Download artwork with its licence and attribution spelled out. Paid marketplace features may come later; today every listing is free."
      />

      <section className="container-x pb-8">
        <Notice>Purchases are not available. Nothing here costs money, and no payment details are ever requested.</Notice>
        {err && <Notice className="mt-4">{err}</Notice>}
      </section>

      <section className="container-x py-10">
        <h2 className="mb-6 font-display text-[0.7rem] uppercase tracking-[0.25em] text-neon">Featured collections</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {COLLECTIONS.map((c, i) => {
            const sample = free.find((a) => a.category === c.category);
            const fallback = { seed: i * 977 + 11, palette: ['#00E5FF', '#A855F7', '#1b1035'], alt: '' };
            return (
              <Reveal key={c.title} delay={i * 0.08}>
                <button type="button" onClick={() => setCat(c.category)} className="group relative block aspect-[16/10] w-full overflow-hidden border border-white/10 text-left" aria-label={`Show ${c.title} collection`}>
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                    <ArtPiece art={sample || fallback} variant={sample ? undefined : ['waves', 'pixel', 'orbs'][i]} thumb />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink to-ink/10" />
                  <div className="absolute bottom-0 p-5">
                    <h3 className="font-serif text-3xl">{c.title}</h3>
                    <p className="text-sm text-white/65">{c.text}</p>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="container-x py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <label htmlFor="store-search" className="sr-only">Search the store</label>
          <input id="store-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search store" className="h-14 flex-1 border border-white/15 bg-white/[0.03] px-4 text-base outline-none placeholder:text-white/30 focus:border-neon" />
          <label htmlFor="store-cat" className="sr-only">Category</label>
          <select id="store-cat" value={cat} onChange={(e) => setCat(e.target.value)} className="h-14 border border-white/15 bg-panel px-4 text-base outline-none focus:border-neon md:w-64">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        {list.length === 0 ? (
          <EmptyState icon={SearchX} title="Nothing matches" text={isLive && free.length === 0 ? 'Free downloads appear here once artwork is approved.' : 'Try another search or category.'} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((art, i) => {
              const artist = artistOf(art);
              return (
                <Reveal key={art.id} delay={(i % 4) * 0.05}>
                  <article className="flex h-full flex-col border border-white/10 bg-panel">
                    <button type="button" onClick={() => open(art, list)} className="relative block aspect-[4/5] overflow-hidden" aria-label={`Preview ${art.title}`}>
                      <ArtPiece art={art} thumb />
                    </button>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="font-display text-[0.6rem] uppercase tracking-[0.22em] text-neon">{art.categoryName || getCategory(art.category).name}</p>
                      <h3 className="mt-1 font-serif text-2xl leading-tight">
                        <Link to={`/artwork/${art.slug}`} className="hover:text-neon">{art.title}</Link>
                      </h3>
                      <p className="mt-1 text-sm text-white/60">
                        by {artist.slug ? <Link to={`/artists/${artist.slug}`} className="underline-offset-4 hover:text-neon hover:underline">{artist.name}</Link> : artist.name}
                      </p>
                      <p className="mt-3 text-xs text-muted">
                        Free · Licence: {art.license} · Attribution: {artist.name}
                        {!art.demo && ` · ${art.downloads} ${art.downloads === 1 ? 'download' : 'downloads'}`}
                      </p>
                      <button type="button" onClick={() => download(art)} className="mt-4 flex h-11 items-center justify-center gap-2 border border-white/20 font-display text-xs uppercase tracking-[0.14em] hover:border-neon hover:text-neon">
                        <Download size={16} /> Free download
                      </button>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
