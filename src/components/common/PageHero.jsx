import AnimatedHeading from './AnimatedHeading';
import Reveal from './Reveal';

export default function PageHero({ eyebrow, title, accent = [], description, children, className = '' }) {
  return (
    <header className={`relative overflow-hidden pb-10 pt-32 sm:pb-16 sm:pt-40 ${className}`}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 60% at 10% 0%, rgba(0,229,255,.14), transparent 70%), radial-gradient(50% 60% at 95% 10%, rgba(168,85,247,.18), transparent 70%)',
        }}
      />
      <div className="container-x relative">
        {eyebrow && (
          <Reveal>
            <p className="eyebrow mb-5">{eyebrow}</p>
          </Reveal>
        )}
        <AnimatedHeading
          as="h1"
          text={title}
          accent={accent}
          delay={0.1}
          className="max-w-5xl font-display text-[clamp(2.2rem,6.6vw,5.5rem)] font-bold leading-[0.98] tracking-tight"
        />
        {description && (
          <Reveal delay={0.35}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">{description}</p>
          </Reveal>
        )}
        {children && <Reveal delay={0.45} className="mt-8">{children}</Reveal>}
      </div>
    </header>
  );
}
