import { useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowUpRight, Moon, Package } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { SubNav } from '../components/SubNav';
import nebula from '../assets/nightly-abstract.avif';
import { Heading, Reveal, ease } from '../components/ui';
import { Footer } from '../sections/Footer';
import { useLenis } from '../lib/useLenis';
import { RELEASES } from '../lib/links';
import type { Eyes, Shape } from '../lib/shapes';
import { ago, builds, detectOS, formatDate, formatSize, pickFor, useReleases, type Build, type Release } from '../lib/release';
import { GetButton, Notes, PlatformCard, Pops, Started, makePop, type Pop } from './Download';

const HOME = '../';

const isNightly = (r: Release) => r.prerelease || /nightly|beta|rc/i.test(r.tag);

/** v0.1.0-nightly.20261102.21 → { base: '0.1.0', date: '2 November 2026', build: '21' } */
function parseTag(r: Release) {
  const m = /^v?([\d.]+)-(?:nightly|beta)\.(\d{4})(\d{2})(\d{2})(?:\.(\d+))?/i.exec(r.tag);
  if (!m) return { base: r.tag.replace(/^v/, ''), date: formatDate(r.publishedAt), build: null as string | null };
  const [, base, y, mo, d, b] = m;
  return { base, date: formatDate(`${y}-${mo}-${d}T12:00:00Z`), build: b ?? null };
}

/* ---------------- The galaxy ---------------- */

const FLOATERS: { shape: Shape; color: string; eyes: Eyes; x: string; y: string; size: number; d: number }[] = [
  { shape: 'diamond', color: '#8b5cf6', eyes: 'sleepy', x: '9%', y: '24%', size: 54, d: 0 },
  { shape: 'hex', color: '#3b82f6', eyes: 'wide', x: '86%', y: '20%', size: 46, d: 1.2 },
  { shape: 'pill', color: '#ec4899', eyes: 'dots', x: '80%', y: '70%', size: 40, d: 2.1 },
  { shape: 'leaf', color: '#4cbe6c', eyes: 'happy', x: '13%', y: '72%', size: 36, d: 0.6 },
];

