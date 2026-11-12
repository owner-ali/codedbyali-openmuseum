import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { FOOTER_GROUPS } from '../../lib/nav';

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-ink">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 60% at 0% 100%, rgba(0,229,255,.1), transparent 70%), radial-gradient(50% 60% at 100% 100%, rgba(168,85,247,.14), transparent 70%)',
        }}
      />
      <div className="container-x relative pb-8 pt-16 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm font-serif text-2xl leading-snug text-white/85 sm:text-3xl">
              Discover Art. Experience History. Explore Creativity.
            </p>
            <p className="mt-5 text-sm text-muted">Created with passion by CodedByAli.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_GROUPS.map((g) => (
              <nav key={g.title} aria-label={g.title}>
                <h2 className="mb-4 font-display text-[0.7rem] uppercase tracking-[0.25em] text-neon">{g.title}</h2>
                <ul className="space-y-3">
                  {g.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="text-sm text-white/65 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <p aria-hidden="true" className="mt-16 select-none whitespace-nowrap text-center font-display text-[13.5vw] font-bold leading-none tracking-tighter text-white/[0.04]">
          OpenMuseum
        </p>

        <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CodedByAli OpenMuseum. All rights reserved.</p>
          <p>Created with passion by CodedByAli.</p>
        </div>
      </div>
    </footer>
  );
}
