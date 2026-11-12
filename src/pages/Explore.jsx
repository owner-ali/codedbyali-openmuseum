import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SearchX, X } from 'lucide-react';
import Seo from '../components/common/Seo';
import PageHero from '../components/common/PageHero';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Notice from '../components/common/Notice';
import MasonryGallery from '../components/gallery/MasonryGallery';
import { useCatalog } from '../context/CatalogContext';

const PAGE = 12;

export default function Explore() {
  const { artworks, categories, isLive, loading, error, artistOf, getCategory } = useCatalog();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || 'all';
  const sort = params.get('sort') || 'newest';
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => setVisible(PAGE), [q, category, sort]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || (key === 'sort' && value === 'newest')) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = artworks.filter((a) => {
      if (category !== 'all' && a.category !== category) return false;
      if (!term) return true;
      const hay = [a.title, artistOf(a).name, a.categoryName || getCategory(a.category).name, ...a.tags].join(' ').toLowerCase();
      return hay.includes(term);
    });
    list = [...list];
    if (sort === 'oldest') list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    else if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'popular') list.sort((a, b) => b.likeCount - a.likeCount);
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworks, q, category, sort]);

  const shown = results.slice(0, visible);

  return (
    <>
      <Seo title="Explore the Museum" description="Search and filter digital art, photography, 3D, classical, abstract, pixel art and more in the CodedByAli OpenMuseum collection." />
      <PageHero
        eyebrow="Explore the museum"
        title="Search the whole collection."
        accent={['collection.']}
        description="Filter by category, search by title, artist or tag, and open any piece for a closer look."
      />

      <section className="container-x pb-10">
        {!isLive && (
          <Notice className="mb-8">
            Demo collection of {artworks.length} generated artworks. Popularity sorting uses real likes once the database is connected.
          </Notice>
        )}
        {error && <Notice className="mb-8">Could not load the museum: {error}</Notice>}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label htmlFor="explore-search" className="sr-only">Search artwork or artist</label>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="explore-search"
              type="search"
              value={q}
              onChange={(e) => update('q', e.target.value)}
              placeholder="Search artwork, artist or tag"
              className="h-14 w-full border border-white/15 bg-white/[0.03] pl-12 pr-12 text-base outline-none placeholder:text-white/30 focus:border-neon"
            />
            {q && (
              <button type="button" onClick={() => update('q', '')} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-muted hover:text-white">
                <X size={18} />
              </button>
            )}
          </div>
          <div>
            <label htmlFor="explore-sort" className="sr-only">Sort artwork</label>
            <select id="explore-sort" value={sort} onChange={(e) => update('sort', e.target.value)} className="h-14 w-full border border-white/15 bg-panel px-4 text-base outline-none focus:border-neon lg:w-60">
              <option value="newest">Newest first</option>
              <option value="popular">Most popular (likes)</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A to Z</option>
            </select>
          </div>
        </div>

        <div className="no-scrollbar -mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
          {[{ slug: 'all', name: 'All' }, ...categories].map((c) => {
            const on = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => update('category', c.slug)}
                aria-pressed={on}
                className={`shrink-0 border px-4 py-2.5 font-display text-xs uppercase tracking-[0.14em] transition-colors ${on ? 'border-neon bg-neon text-ink' : 'border-white/15 text-white/70 hover:border-neon hover:text-neon'}`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        <p className="mb-6 text-sm text-muted" aria-live="polite">
          {loading ? 'Loading…' : `${results.length} ${results.length === 1 ? 'artwork' : 'artworks'}`}
        </p>

        {!loading && results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={artworks.length === 0 ? 'No artwork has been published yet' : 'No artwork found'}
            text={artworks.length === 0 ? 'Approved artwork will appear here.' : 'Try a different word, or clear the filters to see the full collection.'}
          >
            {artworks.length === 0 ? <Button to="/upload">Upload the first artwork</Button> : <Button variant="ghost" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>}
          </EmptyState>
        ) : (
          <MasonryGallery items={shown} />
        )}

        {shown.length < results.length && (
          <div className="mt-12 text-center">
            <Button variant="ghost" size="lg" onClick={() => setVisible((v) => v + PAGE)}>
              Load more ({results.length - shown.length} left)
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
