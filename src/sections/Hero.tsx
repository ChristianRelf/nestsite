import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { GitHubIcon } from '../components/icons';
import { Fluted } from '../components/Fluted';
import abstract from '../assets/hero-abstract.avif';
import { ease } from '../components/ui';
import { DOWNLOAD, RELEASES, REPO } from '../lib/links';
import type { Eyes, Shape } from '../lib/shapes';

const FLOCK: { shape: Shape; eyes: Eyes }[] = [
  { shape: 'blob', eyes: 'dots' },
  { shape: 'square', eyes: 'dots' },
  { shape: 'hex', eyes: 'wide' },
  { shape: 'pill', eyes: 'dots' },
  { shape: 'diamond', eyes: 'dots' },
];

function Flock() {
  const reduced = useReducedMotion();
  const [happy, setHappy] = useState<boolean[]>(FLOCK.map(() => false));
  const [hops, setHops] = useState<number[]>(FLOCK.map(() => 0));

  const hop = (i: number) => setHops((h) => h.map((v, j) => (j === i ? v + 1 : v)));

  // Every so often a wave of happy faces runs down the line, like the GIF.
  useEffect(() => {
    if (reduced) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wave = () => {
      FLOCK.forEach((_, i) => {
        timers.push(setTimeout(() => { setHappy((h) => h.map((v, j) => (j === i ? true : v))); hop(i); }, i * 110));
        timers.push(setTimeout(() => setHappy((h) => h.map((v, j) => (j === i ? false : v))), 1700 + i * 110));
      });
    };
    timers.push(setTimeout(wave, 2400));
    const iv = setInterval(wave, 7500);
    return () => { clearInterval(iv); timers.forEach(clearTimeout); };
  }, [reduced]);

  return (
    <div className="flex items-end justify-center gap-[clamp(10px,3.2vw,40px)]">
      {FLOCK.map((m, i) => (
        <motion.button
          key={i}
          type="button"
          aria-label="Poke the mascot"
          onClick={() => hop(i)}
          onHoverStart={() => hop(i)}
          initial={{ y: -220, opacity: 0, rotate: i % 2 ? 18 : -18 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.35 + i * 0.09 }}
          whileTap={{ scale: 0.9 }}
          className="relative cursor-pointer"
        >
          <motion.div animate={reduced ? undefined : { y: [0, -8, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.45 }}>
            <Mascot shape={m.shape} color="#3b82f6" eyes={happy[i] ? 'happy' : m.eyes} size={clampSize()} track hop={hops[i]} />
          </motion.div>
          <motion.div
            className="mx-auto mt-3 h-2 w-3/5 rounded-[50%] bg-[#0b2a7a]/25 blur-[5px]"
            animate={reduced ? undefined : { scaleX: [1, 0.8, 1], opacity: [0.7, 0.4, 0.7] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.45 }}
          />
        </motion.button>
      ))}
    </div>
  );
}

function clampSize() {
  if (typeof window === 'undefined') return 110;
  return Math.max(54, Math.min(118, window.innerWidth / 9));
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 220]);

  return (
    <section id="top" ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div style={{ y: bgY }} className="absolute inset-x-0 top-[-20%] h-[130%] max-sm:top-[-30%]">
          <motion.div className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease }}>
            <Fluted src={abstract} />
          </motion.div>
        </motion.div>
        <div className="noise absolute inset-0" />
        <div className="fade-to-bottom absolute inset-x-0 -bottom-px h-[38%]" />
      </div>

      <motion.div style={{ y, opacity: fade, scale }} className="relative mx-auto w-full max-w-6xl px-6 text-center">
        <Flock />

        <motion.a
          href={RELEASES}
          target="_blank"
          rel="noopener"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease }}
          className="group mt-14 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/25 py-1.5 pl-1.5 pr-4 text-[13px] text-white/85 backdrop-blur-md transition hover:bg-black/35"
        >
          <span className="rounded-full bg-white px-2.5 py-0.5 text-[12px] font-semibold text-black">v0.1</span>
          Open source · MIT · Windows &amp; Linux
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </motion.a>

        <h1 className="mt-7 text-[clamp(46px,9vw,124px)] [text-shadow:0_2px_40px_rgba(0,24,90,0.35)] font-semibold leading-[0.92] tracking-[-0.055em]">
          {['Raise a team', 'of AI agents.'].map((line, li) => (
            <motion.span
              key={li}
              className={`block ${li === 1 ? 'text-white/60' : 'text-white'}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.75 + li * 0.12, ease }}
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 1.15, ease }}
          className="mx-auto mt-8 max-w-2xl text-[clamp(17px,1.6vw,20px)] leading-relaxed text-white/75"
        >
          Nest is a desktop home for persistent agents that run on the <span className="text-white">ChatGPT</span> and{' '}
          <span className="text-white">Claude</span> subscriptions you already pay for. They remember, delegate to each other and
          work on a schedule, through the official Codex and Claude Code tools.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.3, ease }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.a
            href={DOWNLOAD}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex h-13 items-center gap-2 rounded-full bg-ink px-7 text-[15px] font-semibold text-bg transition-colors hover:bg-white"
          >
            Download Nest
            <ArrowDown className="h-4 w-4" />
          </motion.a>
          <motion.a
            href={REPO}
            target="_blank"
            rel="noopener"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex h-13 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 text-[15px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <GitHubIcon className="h-4 w-4" />
            Star on GitHub
          </motion.a>
        </motion.div>

      </motion.div>
    </section>
  );
}
