import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import ArtPiece from './ArtPiece';

// Lightweight CSS 3D gallery wall. Used when WebGL is unavailable or the 3D scene fails.
export default function GalleryCss({ works, room, index, setIndex, go, onInspect }) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 50% at 50% 35%, ${room.palette[0]}33, transparent 70%), radial-gradient(50% 50% at 90% 90%, ${room.palette[1]}33, transparent 70%), linear-gradient(#0c0c13, #07070A)`,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[34%]" style={{ background: 'linear-gradient(to top, rgba(255,255,255,.06), transparent), repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 70px)' }} />
      <div className="absolute inset-x-0 bottom-[34%] h-px bg-white/10" />
      <motion.div
        className="absolute inset-0 touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(1);
          else if (info.offset.x > 60) go(-1);
        }}
        style={{ perspective: 1200 }}
      >
        {works.map((art, i) => {
          let off = i - index;
          if (off > works.length / 2) off -= works.length;
          if (off < -works.length / 2) off += works.length;
          if (Math.abs(off) > 2) return null;
          const active = off === 0;
          return (
            <motion.div
              key={art.id}
              className="absolute left-1/2 top-[44%]"
              style={{ width: 'clamp(150px, 30vw, 320px)', zIndex: 10 - Math.abs(off) }}
              initial={false}
              animate={{ x: `calc(-50% + ${off * 62}%)`, y: '-50%', scale: active ? 1 : 0.68, rotateY: -off * 26, opacity: active ? 1 : 0.55 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
              <button
                type="button"
                onClick={() => (active ? onInspect(art) : setIndex(i))}
                aria-label={active ? `Inspect ${art.title}` : `Move to ${art.title}`}
                className="group relative block aspect-[4/5] w-full border-[6px] border-[#1c1c26] bg-ink shadow-[0_30px_70px_rgba(0,0,0,.7)]"
              >
                <ArtPiece art={art} />
                <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,.4)]" />
                {active && (
                  <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                    <span className="absolute inset-0 animate-pulseRing rounded-full border border-neon" />
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/70 text-neon backdrop-blur"><Search size={16} /></span>
                  </span>
                )}
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
