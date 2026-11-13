export default function DashboardShell({ eyebrow, title, items, active, onSelect, children }) {
  return (
    <div className="container-x pb-20 pt-28 sm:pt-36">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h1 className="mb-8 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tracking-tight">{title}</h1>
      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <div className="lg:hidden">
          <label htmlFor="dash-section" className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">Section</label>
          <select
            id="dash-section"
            value={active}
            onChange={(e) => onSelect(e.target.value)}
            className="h-12 w-full border border-neon/50 bg-panel px-4 text-base text-white outline-none focus:border-neon"
          >
            {items.map((it) => (
              <option key={it.id} value={it.id}>{it.label}</option>
            ))}
          </select>
        </div>
        <nav aria-label={`${title} sections`} className="hidden lg:block">
          <ul className="flex flex-col gap-2">
            {items.map((it) => {
              const Icon = it.icon;
              const on = active === it.id;
              return (
                <li key={it.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelect(it.id)}
                    aria-current={on ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 whitespace-nowrap border px-4 py-3 text-sm transition-colors ${on ? 'border-neon/60 bg-neon/10 text-neon' : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'}`}
                  >
                    <Icon size={16} aria-hidden="true" /> {it.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <section className="min-w-0" aria-live="polite">{children}</section>
      </div>
    </div>
  );
}
