import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, LogOut, Menu, X } from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../common/Button';
import { NAV_LINKS } from '../../lib/nav';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';


export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { favorites } = useFavorites();
  const { user, isAdmin, signOut, isLive } = useAuth();
  const extra = [
    { to: '/upload', label: 'Upload' },
    { to: '/favorites', label: 'Favorites' },
    { to: '/dashboard', label: 'Dashboard' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
    ...(!user ? [{ to: '/login', label: 'Log in' }] : []),
  ];

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || open ? 'border-b border-white/[0.07] bg-ink/75 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="container-x flex h-16 items-center justify-between sm:h-20">
          <Logo />

          <nav aria-label="Main" className="hidden items-center gap-8 xl:flex">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `relative py-2 font-display text-[0.72rem] uppercase tracking-[0.2em] transition-colors hover:text-neon ${isActive ? 'text-neon' : 'text-white/75'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/favorites"
              aria-label={`Favorites${favorites.length ? `, ${favorites.length} saved` : ''}`}
              className="relative hidden h-11 w-11 items-center justify-center border border-white/10 text-white/80 transition-colors hover:border-neon hover:text-neon sm:flex"
            >
              <Heart size={18} />
              {favorites.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center bg-neon px-1 text-[0.65rem] font-bold text-ink">
                  {favorites.length}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="hidden px-2 font-display text-[0.72rem] uppercase tracking-[0.2em] text-white/75 hover:text-neon xl:block">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="hidden px-2 font-display text-[0.72rem] uppercase tracking-[0.2em] text-purple hover:text-white xl:block">
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={signOut}
                  aria-label="Log out"
                  className="hidden h-11 w-11 items-center justify-center border border-white/10 text-white/80 transition-colors hover:border-neon hover:text-neon sm:flex"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden px-2 font-display text-[0.72rem] uppercase tracking-[0.2em] text-white/75 hover:text-neon xl:block">
                  Log in
                </Link>
                <Button to="/register" size="sm" wrapperClassName="hidden sm:inline-block">
                  Become an artist
                </Button>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="flex h-11 w-11 items-center justify-center border border-white/15 xl:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 overflow-y-auto bg-ink/95 backdrop-blur-xl xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(60% 40% at 0% 0%, rgba(0,229,255,.16), transparent 70%), radial-gradient(60% 40% at 100% 100%, rgba(168,85,247,.2), transparent 70%)',
              }}
            />
            <nav aria-label="Mobile" className="container-x relative flex min-h-full flex-col justify-center pb-12 pt-28">
              <ul>
                {NAV_LINKS.map((l, i) => (
                  <motion.li key={l.to} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i + 0.1, duration: 0.5 }}>
                    <NavLink
                      to={l.to}
                      className={({ isActive }) =>
                        `flex items-baseline gap-4 border-b border-white/10 py-4 font-display text-[clamp(1.8rem,8vw,2.8rem)] font-bold tracking-tight ${isActive ? 'text-neon' : 'text-white'}`
                      }
                    >
                      <span className="text-xs font-medium text-muted">{String(i + 1).padStart(2, '0')}</span>
                      {l.label}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {extra.map((l) => (
                  <Link key={l.to} to={l.to} className="border border-white/10 px-4 py-3.5 text-center font-display text-xs uppercase tracking-[0.18em] text-white/80 hover:border-neon hover:text-neon">
                    {l.label}
                  </Link>
                ))}
              </div>
              {user ? (
                <Button onClick={signOut} size="lg" magnetic={false} variant="ghost" className="mt-6 w-full" wrapperClassName="block">
                  <LogOut size={16} /> Log out
                </Button>
              ) : (
                <Button to="/register" size="lg" magnetic={false} className="mt-6 w-full" wrapperClassName="block">
                  Become an artist
                </Button>
              )}
              {!isLive && <p className="mt-4 text-center text-xs text-muted">Demo mode: accounts are not connected.</p>}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
