import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ArtPiece from '../gallery/ArtPiece';
import Button from '../common/Button';
import { useCatalog } from '../../context/CatalogContext';
import { isFinePointer } from '../../lib/device';

const SLOTS = [
  { left: '4%', top: '24%', width: '24%', transform: 'rotateY(42deg) translateZ(-80px)' },
  { left: '32%', top: '14%', width: '36%', transform: 'translateZ(40px)' },
  { right: '4%', top: '24%', width: '24%', transform: 'rotateY(-42deg) translateZ(-80px)' },
];

export default function VirtualPreview() {
  const { featured } = useCatalog();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18 });
  const sy = useSpring(my, { stiffness: 80, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [4, -4]);

  const onMove = (e) => {
    if (!isFinePointer()) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  // order: left, centre, right
  const picks = [featured[1], featured[0], featured[2]];

  return (
    <div className="relative overflow-hidden border border-white/10 bg-panel" onMouseMove={onMove}>
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(50% 50% at 50% 30%, rgba(168,85,247,.28), transparent 70%), radial-gradient(40% 40% at 15% 80%, rgba(0,229,255,.18), transparent 70%)' }}
      />
      <div className="relative h-[380px] sm:h-[500px] lg:h-[580px]" style={{ perspective: '1100px' }}>
        <motion.div className="absolute inset-0" style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
          <div
            className="absolute inset-x-[-20%] bottom-0 h-[55%]"
            style={{
              transform: 'rotateX(72deg)',
              transformOrigin: 'bottom',
              background: 'linear-gradient(to top, rgba(0,229,255,.22), rgba(7,7,10,0) 85%), repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 60px)',
            }}
          />
          {picks.map((art, i) =>
            art ? (
              <div key={art.id} className="absolute border-[6px] border-[#1c1c26] bg-ink shadow-[0_20px_60px_rgba(0,0,0,.6)]" style={{ ...SLOTS[i], aspectRatio: '4/5' }}>
                <ArtPiece art={art} thumb />
                <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,.45)]" />
              </div>
            ) : null,
          )}
        </motion.div>
      </div>
      <div className="relative flex flex-col items-start justify-between gap-4 border-t border-white/10 bg-ink/60 p-5 backdrop-blur sm:flex-row sm:items-center sm:p-6">
        <p className="max-w-md text-sm text-white/65">
          Walk through six themed rooms, from Ancient Civilization to Abstract World, in real 3D.
        </p>
        <Button to="/virtual-museum">Enter the virtual museum</Button>
      </div>
    </div>
  );
}