function Hero({ release, primary, others, onGet }: { release: Release; primary?: Build; others: Build[]; onGet: (b: Build, e: MouseEvent<HTMLElement>) => void }) {
  const reduced = useReducedMotion();
  const { base, date, build } = parseTag(release);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 220]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#0b0b0d] pt-28 pb-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Same as the home hero: a liquid, warped abstract with scroll parallax, minus the reeded glass. */}
        <motion.div style={{ y: bgY }} className="absolute inset-x-0 top-[-20%] h-[130%] max-sm:top-[-30%]">
          <motion.div className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease }}>
            <motion.img
              src={nebula}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              animate={reduced ? undefined : { scale: [1, 1.08, 1], x: ['0%', '-2%', '0%'] }}
              transition={{ duration: 50, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
        {/* Lots of grain: two static layers plus one that flickers like film. */}
        <div className="fade-mask noise absolute inset-0" />
        <div className="fade-mask noise absolute inset-0 [background-size:96px_96px]" />
        <div className="fade-mask grain-heavy absolute -inset-[80px]" />
        <div className="fade-mask grain-heavy absolute -inset-[80px] opacity-[0.22]! mix-blend-screen! [animation-duration:0.9s]!" />
        <div className="absolute top-1/2 left-1/2 h-[60%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(11,11,13,0.5),transparent)]" />
        {FLOATERS.map((f, i) => (
          <motion.div
            key={i}
            className="absolute hidden md:block"
            style={{ left: f.x, top: f.y }}
            initial={{ opacity: 0 }}
            animate={reduced ? { opacity: 0.9 } : { opacity: 0.9, y: [0, -14, 0], rotate: [-8, 8, -8] }}
            transition={{ opacity: { duration: 1, delay: 1 + f.d * 0.3 }, y: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: f.d }, rotate: { duration: 9 + i, repeat: Infinity, ease: 'easeInOut', delay: f.d } }}
          >
            <Mascot shape={f.shape} color={f.color} eyes={f.eyes} size={f.size} track />
          </motion.div>
        ))}
        <div className="fade-long absolute inset-x-0 -bottom-px h-[65%]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
        <motion.a
          href={release.url}
          target="_blank"
          rel="noopener"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/30 py-1.5 pr-4 pl-1.5 text-[13px] text-white/85 backdrop-blur-md transition hover:bg-black/40"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 to-teal-300 px-2.5 py-0.5 text-[12px] font-semibold text-black">
            <Moon className="h-3 w-3" />
            {build ? `build ${build}` : 'nightly'}
          </span>
          {date} · {ago(release.publishedAt)}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </motion.a>

        <h1 className="mt-7 text-[clamp(52px,10vw,140px)] font-semibold leading-[0.9] tracking-[-0.055em] text-white [text-shadow:0_2px_30px_rgba(10,4,40,0.7),0_4px_80px_rgba(120,60,10,0.45)]">
          {['Built while', 'you sleep.'].map((line, i) => (
            <motion.span
              key={line}
              className={`block ${i ? 'bg-gradient-to-r from-amber-100 via-orange-50 to-teal-100 bg-clip-text text-transparent' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.45 + i * 0.12, ease }}
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.75, ease }}
          className="mx-auto mt-7 max-w-xl text-[clamp(17px,1.6vw,20px)] leading-relaxed text-white/75"
        >
          Nightly builds of Nest {base}, fresh off <span className="font-mono text-[0.9em] text-white/90">main</span>. The newest features first, before they're polished. Expect a few rough edges.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.95, ease }} className="mt-16">
          {primary ? (
            <GetButton build={primary} onGet={onGet} />
          ) : (
            <a href="#builds" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-bg transition hover:bg-white">
              See all nightly builds <ArrowDown className="h-4 w-4" />
            </a>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.2 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[14px] text-white/60"
        >
          {primary && others.length > 0 && (
            <>
              <span>Also for</span>
              {others.map((b, i) => (
                <span key={b.platform.kind}>
                  <a href={b.asset.url} onClick={(e) => onGet(b, e)} className="text-white/90 underline decoration-white/30 underline-offset-4 transition hover:decoration-white">
                    {b.platform.title}
                  </a>
                  {i < others.length - 1 ? ',' : ''}
                </span>
              ))}
              <span className="text-white/30">·</span>
            </>
          )}
          <a href="../download/" className="text-white/90 underline decoration-white/30 underline-offset-4 transition hover:decoration-white">
            Want stable? Get the latest release
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- The deep: everything below the hero ---------------- */

const WISPS = [
  { color: 'rgba(245,158,11,0.22)', size: 520, x: ['-10%', '15%', '-10%'], y: ['10%', '35%', '10%'], d: 38 },
  { color: 'rgba(20,184,166,0.18)', size: 620, x: ['70%', '45%', '70%'], y: ['40%', '15%', '40%'], d: 46 },
  { color: 'rgba(225,29,72,0.14)', size: 460, x: ['30%', '60%', '30%'], y: ['75%', '55%', '75%'], d: 52 },
];

/**
 * A dark sky that stays put while the sections scroll over it, the nebula barely there.
 */
function Deep({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-bg">
          <img src={nebula} alt="" className="absolute inset-0 h-full w-full -scale-y-100 object-cover opacity-[0.12]" />
          {WISPS.map((w, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{ width: w.size, height: w.size, background: `radial-gradient(closest-side, ${w.color}, transparent)` }}
              initial={{ left: w.x[0], top: w.y[0] }}
              animate={reduced ? undefined : { left: w.x, top: w.y }}
              transition={{ duration: w.d, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
          <div className="noise absolute inset-0 opacity-40!" />
          {/* Fade the sky out at the bottom so the footer rises out of the dark. */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-bg/80" />
        </div>
        {/* Melt into the hero's fade above. */}
        <div className="fade-long absolute inset-x-0 top-0 h-[60vh] rotate-180" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

const SPELL: { text: string; dim?: boolean }[] = [
  { text: 'Every night, while the jits sleep,' },
  { text: 'the newest code is gathered up' },
  { text: 'and built in the dark,' },
  { text: 'left for whoever comes looking.', dim: true },
];

/** Each line rises out from behind its own edge, one after another, the first time it comes into view. */
function Incantation() {
  const reduced = useReducedMotion();
  return (
    <section className="px-5 py-40">
      <motion.p
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: '-25% 0px' }}
        transition={{ staggerChildren: 0.22 }}
        className="mx-auto max-w-5xl text-center text-[clamp(30px,4.6vw,60px)] font-semibold leading-[1.12] tracking-[-0.035em]"
      >
        {SPELL.map((line) => (
          <span key={line.text} className="block overflow-hidden pb-[0.08em]">
            <motion.span
              className={`block ${line.dim ? 'text-white/40' : 'text-ink'}`}
              variants={{
                hidden: reduced ? { opacity: 0 } : { y: '105%', opacity: 0 },
                shown: { y: '0%', opacity: 1 },
              }}
              transition={{ duration: 1.1, ease }}
            >
              {line.text}
            </motion.span>
          </span>
        ))}
      </motion.p>
    </section>
  );
}

function Builds({ release, list, mine, live, onGet }: { release: Release; list: Build[]; mine?: Build; live: boolean; onGet: (b: Build, e: MouseEvent<HTMLElement>) => void }) {
  return (
    <section id="builds" className="relative scroll-mt-24 px-5 pt-8 pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading title="Found at the edge." lede="Tonight's build, for every platform stable ships on. Same installers, newer insides." />
          <Reveal delay={0.2}>
            <a href={release.url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 font-mono text-[12px] text-faint transition hover:text-ink-2">
              <span className="relative flex h-1.5 w-1.5">
                {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />}
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${live ? 'bg-amber-300' : 'bg-faint'}`} />
              </span>
              {release.tag}
              {live && ' · live'}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3 [&>*]:bg-panel/70 [&>*]:backdrop-blur-md">
          {list.map((b, i) => (
            <PlatformCard key={b.platform.kind} build={b} mine={b === mine} onGet={onGet} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Earlier nightlies, as a trail of signals that fade the further back they go. */
function Transmissions({ releases }: { releases: Release[] }) {
  if (!releases.length) return null;
  return (
    <section className="relative px-5 pb-28">
      <div className="mx-auto max-w-4xl">
        <Heading title="Older transmissions." lede="Every night leaves a build behind. The further back, the fainter the signal." />
        <ol className="relative mt-14 pl-8">
          <span className="absolute top-2 bottom-2 left-[5px] w-px bg-gradient-to-b from-amber-200/60 via-white/15 to-transparent" aria-hidden="true" />
          {releases.map((r, i) => {
            const { date, build } = parseTag(r);
            const faint = Math.max(0.35, 1 - i * 0.12);
            return (
              <motion.li
                key={r.tag}
                initial={{ opacity: 0, x: -12, filter: 'blur(6px)' }}
                whileInView={{ opacity: faint, x: 0, filter: 'blur(0px)' }}
                whileHover={{ opacity: 1 }}
                viewport={{ once: true, margin: '-40px 0px' }}
                transition={{ duration: 0.7, delay: i * 0.05, ease }}
                className="relative py-5"
              >
                <span className="absolute top-[30px] -left-8 h-[11px] w-[11px] rounded-full bg-amber-200 shadow-[0_0_14px_3px_rgba(253,230,138,0.45)]" aria-hidden="true" />
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <a href={r.url} target="_blank" rel="noopener" className="text-[17px] font-medium text-ink hover:underline">
                    {date}
                  </a>
                  {build && <span className="font-mono text-[12px] text-faint">build {build}</span>}
                  <span className="font-mono text-[12px] text-faint">{ago(r.publishedAt)}</span>
                  <div className="flex flex-1 flex-wrap justify-end gap-2">
                    {builds(r).map((b) => (
                      <a
                        key={b.platform.kind}
                        href={b.asset.url}
                        className="inline-flex h-8 items-center gap-2 rounded-full bg-white/[0.05] px-3 text-[12.5px] text-ink-2 ring-1 ring-white/10 backdrop-blur-md transition hover:bg-white/10 hover:text-ink"
                      >
                        {b.platform.title}
                        <span className="font-mono text-[11px] text-faint">{formatSize(b.asset.size)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Afterword() {
  return (
    <section className="px-5 pt-10 pb-36 text-center">
      <Reveal className="mx-auto max-w-xl">
        <Mascot shape="diamond" color="#8b5cf6" eyes="sleepy" size={72} className="mx-auto" track />
        <h2 className="mt-8 text-[clamp(28px,3.6vw,44px)] font-semibold leading-[1.05] tracking-[-0.035em]">
          Too dark out here?
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">The stable release is tested, signed off, and lit all the way through.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="../download/" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-semibold text-bg transition hover:bg-white">
            <ArrowLeft className="h-4 w-4" /> Back to stable
          </a>
          <a href={RELEASES} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.06] px-5 text-[14px] font-medium ring-1 ring-white/10 backdrop-blur-md transition hover:bg-white/10">
            Every build on GitHub <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------- Page ---------------- */

export default function Nightly() {
  useLenis();
  const reduced = useReducedMotion();
  const { releases, live } = useReleases();
  const nightlies = useMemo(() => releases.filter(isNightly).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), [releases]);
  const tonight = nightlies[0];
  const [os] = useState(detectOS);
  const list = useMemo(() => builds(tonight), [tonight]);
  const primary = pickFor(os, list);
  const others = list.filter((b) => b !== primary);

  const [pops, setPops] = useState<Pop[]>([]);
  const [started, setStarted] = useState<Build | null>(null);
  const close = useMemo(() => () => setStarted(null), []);

  const onGet = (b: Build, e: MouseEvent<HTMLElement>) => {
    setStarted(b);
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const pop = makePop(r.left + r.width / 2, r.top + r.height / 2);
    setPops((ps) => [...ps, pop]);
    setTimeout(() => setPops((ps) => ps.filter((p) => p !== pop)), 2600);
  };

  if (!tonight) {
    return (
      <div>
        <SubNav label="nightly" />
        <main className="grid min-h-[100svh] place-items-center px-6 text-center">
          <div>
            <Mascot shape="diamond" color="#8b5cf6" eyes="sleepy" size={96} className="mx-auto" />
            <p className="mt-6 text-[18px] text-muted">No nightly builds yet. They'll show up here after the first one runs.</p>
            <a href={RELEASES} className="mt-6 inline-flex items-center gap-2 text-ink underline underline-offset-4">
              <Package className="h-4 w-4" /> GitHub Releases
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <div className="grain" aria-hidden="true" />
      <SubNav label="nightly" />
      <main>
        <Hero release={tonight} primary={primary} others={others} onGet={onGet} />
        <Deep>
          <Incantation />
          <Builds release={tonight} list={list} mine={primary} live={live} onGet={onGet} />
          <Notes release={tonight} />
          <Transmissions releases={nightlies.slice(1)} />
          <Afterword />
        </Deep>
      </main>
      {/* The shared footer is blue; turn it toward the nebula's amber for this page. */}
      <div className="[filter:hue-rotate(185deg)_saturate(0.75)_brightness(0.85)]">
        <Footer home={HOME} />
      </div>
      <Pops pops={pops} />
      <Started build={started} onClose={close} next="../download/#start" />
    </div>
  );
}
