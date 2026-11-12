import { useId } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { publicUrl } from '../../lib/supabase';

export function LogoMark({ size = 36, className = '' }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00E5FF" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <path d="M8 25 L32 9 L56 25 Z" fill="none" stroke={`url(#lg-${id})`} strokeWidth="3" strokeLinejoin="round" />
      <g fill={`url(#lg-${id})`}>
        <rect x="14" y="29" width="5" height="19" />
        <rect x="24" y="29" width="5" height="19" />
        <rect x="35" y="29" width="5" height="19" />
        <rect x="45" y="29" width="5" height="19" />
        <rect x="9" y="50" width="46" height="3.5" />
      </g>
    </svg>
  );
}

export default function Logo({ className = '' }) {
  // An admin can upload a custom logo in Admin, Branding. Otherwise the built-in mark is used.
  const { settings } = useCatalog();
  const custom = typeof settings.logo_path === 'string' && settings.logo_path ? publicUrl('site', settings.logo_path) : '';
  return (
    <Link to="/" aria-label="CodedByAli OpenMuseum, home" className={`group inline-flex items-center gap-3 ${className}`}>
      {custom ? (
        <img src={custom} alt="" width="36" height="36" className="h-9 w-9 object-contain" />
      ) : (
        <LogoMark className="transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-110" />
      )}
      <span className="leading-none">
        <span className="block font-display text-[0.62rem] uppercase tracking-[0.34em] text-muted">CodedByAli</span>
        <span className="mt-1 block font-display text-lg font-bold tracking-tight">
          Open<span className="text-gradient">Museum</span>
        </span>
      </span>
    </Link>
  );
}
