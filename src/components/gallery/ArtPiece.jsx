import { useId, useMemo } from 'react';
import { getCategory } from '../../data/demo';
import { mulberry32, pick, range, shade } from '../../lib/seed';

// Procedural SVG artwork. Every demo artwork is generated from its seed, so the
// project needs no image files, no external services and no licences.

const f = (n) => Math.round(n * 10) / 10;

function bgDefs(id, p) {
  return (
    <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stopColor={shade(p[2], 1.6)} />
      <stop offset="1" stopColor={shade(p[2], 0.45)} />
    </linearGradient>
  );
}

const STYLES = {
  orbs(rng, p, id) {
    const orbs = Array.from({ length: 8 }, (_, i) => ({
      x: range(rng, 20, 380),
      y: range(rng, 40, 460),
      r: range(rng, 40, 150),
      c: p[i % 2],
    }));
    return (
      <>
        <defs>
          {bgDefs(id, p)}
          <filter id={`bl-${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        <g filter={`url(#bl-${id})`}>
          {orbs.map((o, i) => (
            <circle key={i} cx={f(o.x)} cy={f(o.y)} r={f(o.r)} fill={o.c} opacity={0.5} />
          ))}
        </g>
        {Array.from({ length: 5 }, (_, i) => (
          <circle key={i} cx={f(range(rng, 40, 360))} cy={f(range(rng, 60, 440))} r={f(range(rng, 18, 60))} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
        ))}
      </>
    );
  },
  waves(rng, p, id) {
    return (
      <>
        <defs>{bgDefs(id, p)}</defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        <circle cx={f(range(rng, 100, 300))} cy="150" r="70" fill={p[1]} opacity="0.55" />
        {Array.from({ length: 7 }, (_, i) => {
          const y = 190 + i * 44;
          const a = range(rng, 14, 38);
          const ph = range(rng, 0, 6);
          let d = `M0 ${y}`;
          for (let x = 0; x <= 400; x += 20) d += ` L${x} ${f(y + Math.sin(x / 55 + ph) * a)}`;
          d += ' L400 500 L0 500 Z';
          return <path key={i} d={d} fill={i % 2 ? p[0] : p[1]} opacity={0.18 + i * 0.1} />;
        })}
      </>
    );
  },
  grid(rng, p, id) {
    const h = 290;
    return (
      <>
        <defs>
          {bgDefs(id, p)}
          <radialGradient id={`sun-${id}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={p[1]} />
            <stop offset="1" stopColor={p[0]} stopOpacity="0.1" />
          </radialGradient>
        </defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        <circle cx="200" cy={h - 40} r={f(range(rng, 70, 100))} fill={`url(#sun-${id})`} />
        <rect y={h} width="400" height="210" fill="#07070A" opacity="0.7" />
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`v${i}`} x1={200 + (i - 8) * 14} y1={h} x2={200 + (i - 8) * 90} y2="500" stroke={p[0]} strokeOpacity="0.5" />
        ))}
        {Array.from({ length: 10 }, (_, i) => {
          const y = h + Math.pow(i / 9, 2) * 210;
          return <line key={`h${i}`} x1="0" y1={f(y)} x2="400" y2={f(y)} stroke={p[0]} strokeOpacity="0.45" />;
        })}
      </>
    );
  },
  planet(rng, p, id) {
    const r = range(rng, 80, 120);
    const cx = range(rng, 150, 250);
    const cy = range(rng, 200, 300);
    return (
      <>
        <defs>
          {bgDefs(id, p)}
          <radialGradient id={`pl-${id}`} cx="0.3" cy="0.3" r="0.9">
            <stop offset="0" stopColor={shade(p[0], 1.1)} />
            <stop offset="0.6" stopColor={p[1]} />
            <stop offset="1" stopColor={shade(p[2], 0.6)} />
          </radialGradient>
        </defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        {Array.from({ length: 70 }, (_, i) => (
          <circle key={i} cx={f(range(rng, 0, 400))} cy={f(range(rng, 0, 500))} r={f(range(rng, 0.4, 1.6))} fill="#fff" opacity={f(range(rng, 0.25, 0.9))} />
        ))}
        <circle cx={f(cx)} cy={f(cy)} r={f(r)} fill={`url(#pl-${id})`} />
        <ellipse cx={f(cx)} cy={f(cy)} rx={f(r * 1.7)} ry={f(r * 0.38)} fill="none" stroke={p[0]} strokeWidth="3" opacity="0.8" transform={`rotate(-18 ${f(cx)} ${f(cy)})`} />
      </>
    );
  },
  pixel(rng, p, id) {
    const cols = 20;
    const rows = 25;
    const cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols / 2; x++) {
        const v = rng();
        const edge = Math.abs(x - cols / 4) / (cols / 4);
        if (v > 0.35 + edge * 0.35 - y / rows * 0.15) {
          const c = pick(rng, [p[0], p[1], shade(p[0], 0.6), shade(p[1], 0.7), '#E8E4EE']);
          cells.push({ x, y, c });
          cells.push({ x: cols - 1 - x, y, c });
        }
      }
    }
    return (
      <>
        <defs>{bgDefs(id, p)}</defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        {cells.map((c, i) => (
          <rect key={i} x={c.x * 20} y={c.y * 20} width="20" height="20" fill={c.c} opacity="0.9" />
        ))}
      </>
    );
  },
  arch(rng, p, id) {
    const cols = [60, 130, 270, 340];
    return (
      <>
        <defs>
          {bgDefs(id, p)}
          <linearGradient id={`st-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8d88a0" />
            <stop offset="0.5" stopColor="#f2eff7" />
            <stop offset="1" stopColor="#8d88a0" />
          </linearGradient>
        </defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        <circle cx={f(range(rng, 150, 250))} cy="130" r="58" fill={p[0]} opacity="0.55" />
        <path d="M130 410 L130 250 Q200 150 270 250 L270 410" fill="none" stroke={p[1]} strokeWidth="3" opacity="0.8" />
        {cols.map((x) => (
          <g key={x}>
            <rect x={x - 17} y="215" width="34" height="14" fill={`url(#st-${id})`} />
            <rect x={x - 11} y="229" width="22" height="165" fill={`url(#st-${id})`} />
            <rect x={x - 17} y="394" width="34" height="14" fill={`url(#st-${id})`} />
          </g>
        ))}
        <rect x="30" y="408" width="340" height="14" fill={`url(#st-${id})`} opacity="0.9" />
        <rect x="14" y="422" width="372" height="14" fill={`url(#st-${id})`} opacity="0.75" />
        <rect x="0" y="436" width="400" height="64" fill="#07070A" opacity="0.5" />
      </>
    );
  },
  bust(rng, p, id) {
    return (
      <>
        <defs>
          {bgDefs(id, p)}
          <linearGradient id={`mb-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#cfcad8" />
            <stop offset="1" stopColor="#7d7890" />
          </linearGradient>
          <linearGradient id={`rm-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={p[0]} stopOpacity="0.8" />
            <stop offset="0.45" stopColor={p[0]} stopOpacity="0" />
            <stop offset="0.55" stopColor={p[1]} stopOpacity="0" />
            <stop offset="1" stopColor={p[1]} stopOpacity="0.8" />
          </linearGradient>
          <g id={`bs-${id}`}>
            <path d="M40 500 C40 410 110 385 160 372 L240 372 C290 385 360 410 360 500 Z" />
            <path d="M168 310 L232 310 L238 376 L162 376 Z" />
            <ellipse cx="200" cy="225" rx="68" ry="88" />
          </g>
        </defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        <use href={`#bs-${id}`} fill={`url(#mb-${id})`} />
        <use href={`#bs-${id}`} fill={`url(#rm-${id})`} />
        <rect x="148" y="205" width="104" height="22" rx="8" fill="#050508" />
      </>
    );
  },
  mountains(rng, p, id) {
    const layer = (base, amp, color, op) => {
      let d = `M0 500 L0 ${base}`;
      for (let x = 0; x <= 400; x += 40) d += ` L${x} ${f(base - rng() * amp)}`;
      d += ' L400 500 Z';
      return <path d={d} fill={color} opacity={op} />;
    };
    return (
      <>
        <defs>{bgDefs(id, p)}</defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        {Array.from({ length: 50 }, (_, i) => (
          <circle key={i} cx={f(range(rng, 0, 400))} cy={f(range(rng, 0, 260))} r={f(range(rng, 0.4, 1.4))} fill="#fff" opacity="0.6" />
        ))}
        <circle cx={f(range(rng, 120, 280))} cy="150" r="64" fill={p[0]} opacity="0.85" />
        {layer(330, 120, shade(p[1], 0.55), 0.9)}
        {layer(380, 90, shade(p[2], 1.2), 0.95)}
        {layer(430, 60, shade(p[2], 0.5), 1)}
      </>
    );
  },
  bokeh(rng, p, id) {
    return (
      <>
        <defs>{bgDefs(id, p)}</defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        <rect y="300" width="400" height="200" fill="#07070A" opacity="0.6" />
        <line x1="0" y1="300" x2="400" y2="300" stroke={p[0]} strokeOpacity="0.7" />
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx={f(range(rng, 0, 400))} cy={f(range(rng, 60, 440))} r={f(range(rng, 10, 46))} fill={pick(rng, p.slice(0, 2))} opacity={f(range(rng, 0.15, 0.5))} />
        ))}
      </>
    );
  },
  blobs(rng, p, id) {
    return (
      <>
        <defs>{bgDefs(id, p)}</defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        {Array.from({ length: 7 }, (_, i) => {
          const cx = range(rng, 40, 360);
          const cy = range(rng, 60, 440);
          const r = range(rng, 50, 130);
          const d = `M${f(cx - r)} ${f(cy)} Q${f(cx - r * 0.4)} ${f(cy - r)} ${f(cx + r * 0.5)} ${f(cy - r * 0.6)} Q${f(cx + r)} ${f(cy)} ${f(cx + r * 0.3)} ${f(cy + r * 0.8)} Q${f(cx - r * 0.6)} ${f(cy + r)} ${f(cx - r)} ${f(cy)} Z`;
          return <path key={i} d={d} fill={p[i % 2]} opacity={f(range(rng, 0.35, 0.8))} />;
        })}
        <circle cx="300" cy="120" r="26" fill="#fff" opacity="0.8" />
      </>
    );
  },
  flow(rng, p, id) {
    return (
      <>
        <defs>{bgDefs(id, p)}</defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        {Array.from({ length: 34 }, (_, i) => {
          const y = 20 + i * 14;
          const a = range(rng, 20, 70);
          const ph = rng() * 6;
          let d = `M0 ${y}`;
          for (let x = 0; x <= 400; x += 25) d += ` L${x} ${f(y + Math.sin(x / 70 + ph + i * 0.18) * a)}`;
          return <path key={i} d={d} fill="none" stroke={i % 3 ? p[0] : p[1]} strokeWidth="1.1" opacity={f(range(rng, 0.25, 0.75))} />;
        })}
      </>
    );
  },
  city(rng, p, id) {
    let x = -10;
    const b = [];
    while (x < 400) {
      const w = range(rng, 24, 60);
      const h = range(rng, 90, 330);
      b.push({ x, w, h, c: rng() > 0.5 ? p[0] : p[1] });
      x += w + range(rng, 2, 8);
    }
    return (
      <>
        <defs>
          {bgDefs(id, p)}
          <linearGradient id={`bd-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade(p[2], 1.8)} />
            <stop offset="1" stopColor="#07070A" />
          </linearGradient>
        </defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        <circle cx="300" cy="130" r="50" fill={p[1]} opacity="0.5" />
        {b.map((o, i) => (
          <g key={i}>
            <rect x={f(o.x)} y={f(500 - o.h)} width={f(o.w)} height={f(o.h)} fill={`url(#bd-${id})`} />
            <rect x={f(o.x)} y={f(500 - o.h)} width={f(o.w)} height="2" fill={o.c} />
            {Array.from({ length: Math.floor(o.h / 34) }, (_, j) => (
              <rect key={j} x={f(o.x + 6)} y={f(500 - o.h + 12 + j * 34)} width={f(Math.max(4, o.w - 12))} height="3" fill={o.c} opacity="0.55" />
            ))}
          </g>
        ))}
      </>
    );
  },
  cubes(rng, p, id) {
    const s = 44;
    const items = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 6; col++) {
        if (rng() < 0.45) continue;
        const cx = 40 + col * s * 1.74 + (row % 2) * s * 0.87;
        const cy = 60 + row * s * 0.92;
        const h = range(rng, 0.6, 1.5) * s * 0.55;
        items.push({ cx, cy, h, c: rng() > 0.5 ? p[0] : p[1] });
      }
    }
    return (
      <>
        <defs>{bgDefs(id, p)}</defs>
        <rect width="400" height="500" fill={`url(#bg-${id})`} />
        {items.map((q, i) => {
          const { cx, cy, h, c } = q;
          const hw = s * 0.87;
          const hh = s * 0.5;
          return (
            <g key={i}>
              <polygon points={`${f(cx)},${f(cy - h)} ${f(cx + hw)},${f(cy - h + hh)} ${f(cx)},${f(cy - h + 2 * hh)} ${f(cx - hw)},${f(cy - h + hh)}`} fill={shade(c, 1.15)} />
              <polygon points={`${f(cx - hw)},${f(cy - h + hh)} ${f(cx)},${f(cy - h + 2 * hh)} ${f(cx)},${f(cy + 2 * hh)} ${f(cx - hw)},${f(cy + hh)}`} fill={shade(c, 0.7)} />
              <polygon points={`${f(cx + hw)},${f(cy - h + hh)} ${f(cx)},${f(cy - h + 2 * hh)} ${f(cx)},${f(cy + 2 * hh)} ${f(cx + hw)},${f(cy + hh)}`} fill={shade(c, 0.45)} />
            </g>
          );
        })}
      </>
    );
  },
};

export default function ArtPiece({ art, variant, fit = 'slice', width, height, className = '', thumb = false }) {
  const rid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const style = variant || art.style || (art.category ? getCategory(art.category).style : 'orbs');
  const render = STYLES[style] || STYLES.orbs;
  const content = useMemo(
    () => render(mulberry32(art.seed), art.palette, rid),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [style, art.seed, art.palette, rid],
  );
  const src = thumb && art.previewUrl ? art.previewUrl : art.imageUrl;
  if (src) {
    return (
      <img
        src={src}
        alt={art.alt || art.title || ''}
        loading="lazy"
        decoding="async"
        className={`block h-full w-full ${fit === 'meet' ? 'object-contain' : 'object-cover'} ${className}`}
      />
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 500"
      preserveAspectRatio={fit === 'meet' ? 'xMidYMid meet' : 'xMidYMid slice'}
      className={`block h-full w-full ${className}`}
      width={width}
      height={height}
      role="img"
      aria-label={art.alt || art.title}
    >
      {content}
    </svg>
  );
}
