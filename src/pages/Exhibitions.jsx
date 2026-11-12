import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import Reveal from '../components/common/Reveal';
import Notice from '../components/common/Notice';
import EmptyState from '../components/common/EmptyState';
import ExhibitionCard from '../components/gallery/ExhibitionCard';
import { useCatalog } from '../context/CatalogContext';

export default function Exhibitions() {
  const { exhibitions, isLive, loading } = useCatalog();
  return (
    <>
      <Seo title="Exhibitions" description="Curated digital exhibitions at CodedByAli OpenMuseum, from The Universe Beyond to AI Imagination." />
      <PageHero
        eyebrow="Exhibitions"
        title="Curated journeys through the collection."
        accent={['journeys']}
        description="Each exhibition gathers artwork around one idea."
      />
      <section className="container-x pb-8">
        {!isLive && <Notice className="mb-8">Demo exhibitions. Admins create real exhibitions and choose Published or Draft status.</Notice>}
        {exhibitions.length === 0 ? (
          <EmptyState title={loading ? 'Loading exhibitions' : 'No exhibitions yet'} text="Published exhibitions will appear here." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {exhibitions.map((ex, i) => (
              <Reveal key={ex.slug} delay={(i % 3) * 0.08}>
                <ExhibitionCard ex={ex} index={i} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
