import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import ArtPiece from '../../components/gallery/ArtPiece';
import { ARTWORKS } from '../../data/demo';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-[100svh] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0"><ArtPiece art={ARTWORKS[1]} /></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/30" />
        <p className="absolute bottom-12 left-12 max-w-sm font-serif text-4xl leading-tight">Discover Art. Experience History. Explore Creativity.</p>
      </div>
      <div className="flex flex-col justify-center px-5 pb-16 pt-28 sm:px-12 lg:px-20 lg:pt-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 lg:hidden"><Logo /></div>
          <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-none tracking-tight">{title}</h1>
          <p className="mt-3 text-white/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-sm text-white/60">{footer}</p>
          <p className="mt-6 text-xs text-muted">
            By continuing you agree to the <Link to="/terms" className="underline hover:text-neon">Terms</Link> and <Link to="/privacy" className="underline hover:text-neon">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
