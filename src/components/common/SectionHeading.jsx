import AnimatedHeading from './AnimatedHeading';
import Reveal from './Reveal';

export default function SectionHeading({ eyebrow, title, accent = [], text, action, className = '' }) {
  return (
    <div className={`mb-10 flex flex-col justify-between gap-6 sm:mb-14 md:flex-row md:items-end ${className}`}>
      <div className="max-w-3xl">
        {eyebrow && (
          <Reveal>
            <p className="eyebrow mb-4">{eyebrow}</p>
          </Reveal>
        )}
        <AnimatedHeading text={title} accent={accent} className="font-display text-[clamp(1.9rem,5vw,4rem)] font-bold leading-[1.02] tracking-tight" />
        {text && (
          <Reveal delay={0.2}>
            <p className="mt-4 max-w-xl text-white/60">{text}</p>
          </Reveal>
        )}
      </div>
      {action && <Reveal delay={0.2}>{action}</Reveal>}
    </div>
  );
}
