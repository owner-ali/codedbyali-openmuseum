import { useCallback, useEffect, useState } from 'react';
import Notice from '../components/common/Notice';

// Loads data once, exposes reload, and keeps an error message for the section.
export function useLoad(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(() => fn().then((d) => { setData(d); setError(''); }).catch((e) => setError(e.message || 'Something went wrong.')), deps);
  useEffect(() => { run(); }, [run]);
  return { data, setData, error, setError, reload: run };
}

export function Loading({ data, error, children }) {
  if (error) return <Notice>{error}</Notice>;
  if (!data) return <p className="text-sm text-muted">Loading…</p>;
  return children;
}

export const Pill = ({ tone = 'muted', children }) => {
  const c = {
    muted: 'border-white/20 text-white/60',
    ok: 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200',
    warn: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
    bad: 'border-red-300/40 bg-red-300/10 text-red-200',
  }[tone];
  return <span className={`inline-block border px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.16em] ${c}`}>{children}</span>;
};

export const Btn = ({ onClick, danger, children, disabled, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={`h-10 border px-3 text-sm transition-colors disabled:opacity-40 ${danger ? 'border-white/15 hover:border-red-300 hover:text-red-300' : 'border-white/15 hover:border-neon hover:text-neon'}`}
  >
    {children}
  </button>
);
