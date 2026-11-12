import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Notice from '../components/common/Notice';
import EmptyState from '../components/common/EmptyState';
import Reveal from '../components/common/Reveal';
import ArtPiece from '../components/gallery/ArtPiece';
import { useCatalog } from '../context/CatalogContext';

export default function Artists() {
  const { artists, isLive, loading, artworksByArtist } = useCatalog();
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return artists.filter((a) => !t || [a.name, a.city, a.discipline].join(' ').toLowerCase().includes(t));
  }, [q, artists]);

  return (
    <>
      <Seo title="Artists" description="Meet the artists of CodedByAli OpenMuseum: painters, sculptors, photographers and generative artists." />
      <PageHero eyebrow="Artists" title="Meet the people behind the work." accent={['people']} description="Browse artist profiles, see their artwork and follow the ones you love." />
      <section className="container-x pb-8">
        {!isLive && <Notice className="mb-8">These are fictional demo artists. Real artist profiles appear when the database is connected.</Notice>}
        <label htmlFor="artist-search" className="sr-only">Search artists</label>
        <input id="artist-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, city or discipline" className="mb-8 h-14 w-full max-w-xl border border-white/15 bg-white/[0.03] px-4 text-base outline-none placeholder:text-white/30 focus:border-neon" />
        {list.length === 0 ? (
          <EmptyState icon={SearchX} title={loading ? 'Loading artists' : 'No artists found'} text="Artists appear here once they have approved artwork." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((a, i) => (
              <Reveal key={a.slug} delay={(i % 4) * 0.06}>
                <Link to={`/artists/${a.slug}`} className="group flex h-full flex-col border border-white/10 bg-panel p-5 transition-colors hover:border-neon/50">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/10">
                      <ArtPiece art={{ ...a, imageUrl: a.avatarUrl, alt: `${a.name} avatar` }} variant="orbs" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-xl font-bold">{a.name}</h2>
                      <p className="truncate text-sm text-neon">{a.discipline}</p>
                    </div>
                  </div>
                  {a.bio && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/60">{a.bio}</p>}
                  <p className="mt-auto pt-5 text-xs text-muted">{[a.city, `${artworksByArtist(a.id).length} ${a.demo ? 'demo ' : ''}works`].filter(Boolean).join(' · ')}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
