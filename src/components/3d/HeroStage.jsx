import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import StatueFallback from './StatueFallback';
import { hasWebGL, isLowPower, prefersReducedMotion } from '../../lib/device';

// The heavy Three.js chunk is only downloaded when WebGL is available.
const Statue3D = lazy(() => import('./Statue3D'));

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.warn('3D hero failed, showing SVG fallback.', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function HeroStage() {
  const ref = useRef(null);
  const [cfg, setCfg] = useState(null); // null while we check the device
  const [active, setActive] = useState(true);

  useEffect(() => {
    setCfg({
      webgl: hasWebGL(),
      quality: isLowPower() ? 'low' : 'high',
      reduced: prefersReducedMotion(),
    });
  }, []);

  // Stop rendering when the hero is off-screen to save battery.
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fallback = <StatueFallback />;

  return (
    <div ref={ref} className="absolute inset-0">
      {!cfg || !cfg.webgl ? (
        fallback
      ) : (
        <Boundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <Statue3D quality={cfg.quality} reduced={cfg.reduced} active={active} />
          </Suspense>
        </Boundary>
      )}
    </div>
  );
}
