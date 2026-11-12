import { Info, Check } from 'lucide-react';

export default function Notice({ children, tone = 'info', className = '' }) {
  const Icon = tone === 'success' ? Check : Info;
  const color =
    tone === 'success'
      ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
      : 'border-neon/30 bg-neon/[0.06] text-white/85';
  return (
    <div role="status" className={`flex gap-3 border px-4 py-3.5 text-sm leading-relaxed ${color} ${className}`}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
