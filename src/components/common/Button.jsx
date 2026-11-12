import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { isFinePointer } from '../../lib/device';

const base =
  'relative inline-flex items-center justify-center gap-2 font-display font-medium uppercase tracking-[0.14em] text-[0.72rem] sm:text-xs transition-colors duration-300 select-none whitespace-nowrap';
const variants = {
  primary: 'bg-neon text-ink hover:bg-white',
  ghost: 'border border-white/25 text-white hover:border-neon hover:text-neon',
  violet: 'bg-violet text-white hover:bg-purple',
  subtle: 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
};
const sizes = { sm: 'h-10 px-5', md: 'h-12 px-7', lg: 'h-14 px-9' };

export default function Button({
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  magnetic = true,
  className = '',
  wrapperClassName = '',
  children,
  type = 'button',
  disabled = false,
  ...rest
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e) => {
    if (!magnetic || !ref.current || !isFinePointer()) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`;
  const inner = <span className="relative z-10 inline-flex items-center gap-2">{children}</span>;

  let el;
  if (to) {
    el = (
      <Link to={to} className={cls} onClick={onClick} {...rest}>
        {inner}
      </Link>
    );
  } else if (href) {
    el = (
      <a href={href} className={cls} onClick={onClick} {...rest}>
        {inner}
      </a>
    );
  } else {
    el = (
      <button type={type} className={cls} onClick={onClick} disabled={disabled} {...rest}>
        {inner}
      </button>
    );
  }

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      className={wrapperClassName}
    >
      {el}
    </motion.span>
  );
}
