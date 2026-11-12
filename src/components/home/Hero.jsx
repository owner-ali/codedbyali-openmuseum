import HeroStage from '../3d/HeroStage';
import AnimatedHeading from '../common/AnimatedHeading';
import Button from '../common/Button';
import CountUp from '../common/CountUp';
import Reveal from '../common/Reveal';
import { useCatalog } from '../../context/CatalogContext';
import { bootDelay } from '../../lib/boot';

const DEFAULTS = {
  hero_label: 'The Future of Digital Art',
  hero_heading: 'Where Art Meets Imagination.',
  hero_description:
    'Enter a world of extraordinary creativity. Explore timeless masterpieces, discover emerging artists and experience digital art beyond boundaries.',
};

export default function Hero() {
  const d = bootDelay();
  const { isLive, settings, counts, categories, rooms, exhibitions } = useCatalog();
  const text = (k) => (typeof settings[k] === 'string' && settings[k].trim() ? settings[k] : DEFAULTS[k]);
  const heading = text('hero_heading');
  // Live mode shows real database counts; demo mode shows honest structure numbers.
  const STATS =
    isLive && counts
      ? [
          { value: counts.artworks, label: 'Artworks' },
          { value: counts.artists, label: 'Artists' },
          { value: counts.exhibitions, label: 'Exhibitions' },
        ]
      : [
          { value: categories.length, label: 'Art categories' },
          { value: rooms.length, label: 'Virtual rooms' },
          { value: exhibitions.length, label: 'Exhibition themes' },
        ];
  return (
    <section className="relative isolate overflow-hidden bg-ink md:flex md:min-h-[100svh] md:items-end" aria-label="Introduction">
      {/* ambient light */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(55% 55% at 12% 38%, rgba(0,229,255,.2), transparent 70%), radial-gradient(55% 55% at 92% 42%, rgba(168,85,247,.26), transparent 70%), radial-gradient(40% 30% at 60% 100%, rgba(124,58,237,.18), transparent 70%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)', backgroundSize: '72px 72px', maskImage: 'radial-gradient(60% 60% at 60% 45%, #000, transparent 75%)', WebkitMaskImage: 'radial-gradient(60% 60% at 60% 45%, #000, transparent 75%)' }} />

      {/* 3D statue */}
      <div className="relative mt-16 h-[56svh] min-h-[340px] md:absolute md:inset-y-0 md:right-0 md:mt-0 md:h-auto md:w-[60%]">
        <HeroStage />
      </div>

      {/* copy */}
      <div className="container-x pointer-events-none relative z-10 pb-14 pt-4 md:pb-20 md:pt-40">
        <Reveal>
          <p className="eyebrow mb-5">{text('hero_label')}</p>
        </Reveal>
        <AnimatedHeading
          as="h1"
          key={heading}
          text={heading}
          accent={heading.split(' ').slice(-1)}
          delay={d}
          className="max-w-[12ch] font-display text-[clamp(2.4rem,6.4vw,6.6rem)] font-bold leading-[0.95] tracking-tight"
        />
        <Reveal delay={d + 0.5}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {text('hero_description')}
          </p>
        </Reveal>
        <Reveal delay={d + 0.65}>
          <div className="pointer-events-auto mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/explore" size="lg">Explore the museum</Button>
            <Button to="/register" size="lg" variant="ghost">Become an artist</Button>
          </div>
        </Reveal>
        <Reveal delay={d + 0.8}>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <dd className="font-display text-3xl font-bold text-white sm:text-4xl">
                  <CountUp to={s.value} />
                </dd>
                <dt className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted sm:text-xs">{s.label}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-lg text-xs leading-relaxed text-muted">
            {isLive && counts
              ? 'Live counts from the museum database.'
              : 'Museum structure shown above. Live community counts appear once the database is connected. Artwork on this site is demo content.'}
          </p>
        </Reveal>
      </div>

      <div className="pointer-events-none absolute bottom-5 right-6 hidden items-center gap-3 font-display text-[0.65rem] uppercase tracking-[0.3em] text-white/50 md:flex">
        Scroll
        <span className="relative flex h-9 w-5 items-start justify-center rounded-full border border-white/30 pt-1.5">
          <span className="block h-1.5 w-1 animate-scrollDot rounded-full bg-neon" />
        </span>
      </div>
    </section>
  );
}
