import { motion, useReducedMotion } from 'framer-motion';

// Word-by-word masked reveal. `accent` lists words (exactly as written) to colour cyan.
export default function AnimatedHeading({ text, as = 'h2', className = '', delay = 0, accent = [] }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.h2;
  const words = text.split(' ');
  const wordVariants = reduce
    ? { hidden: {}, show: {} }
    : { hidden: { y: '110%' }, show: { y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ staggerChildren: 0.07, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]" aria-hidden="true">
          <motion.span className={`inline-block ${accent.includes(w) ? 'text-neon' : ''}`} variants={wordVariants}>
            {w}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
