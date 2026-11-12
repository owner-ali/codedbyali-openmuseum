import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LogoMark } from './Logo';
import { markBooted } from '../../lib/boot';

export default function Loader({ onDone }) {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const duration = reduce ? 400 : 1500;
    let raf;
    let start;
    let timer;
    const tick = (t) => {
      if (start === undefined) start = t;
      const p = Math.min(1, (t - start) / duration);
      setPct(Math.round((1 - Math.pow(1 - p, 2)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        markBooted();
        timer = setTimeout(onDone, 250);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      document.body.style.overflow = prev;
    };
  }, [onDone, reduce]);

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-ink"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
      role="status"
      aria-live="polite"
      aria-label="Loading CodedByAli OpenMuseum"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(40% 40% at 30% 40%, rgba(0,229,255,.14), transparent 70%), radial-gradient(40% 40% at 70% 60%, rgba(168,85,247,.16), transparent 70%)',
        }}
      />
      <div className="relative">
        <span className="absolute inset-0 rounded-full border border-neon/40 animate-pulseRing" />
        <LogoMark size={72} />
      </div>
      <p className="mt-8 font-display text-[0.7rem] uppercase tracking-[0.4em] text-muted">CodedByAli</p>
      <p className="mt-1 font-display text-2xl font-bold tracking-tight">
        Open<span className="text-gradient">Museum</span>
      </p>
      <div className="mt-10 h-px w-48 overflow-hidden bg-white/10">
        <div className="h-full bg-gradient-to-r from-neon to-purple" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 font-display text-xs tabular-nums text-muted">{pct}%</p>
      <p className="absolute bottom-10 px-6 text-center text-[0.65rem] uppercase tracking-[0.25em] text-white/40">
        Discover Art. Experience History. Explore Creativity.
      </p>
    </motion.div>
  );
}
