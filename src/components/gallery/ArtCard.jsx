import { motion, useReducedMotion } from 'framer-motion';
import ArtPiece from './ArtPiece';
import FavoriteButton from './FavoriteButton';
import { useArtModal } from '../../context/ArtModalContext';
import { useCatalog } from '../../context/CatalogContext';

export default function ArtCard({ art, list, aspect, className = '' }) {
  const { open } = useArtModal();
  const { artistOf, getCategory } = useCatalog();
  const reduce = useReducedMotion();
  const artist = artistOf(art);
  const catName = art.categoryName || getCategory(art.category).name;

  return (
    <motion.article
      className={`group relative ${className}`}
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -6% 0px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={() => open(art, list)}
        aria-label={`Preview ${art.title} by ${artist.name}`}
        className="relative block w-full overflow-hidden bg-panel text-left"
        style={{ aspectRatio: aspect || art.aspect }}
      >
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]">
          <ArtPiece art={art} thumb />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
        {art.demo && (
          <span className="absolute left-3 top-3 border border-white/20 bg-ink/50 px-2 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-white/70 backdrop-blur">
            Demo
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="font-display text-[0.62rem] uppercase tracking-[0.24em] text-neon">{catName}</p>
          <h3 className="mt-1 font-serif text-2xl leading-tight sm:text-[1.7rem]">{art.title}</h3>
          <p className="mt-1 text-sm text-white/60">{artist.name}</p>
        </div>
        <span className="pointer-events-none absolute inset-0 border border-white/0 transition-colors duration-500 group-hover:border-neon/60" />
      </button>
      <FavoriteButton art={art} className="absolute right-3 top-3" />
    </motion.article>
  );
}
