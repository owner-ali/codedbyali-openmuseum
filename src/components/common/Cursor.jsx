import { useEffect, useRef, useState } from 'react';
import { isFinePointer, prefersReducedMotion } from '../../lib/device';

// Desktop-only custom cursor (a dot plus a trailing ring). Never mounts on touch devices.
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    setEnabled(isFinePointer() && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    document.documentElement.classList.add('has-custom-cursor');
    let tx = -100;
    let ty = -100;
    let rx = -100;
    let ry = -100;
    let raf;
    let hovering = false;

    const move = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`;
    };
    const over = (e) => {
      hovering = !!(e.target.closest && e.target.closest('a,button,[role="button"],[data-cursor]'));
    };
    const loop = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%) scale(${hovering ? 1.7 : 1})`;
        ring.current.style.borderColor = hovering ? '#00E5FF' : 'rgba(255,255,255,.5)';
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ring} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[250] h-9 w-9 rounded-full border border-white/50 transition-[border-color] duration-200" />
      <div ref={dot} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[251] h-1.5 w-1.5 rounded-full bg-neon" />
    </>
  );
}
