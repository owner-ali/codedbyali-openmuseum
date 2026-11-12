import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Seo from '../components/common/Seo';
import Reveal from '../components/common/Reveal';
import AnimatedHeading from '../components/common/AnimatedHeading';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ArtPiece from '../components/gallery/ArtPiece';
import MasonryGallery from '../components/gallery/MasonryGallery';
import { dateRange } from '../components/gallery/ExhibitionCard';
import NotFound from './NotFound';
import { useCatalog } from '../context/CatalogContext';

export default function ExhibitionDetail() {
  const { slug } = useParams();
  const { getExhibition, artworksByIds, artistOf, loading } = useCatalog();
  const ex = getExhibition(slug);
  if (!ex) return loading ? null : <NotFound />;

  const works = artworksByIds(ex.artworks);
  const seen = new Map();
  works.forEach((w) => {
    const a = artistOf(w);
    if (!seen.has(a.id)) seen.set(a.id, a);
  });
  const artists = [...seen.values()];

  return (
    <>
      <Seo title={ex.title} description={`${ex.subtitle} ${ex.description}`.trim().slice(0, 280)} />
      <header className="relative flex min-h-[78svh] items-end overflow-hidden">
        <div className="absolute inset-0"><ArtPiece art={{ ...ex, imageUrl: ex.coverUrl || '', alt: `${ex.title} cover` }} /></div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
        <div className="container-x relative pb-12 pt-40 sm:pb-20">
          <Link to="/exhibitions" className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 hover:text-neon">
            <ArrowLeft size={16} /> All exhibitions
          </Link>
          <p className="eyebrow mb-4">{[dateRange(ex), ex.status === 'published' ? 'Published' : 'Draft'].filter(Boolean).join(' · ')}</p>
          <AnimatedHeading as="h1" text={ex.title} className="max-w-4xl font-serif text-[clamp(2.8rem,9vw,8rem)] font-medium leading-[0.95]" />
          {ex.subtitle && <Reveal delay={0.3}><p className="mt-5 max-w-xl text-lg text-white/75">{ex.subtitle}</p></Reveal>}
        </div>
      </header>

      <section className="container-x grid gap-12 py-16 sm:py-24 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <h2 className="eyebrow mb-5">About the exhibition</h2>
          <p className="whitespace-pre-line text-lg leading-relaxed text-white/70">{ex.description}</p>
          {ex.curator && (
            <>
              <blockquote className="mt-10 border-l-2 border-neon pl-6 font-serif text-2xl italic leading-snug text-white/85 sm:text-3xl">{ex.curator}</blockquote>
              <p className="mt-3 pl-6 text-xs uppercase tracking-[0.2em] text-muted">Curator note</p>
            </>
          )}
        </Reveal>
        {artists.length > 0 && (
          <Reveal delay={0.15} className="lg:col-span-5">
            <h2 className="eyebrow mb-5">Featured artists</h2>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {artists.map((a) => (
                <li key={a.id}>
                  {a.slug ? (
                    <Link to={`/artists/${a.slug}`} className="flex items-center justify-between gap-4 py-4 hover:text-neon">
                      <span><span className="block font-display text-lg font-bold">{a.name}</span><span className="text-sm text-muted">{[a.discipline, a.city].filter(Boolean).join(' · ')}</span></span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <span className="block py-4 font-display text-lg font-bold">{a.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </section>

      <section className="container-x pb-8">
        <h2 className="eyebrow mb-8">Featured artworks</h2>
        {works.length === 0 ? <EmptyState title="No artwork selected yet" text="The curators are still choosing the pieces for this exhibition." /> : <MasonryGallery items={works} />}
        <div className="mt-14 flex flex-wrap gap-3">
          <Button to="/virtual-museum">Visit the virtual museum</Button>
          <Button to="/exhibitions" variant="ghost">More exhibitions</Button>
        </div>
      </section>
    </>
  );
}
