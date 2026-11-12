import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Compass, Landmark, Sparkles } from 'lucide-react';
import Seo from '../components/common/Seo';
import Hero from '../components/home/Hero';
import VirtualPreview from '../components/home/VirtualPreview';
import SectionHeading from '../components/common/SectionHeading';
import AnimatedHeading from '../components/common/AnimatedHeading';
import Reveal from '../components/common/Reveal';
import Button from '../components/common/Button';
import Notice from '../components/common/Notice';
import EmptyState from '../components/common/EmptyState';
import ArtCard from '../components/gallery/ArtCard';
import ArtPiece from '../components/gallery/ArtPiece';
import MasonryGallery from '../components/gallery/MasonryGallery';
import ExhibitionCard from '../components/gallery/ExhibitionCard';
import { useArtModal } from '../context/ArtModalContext';
import { useCatalog } from '../context/CatalogContext';
import { hashString } from '../lib/seed';
import { PALETTES } from '../data/demo';

const PILLARS = [
  { icon: Compass, title: 'Discover', text: 'Search and filter a growing collection across twelve categories, from classical form to pixel art.' },
  { icon: Landmark, title: 'Experience', text: 'Step into themed virtual rooms where artwork hangs on walls, lit like a real museum.' },
  { icon: Sparkles, title: 'Explore', text: 'Follow artists, save favourites and join a community built around making things.' },
];

