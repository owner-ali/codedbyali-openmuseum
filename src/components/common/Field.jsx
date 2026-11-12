export default function Field({ label, id, error, hint, as: Tag = 'input', className = '', ...props }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-2 block font-display text-[0.7rem] uppercase tracking-[0.18em] text-muted">
          {label}
        </label>
      )}
      <Tag
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={`w-full border bg-white/[0.03] px-4 py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/30 ${
          error ? 'border-red-400/70' : 'border-white/15 focus:border-neon'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-2 text-sm text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
