// Pure SVG/CSS statue used when WebGL is unavailable, while the 3D chunk loads,
// or if the 3D scene throws. No assets required.
export default function StatueFallback() {
  return (
    <div className="relative flex h-full w-full items-center justify-center" role="img" aria-label="Illustration of a classical marble bust wearing futuristic sunglasses, lit in cyan and purple">
      <svg viewBox="0 0 400 500" className="h-full max-h-full w-auto max-w-full animate-floaty" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="fb-marble" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#cfcad8" />
            <stop offset="1" stopColor="#6f6a85" />
          </linearGradient>
          <linearGradient id="fb-cyan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#00E5FF" stopOpacity="0.85" />
            <stop offset="0.55" stopColor="#00E5FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fb-purple" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#A855F7" stopOpacity="0.85" />
            <stop offset="0.55" stopColor="#A855F7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fb-visor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0a0a12" />
            <stop offset="0.5" stopColor="#1b2a3a" />
            <stop offset="1" stopColor="#0a0a12" />
          </linearGradient>
          <g id="fb-bust">
            <path d="M30 500 C30 410 105 382 158 368 L242 368 C295 382 370 410 370 500 Z" />
            <path d="M168 300 L232 300 L240 372 L160 372 Z" />
            <ellipse cx="200" cy="205" rx="72" ry="96" />
            <circle cx="200" cy="120" r="46" />
            <circle cx="160" cy="132" r="30" />
            <circle cx="240" cy="132" r="30" />
            <circle cx="140" cy="165" r="22" />
            <circle cx="260" cy="165" r="22" />
          </g>
        </defs>
        <use href="#fb-bust" fill="url(#fb-marble)" />
        <use href="#fb-bust" fill="url(#fb-cyan)" />
        <use href="#fb-bust" fill="url(#fb-purple)" />
        <path d="M200 205 L192 250 Q200 258 208 250 Z" fill="#8d88a0" opacity="0.5" />
        <path d="M134 190 Q200 176 266 190 L262 222 Q200 236 138 222 Z" fill="url(#fb-visor)" />
        <path d="M134 190 Q200 176 266 190" fill="none" stroke="#00E5FF" strokeWidth="2" />
        <path d="M138 222 Q200 236 262 222" fill="none" stroke="#A855F7" strokeWidth="2" />
        <rect x="120" y="470" width="160" height="30" fill="#0b0b10" />
        <rect x="120" y="470" width="160" height="2" fill="#00E5FF" />
      </svg>
    </div>
  );
}
