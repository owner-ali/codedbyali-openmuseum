export default function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="flex flex-col items-center border border-dashed border-white/15 px-6 py-14 text-center">
      {Icon && (
        <span className="mb-5 flex h-14 w-14 items-center justify-center border border-white/10 bg-white/[0.03] text-neon">
          <Icon size={24} aria-hidden="true" />
        </span>
      )}
      <h3 className="font-serif text-2xl sm:text-3xl">{title}</h3>
      {text && <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
