import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { GitHubIcon } from '../components/icons';
import { Words } from '../components/ui';
import { DOWNLOAD, REPO } from '../lib/links';
import type { Eyes, Shape } from '../lib/shapes';

const CREW: [Shape, string, Eyes][] = [
  ['leaf', '#4cbe6c', 'dots'],
  ['diamond', '#8b5cf6', 'dots'],
  ['hex', '#3b82f6', 'wide'],
  ['pill', '#ec4899', 'happy'],
  ['triangle', '#f06f2c', 'wide'],
  ['blob', '#f2a533', 'sleepy'],
  ['square', '#3fb5a3', 'dots'],
];

export function Finale() {
  const reduced = useReducedMotion();
  const [hops, setHops] = useState(CREW.map(() => 0));
  useEffect(() => {
    if (reduced) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wave = () =>
      CREW.forEach((_, i) => timers.push(setTimeout(() => setHops((h) => h.map((v, j) => (j === i ? v + 1 : v))), i * 120)));
    const iv = setInterval(wave, 3200);
    return () => { clearInterval(iv); timers.forEach(clearTimeout); };
  }, [reduced]);

  return (
    <section className="relative overflow-hidden px-5 pt-36 pb-28 text-center">
      <div className="relative flex items-end justify-center gap-[clamp(6px,2vw,22px)]">
        {CREW.map(([s, c, e], i) => (
          <motion.div
            key={i}
            initial={{ y: 80, opacity: 0, scale: 0.6 }}
            whileInView={{ y: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px 0px' }}
            transition={{ type: 'spring', stiffness: 260, damping: 15, delay: i * 0.07 }}
          >
            <Mascot shape={s} color={c} eyes={e} size={Math.max(40, Math.min(68, (typeof window !== 'undefined' ? window.innerWidth : 1200) / 13))} track hop={hops[i]} />
          </motion.div>
        ))}
      </div>
      <h2 className="relative mx-auto mt-12 max-w-4xl text-[clamp(40px,6.4vw,92px)] font-semibold leading-[0.95] tracking-[-0.05em]">
        <Words text="Nest 0.1 is out." />
        <br />
        <Words text="Free, MIT licensed." className="text-muted" delay={0.2} />
      </h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="relative mt-12 flex flex-wrap justify-center gap-3"
      >
        <motion.a href={DOWNLOAD} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="inline-flex h-14 items-center gap-2 rounded-full bg-ink px-8 text-[16px] font-semibold text-bg">
          Download for Windows or Linux <ArrowDown className="h-4 w-4" />
        </motion.a>
        <motion.a href={REPO} target="_blank" rel="noopener" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="inline-flex h-14 items-center gap-2 rounded-full border border-line-2 px-8 text-[16px] font-semibold hover:bg-white/5">
          <GitHubIcon className="h-4 w-4" /> Read the source
        </motion.a>
      </motion.div>
    </section>
  );
}
