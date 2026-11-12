import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import TiltCard from '../common/TiltCard';
import ArtPiece from './ArtPiece';
import { formatDate } from '../../lib/format';

export function dateRange(ex) {
  if (!ex.start && !ex.end) return '';
  if (!ex.end) return formatDate(ex.start);
  if (!ex.start) return `Until ${formatDate(ex.end)}`;
  return `${formatDate(ex.start)} — ${formatDate(ex.end)}`;
}

export default function ExhibitionCard({ ex, index = 0, className = '' }) {
  const cover = { ...ex, imageUrl: ex.coverUrl || '', alt: `${ex.title} exhibition cover` };
  return (
    <TiltCard className={className}>
      <Link to={`/exhibitions/${ex.slug}`} className="group relative block overflow-hidden border border-white/10 bg-panel" aria-label={`${ex.title} exhibition`}>
        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]">
            <ArtPiece art={cover} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          <span className="absolute left-4 top-4 font-display text-xs tracking-[0.3em] text-white/70">{String(index + 1).padStart(2, '0')}</span>
          {ex.demo && (
            <span className="absolute right-4 top-4 border border-white/20 bg-ink/50 px-2 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-white/70 backdrop-blur">Demo</span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <p className="font-display text-[0.62rem] uppercase tracking-[0.24em] text-neon">{dateRange(ex)}</p>
            <h3 className="mt-2 font-serif text-3xl leading-[1.05] sm:text-4xl">{ex.title}</h3>
            {ex.subtitle && <p className="mt-2 text-sm text-white/65">{ex.subtitle}</p>}
            <span className="mt-4 inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.18em] text-white/80 transition-colors group-hover:text-neon">
              Enter exhibition <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
        <span className="pointer-events-none absolute inset-0 border border-neon/0 transition-colors duration-500 group-hover:border-neon/50" />
      </Link>
    </TiltCard>
  );
}
