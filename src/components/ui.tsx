import type { ReactNode } from 'react';
import { motion } from 'motion/react';

export const ease = [0.22, 1, 0.36, 1] as const;

export function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px 0px' }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Headline that rises in word by word. */
export function Words({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block" aria-hidden="true">
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px 0px' }}
            transition={{ duration: 0.85, delay: delay + i * 0.06, ease }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Reveal>
      <div className="mb-5 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
        <span className="h-px w-6 bg-white/25" />
        {children}
      </div>
    </Reveal>
  );
}

export function SectionHead({ title, lede, center }: { title: string; lede?: string; center?: boolean }) {
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <h2 className="text-[clamp(34px,5.2vw,64px)] font-semibold leading-[1.02] tracking-[-0.035em]">
        <Words text={title} />
      </h2>
      {lede && (
        <Reveal delay={0.15}>
          <p className={`mt-6 text-[18px] leading-relaxed text-muted ${center ? 'mx-auto' : ''} max-w-2xl`}>{lede}</p>
        </Reveal>
      )}
    </div>
  );
}

export function Btn({ href, children, variant = 'primary' }: { href: string; children: ReactNode; variant?: 'primary' | 'ghost' }) {
  const cls =
    variant === 'primary'
      ? 'bg-ink text-bg hover:bg-white'
      : 'border border-line-2 text-ink hover:bg-white/5 backdrop-blur';
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={`inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-colors ${cls}`}
    >
      {children}
    </motion.a>
  );
}

/** Left-aligned section heading used on the sub-pages. */
export function Heading({ title, lede, className = '' }: { title: string; lede?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="text-[clamp(36px,5.4vw,68px)] font-semibold leading-[1] tracking-[-0.04em]">
        <Words text={title} />
      </h2>
      {lede && (
        <Reveal delay={0.12}>
          <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-muted">{lede}</p>
        </Reveal>
      )}
    </div>
  );
}