function Marquee() {
  const { categories } = useCatalog();
  if (!categories.length) return null;
  const items = [...categories, ...categories];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-panel/60 py-5" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {items.map((c, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl font-bold uppercase tracking-tight text-white/20 sm:text-4xl">
            {c.name}
            <span className="text-neon/60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Intro() {
  return (
    <section className="container-x py-20 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal><p className="eyebrow mb-5">The museum</p></Reveal>
          <AnimatedHeading
            text="A museum without walls, built by the people who make the art."
            accent={['walls,']}
            className="font-serif text-[clamp(2.2rem,5.4vw,4.8rem)] font-medium leading-[1.04]"
          />
        </div>
        <div className="lg:col-span-5 lg:pt-14">
          <Reveal delay={0.2}>
            <p className="text-lg leading-relaxed text-white/65">
              CodedByAli OpenMuseum brings timeless masterpieces and emerging digital artists into one cinematic space. Browse the collection, walk the virtual halls and publish your own work for the world to see.
            </p>
          </Reveal>
        </div>
      </div>
      <ul className="mt-16 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <Reveal as="li" key={p.title} delay={i * 0.1} className="bg-ink p-7 sm:p-9">
            <p.icon className="text-neon" size={26} aria-hidden="true" />
            <h3 className="mt-6 font-display text-2xl font-bold">{p.title}</h3>
            <p className="mt-3 leading-relaxed text-white/60">{p.text}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function Masterpieces() {
  const { featured, isLive, loading } = useCatalog();
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Featured masterpieces"
          title="Hand-picked for the entrance hall."
          accent={['entrance']}
          action={<Button to="/explore" variant="ghost">View all artwork <ArrowRight size={16} /></Button>}
        />
        {featured.length === 0 && (
          <EmptyState
            title={loading ? 'Loading the collection' : 'The walls are still empty'}
            text={isLive ? 'Approved artwork will appear here. Be the first to publish.' : ''}
          >
            {!loading && <Button to="/upload">Upload artwork</Button>}
          </EmptyState>
        )}
      </div>
      {featured.length > 0 && (
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:gap-6 sm:px-8 lg:px-12">
          {featured.map((art) => (
            <div key={art.id} className="w-[74vw] shrink-0 snap-start sm:w-[340px] lg:w-[380px]">
              <ArtCard art={art} list={featured} aspect="3/4" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Categories() {
  const { categories, artworks } = useCatalog();
  if (!categories.length) return null;
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHeading eyebrow="Explore categories" title="Twelve ways to look at the world." accent={['Twelve']} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {categories.map((c, i) => {
          const found = artworks.find((a) => a.category === c.slug);
          const art = found || { seed: hashString(c.slug), palette: PALETTES[i % PALETTES.length], alt: '' };
          return (
            <Reveal key={c.slug} delay={(i % 4) * 0.06}>
              <Link to={`/explore?category=${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden border border-white/10 sm:aspect-[4/3]" aria-label={`Explore ${c.name}`}>
                <div className="absolute inset-0 opacity-70 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100">
                  <ArtPiece art={art} variant={found ? undefined : c.style} thumb />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <span className="absolute left-3 top-3 font-display text-xs tracking-[0.3em] text-white/60">{String(i + 1).padStart(2, '0')}</span>
                <ArrowUpRight className="absolute right-3 top-3 text-white/0 transition-all duration-300 group-hover:text-neon" size={20} />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-lg font-bold leading-tight sm:text-2xl">{c.name}</h3>
                  <p className="mt-1 hidden text-xs text-white/60 sm:block">{c.blurb}</p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Exhibitions() {
  const { exhibitions } = useCatalog();
  if (!exhibitions.length) return null;
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHeading
        eyebrow="Featured exhibitions"
        title="Curated journeys through the collection."
        accent={['journeys']}
        action={<Button to="/exhibitions" variant="ghost">All exhibitions <ArrowRight size={16} /></Button>}
      />
      <div className="grid gap-5 md:grid-cols-3">
        {exhibitions.slice(0, 3).map((ex, i) => (
          <Reveal key={ex.slug} delay={i * 0.1}>
            <ExhibitionCard ex={ex} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Artists() {
  const { artists, isLive } = useCatalog();
  if (!artists.length) return null;
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHeading
        eyebrow="Featured artists"
        title="The people behind the work."
        accent={['people']}
        text={isLive ? '' : 'Fictional demo artists for now. Real profiles appear when the database is connected.'}
        action={<Button to="/artists" variant="ghost">Meet the artists <ArrowRight size={16} /></Button>}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {artists.slice(0, 4).map((a, i) => (
          <Reveal key={a.slug} delay={i * 0.08}>
            <Link to={`/artists/${a.slug}`} className="group block border border-white/10 bg-panel p-4 transition-colors hover:border-neon/50 sm:p-5">
              <div className="aspect-square overflow-hidden rounded-full border border-white/10">
                <div className="h-full w-full transition-transform duration-700 group-hover:scale-110">
                  <ArtPiece art={{ ...a, imageUrl: a.avatarUrl, alt: `${a.name} avatar` }} variant="orbs" />
                </div>
              </div>
              <h3 className="mt-5 font-display text-lg font-bold sm:text-xl">{a.name}</h3>
              <p className="mt-1 text-sm text-neon">{a.discipline}</p>
              {a.city && <p className="mt-1 text-xs text-muted">{a.city}</p>}
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Virtual() {
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHeading eyebrow="Immersive virtual gallery" title="Walk the halls from your phone." accent={['halls']} />
      <Reveal><VirtualPreview /></Reveal>
    </section>
  );
}

function Trending() {
  const { open } = useArtModal();
  const { trending, isLive, artistOf, getCategory } = useCatalog();
  if (!trending.length) return null;
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHeading
        eyebrow="Trending artwork"
        title="What the museum is looking at."
        accent={['looking']}
        text={isLive ? 'Ranked by real likes from the community.' : 'Demo ordering. Once the community is live, this ranking uses real likes.'}
      />
      <ol className="border-t border-white/10">
        {trending.map((art, i) => {
          const artist = artistOf(art);
          return (
            <Reveal as="li" key={art.id} delay={i * 0.05} className="border-b border-white/10">
              <button type="button" onClick={() => open(art, trending)} className="group flex w-full items-center gap-4 py-4 text-left sm:gap-8 sm:py-6" aria-label={`Preview ${art.title}`}>
                <span className="w-9 font-display text-2xl font-bold text-white/25 transition-colors group-hover:text-neon sm:w-16 sm:text-5xl">{String(i + 1).padStart(2, '0')}</span>
                <span className="h-16 w-14 shrink-0 overflow-hidden sm:h-24 sm:w-20"><ArtPiece art={art} thumb /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-xl sm:text-3xl">{art.title}</span>
                  <span className="mt-1 block truncate text-sm text-muted">{artist.name} · {art.categoryName || getCategory(art.category).name}</span>
                </span>
                <ArrowUpRight className="shrink-0 text-white/30 transition-all group-hover:text-neon" size={22} />
              </button>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}

function Recent() {
  const { recent, isLive } = useCatalog();
  if (!recent.length) return null;
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHeading
        eyebrow="Recently uploaded"
        title="Fresh from the studio."
        accent={['Fresh']}
        action={<Button to="/explore" variant="ghost">See everything <ArrowRight size={16} /></Button>}
      />
      {!isLive && <Notice className="mb-8">Demo content. Real artwork appears here after it is uploaded and approved by a museum curator.</Notice>}
      <MasonryGallery items={recent} />
    </section>
  );
}

function Community() {
  return (
    <section className="container-x py-16 sm:py-24">
      <div className="relative overflow-hidden border border-white/10 px-6 py-16 text-center sm:px-12 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(50% 70% at 0% 50%, rgba(0,229,255,.2), transparent 70%), radial-gradient(50% 70% at 100% 50%, rgba(168,85,247,.26), transparent 70%)' }}
        />
        <div className="relative">
          <Reveal><p className="eyebrow mb-6 justify-center">Artist community</p></Reveal>
          <AnimatedHeading
            text="Your work belongs in a museum."
            accent={['museum.']}
            className="mx-auto max-w-4xl font-display text-[clamp(2.2rem,6vw,5rem)] font-bold leading-[1] tracking-tight"
          />
          <Reveal delay={0.3}>
            <p className="mx-auto mt-6 max-w-xl text-white/65">
              Create an artist profile, publish your artwork for curator review and share it with people who love looking.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button to="/register" size="lg">Create artist profile</Button>
              <Button to="/upload" size="lg" variant="ghost">Upload artwork</Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { settings } = useCatalog();
  const note = typeof settings.announcement === 'string' ? settings.announcement.trim() : '';
  return (
    <>
      <Seo
        title="Discover Art. Experience History. Explore Creativity."
        description="A futuristic digital art museum and global artist community. Explore masterpieces, discover emerging artists and step inside virtual exhibitions."
        path="/"
      />
      <Hero />
      {note && (
        <div className="border-b border-neon/20 bg-neon/[0.06] px-5 py-3 text-center text-sm text-white/85">{note}</div>
      )}
      <Marquee />
      <Intro />
      <Masterpieces />
      <Categories />
      <Exhibitions />
      <Artists />
      <Virtual />
      <Trending />
      <Recent />
      <Community />
    </>
  );
}
