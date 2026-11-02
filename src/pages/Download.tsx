import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Apple, ArrowDown, ArrowUpRight, Check, Copy, Download as DownloadIcon, Package, ShieldCheck, X } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { MiniJit } from '../components/MiniJit';
import { Fluted } from '../components/Fluted';
import { SubNav } from '../components/SubNav';
import { LinuxIcon, WindowsIcon } from '../components/icons';
import { Blocks, sections } from '../components/Markdown';
import { Heading, Reveal, ease } from '../components/ui';
import { Footer } from '../sections/Footer';
import abstract from '../assets/hero-abstract.avif';
import { useLenis } from '../lib/useLenis';
import { REPO } from '../lib/links';
import { COLOR_LIST, SHAPE_LIST, type Eyes, type Shape } from '../lib/shapes';
import { ago, builds, detectOS, formatDate, formatSize, pickFor, useReleases, type Build, type OS, type Release } from '../lib/release';

const HOME = '../';

const osIcon = (os: string, cls = 'h-5 w-5') =>
  os === 'windows' ? <WindowsIcon className={cls} /> : os === 'mac' ? <Apple className={cls} /> : <LinuxIcon className={cls} />;

const version = (r: Release) => r.tag.replace(/^v/, '');
const sha = (b: Build) => b.asset.digest?.replace(/^sha256:/, '') ?? null;

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied((c) => (c === text ? null : c)), 1400);
  };
  return { copied, copy };
}

function CopyLine({ cmd, prompt = '$' }: { cmd: string; prompt?: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(cmd)}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-line bg-bg-2/80 px-3.5 py-2.5 text-left font-mono text-[12.5px] text-ink-2 transition hover:border-line-2"
      aria-label={`Copy: ${cmd}`}
    >
      <span className="text-faint">{prompt}</span>
      <span className="flex-1 truncate">{cmd}</span>
      {copied ? <Check className="h-3.5 w-3.5 shrink-0 text-ok" /> : <Copy className="h-3.5 w-3.5 shrink-0 text-faint transition group-hover:text-muted" />}
    </button>
  );
}


/* ---------------- Confetti, but jits ---------------- */

type Pop = { id: number; x: number; y: number; jits: { shape: Shape; color: string; dx: number; up: number; down: number; spin: number; size: number; t: number }[] };
let popId = 0;

function makePop(x: number, y: number): Pop {
  return {
    id: popId++,
    x,
    y,
    jits: Array.from({ length: 22 }, (_, i) => ({
      shape: SHAPE_LIST[i % SHAPE_LIST.length],
      color: COLOR_LIST[(i * 7) % COLOR_LIST.length],
      dx: (Math.random() - 0.5) * Math.min(900, window.innerWidth * 0.9),
      up: 140 + Math.random() * 260,
      down: window.innerHeight * 0.6 + Math.random() * 300,
      spin: (Math.random() - 0.5) * 720,
      size: 18 + Math.random() * 26,
      t: 1.5 + Math.random() * 0.9,
    })),
  };
}

function Pops({ pops }: { pops: Pop[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {pops.map((p) =>
        p.jits.map((j, i) => (
          <motion.div
            key={`${p.id}-${i}`}
            className="absolute"
            style={{ left: p.x - j.size / 2, top: p.y - j.size / 2 }}
            initial={{ x: 0, y: 0, rotate: 0, scale: 0.3, opacity: 1 }}
            animate={{ x: j.dx, y: [0, -j.up, j.down], rotate: j.spin, scale: [0.3, 1, 1], opacity: [1, 1, 0] }}
            transition={{
              duration: j.t,
              x: { duration: j.t, ease: 'linear' },
              y: { duration: j.t, times: [0, 0.32, 1], ease: ['easeOut', 'easeIn'] },
              opacity: { duration: j.t, times: [0, 0.8, 1] },
            }}
          >
            <MiniJit shape={j.shape} color={j.color} size={j.size} happy />
          </motion.div>
        )),
      )}
    </div>
  );
}

/* ---------------- Hero ---------------- */

const PEEKERS: { shape: Shape; color: string; eyes: Eyes }[] = [
  { shape: 'leaf', color: '#4cbe6c', eyes: 'dots' },
  { shape: 'hex', color: '#3b82f6', eyes: 'wide' },
  { shape: 'pill', color: '#ec4899', eyes: 'dots' },
  { shape: 'diamond', color: '#8b5cf6', eyes: 'sleepy' },
];

function GetButton({ build, onGet }: { build: Build; onGet: (b: Build, e: MouseEvent<HTMLElement>) => void }) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [done, setDone] = useState(false);
  const [hop, setHop] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const { platform, asset } = build;
  const label = platform.os === 'linux' ? `Download for Linux` : `Download for ${platform.title}`;

  return (
    <div className="relative inline-block">
      {/* Jits peeking over the top edge, hiding behind the button. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-5" aria-hidden="true">
        {PEEKERS.map((p, i) => (
          <motion.div
            key={i}
            initial={{ y: 10 }}
            animate={{ y: done ? -50 : hover ? -42 : -31, rotate: hover && !done ? (i - 1.5) * 6 : 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 17, delay: reduced ? 0 : (hover ? i : PEEKERS.length - i) * 0.035 }}
          >
            <Mascot shape={p.shape} color={p.color} eyes={done ? 'happy' : hover ? 'wide' : p.eyes} size={44} track hop={hop} />
          </motion.div>
        ))}
      </div>

      <motion.a
        href={asset.url}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={(e) => {
          setDone(true);
          setHop((h) => h + 1);
          onGet(build, e);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setDone(false), 2600);
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className="relative z-10 flex items-center gap-4 rounded-full bg-ink py-3 pr-8 pl-3 text-left text-bg shadow-[0_24px_80px_-20px_rgba(0,30,120,0.75)] transition-colors hover:bg-white"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-bg text-ink">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={done ? 'done' : 'icon'} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.18 }}>
              {done ? <Check className="h-5 w-5 text-ok" strokeWidth={3} /> : osIcon(platform.os)}
            </motion.span>
          </AnimatePresence>
        </span>
        <span>
          <span className="block text-[17px] font-semibold tracking-tight">{done ? 'Download started' : label}</span>
          <span className="block font-mono text-[12px] text-bg/55">
            {asset.name} · {formatSize(asset.size)}
          </span>
        </span>
      </motion.a>
    </div>
  );
}

function NoBuild({ os }: { os: OS }) {
  return (
    <div className="mx-auto flex max-w-md items-center gap-4 rounded-[22px] border border-white/15 bg-black/30 p-4 pr-6 text-left backdrop-blur-md">
      <Mascot shape={os === 'mac' ? 'leaf' : 'pill'} color={os === 'mac' ? '#6e6e76' : '#3fb5a3'} eyes="sleepy" size={52} />
      <div>
        <div className="text-[16px] font-semibold text-white">{os === 'mac' ? 'Not on macOS yet.' : 'Nest lives on your computer.'}</div>
        <div className="mt-0.5 text-[14px] leading-snug text-white/70">
          {os === 'mac' ? 'Windows and Linux builds are below. A Mac build will show up here the moment it ships.' : 'Open this page on Windows or Linux to grab it. All builds are below.'}
        </div>
      </div>
    </div>
  );
}

function Hero({ release, primary, os, others, onGet }: { release: Release; primary?: Build; os: OS; others: Build[]; onGet: (b: Build, e: MouseEvent<HTMLElement>) => void }) {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div className="absolute inset-x-0 top-[-20%] h-[130%]" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease }}>
          <Fluted src={abstract} />
        </motion.div>
        <div className="noise absolute inset-0" />
        <div className="fade-to-bottom absolute inset-x-0 -bottom-px h-[40%]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
        <motion.a
          href={release.url}
          target="_blank"
          rel="noopener"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/25 py-1.5 pr-4 pl-1.5 text-[13px] text-white/85 backdrop-blur-md transition hover:bg-black/35"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[12px] font-semibold text-black">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
            </span>
            {release.tag}
          </span>
          Latest release · {ago(release.publishedAt)}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </motion.a>

        <h1 className="mt-7 text-[clamp(52px,10vw,140px)] font-semibold leading-[0.9] tracking-[-0.055em] text-white [text-shadow:0_4px_60px_rgba(0,24,90,0.45)]">
          {['Take the jits', 'home.'].map((line, i) => (
            <motion.span
              key={line}
              className={`block ${i ? 'text-white/60' : ''}`}
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
          className="mx-auto mt-7 max-w-xl text-[clamp(17px,1.6vw,20px)] leading-relaxed text-white/80"
        >
          Nest {version(release)} for Windows and Linux. Free, MIT licensed, and running on the Codex and Claude Code subscriptions you already have.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.95, ease }} className="mt-16">
          {primary ? <GetButton build={primary} onGet={onGet} /> : <NoBuild os={os} />}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.2 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[14px] text-white/65"
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
          <a href="#platforms" className="inline-flex items-center gap-1 text-white/90 underline decoration-white/30 underline-offset-4 transition hover:decoration-white">
            All downloads <ArrowDown className="h-3.5 w-3.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Platforms ---------------- */

function PlatformCard({ build, mine, onGet, i }: { build: Build; mine: boolean; onGet: (b: Build, e: MouseEvent<HTMLElement>) => void; i: number }) {
  const { platform, asset } = build;
  const [hop, setHop] = useState(0);
  const [happy, setHappy] = useState(false);
  const { copied, copy } = useCopy();
  const hash = sha(build);
  const howto = platform.howto(asset.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px 0px' }}
      transition={{ duration: 0.8, delay: i * 0.08, ease }}
      onHoverStart={() => { setHop((h) => h + 1); setHappy(true); }}
      onHoverEnd={() => setHappy(false)}
      className={`card relative flex min-w-0 flex-col overflow-hidden p-6 transition-colors ${mine ? 'border-white/20' : 'hover:border-line-2'}`}
    >
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full opacity-25 blur-3xl"
        style={{ background: platform.jit.color }}
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between">
        <Mascot shape={platform.jit.shape} color={platform.jit.color} eyes={happy ? 'happy' : platform.jit.eyes} size={64} track hop={hop} />
        <div className="flex items-center gap-2">
          {mine && <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[11px] text-ink-2">your system</span>}
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] text-ink-2">{osIcon(platform.os, 'h-4 w-4')}</span>
        </div>
      </div>

      <h3 className="relative mt-6 text-[24px] font-semibold tracking-tight">{platform.title}</h3>
      <div className="relative mt-0.5 font-mono text-[12px] text-faint">{platform.subtitle}</div>
      <p className="relative mt-3 text-[15px] leading-relaxed text-muted">{platform.blurb}</p>

      <div className="relative mt-5 space-y-2">
        {howto.cmd ? <CopyLine cmd={howto.cmd} /> : <p className="rounded-xl border border-line bg-bg-2/80 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-2">{howto.text}</p>}
        {hash && (
          <button
            type="button"
            onClick={() => copy(hash)}
            title={hash}
            className="flex w-full items-center gap-2 px-1 text-left font-mono text-[11.5px] text-faint transition hover:text-muted"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">sha256 {hash.slice(0, 12)}…{hash.slice(-8)}</span>
            {copied ? <Check className="ml-auto h-3 w-3 shrink-0 text-ok" /> : <Copy className="ml-auto h-3 w-3 shrink-0" />}
          </button>
        )}
      </div>

      <div className="relative mt-auto pt-6">
        <motion.a
          href={asset.url}
          onClick={(e) => onGet(build, e)}
          whileTap={{ scale: 0.97 }}
          className={`flex h-12 items-center gap-3 rounded-full px-5 text-[14.5px] font-semibold transition-colors ${mine ? 'bg-ink text-bg hover:bg-white' : 'bg-white/[0.07] text-ink ring-1 ring-white/10 hover:bg-white/[0.12]'}`}
        >
          <DownloadIcon className="h-4 w-4" />
          <span className="flex-1 truncate">{asset.name}</span>
          <span className={`font-mono text-[12px] ${mine ? 'text-bg/55' : 'text-faint'}`}>{formatSize(asset.size)}</span>
        </motion.a>
      </div>
    </motion.div>
  );
}

function Platforms({ release, list, mine, live, onGet }: { release: Release; list: Build[]; mine?: Build; live: boolean; onGet: (b: Build, e: MouseEvent<HTMLElement>) => void }) {
  const hasMac = list.some((b) => b.platform.os === 'mac');
  return (
    <section id="platforms" className="relative scroll-mt-24 px-5 pt-16 pb-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading title="Pick your nest." lede="Every build is 64-bit and comes straight from GitHub Releases. Same app everywhere, so choose whichever suits your machine." />
          <Reveal delay={0.2}>
            <a href={release.url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 font-mono text-[12px] text-faint transition hover:text-ink-2">
              <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-ok' : 'bg-faint'}`} />
              {release.tag} · {formatDate(release.publishedAt)}
              {live && ' · live from GitHub'}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((b, i) => (
            <PlatformCard key={b.platform.kind} build={b} mine={b === mine} onGet={onGet} i={i} />
          ))}
        </div>

        {!hasMac && (
          <Reveal delay={0.1} className="mt-4">
            <div className="card flex flex-col items-start gap-5 p-5 sm:flex-row sm:items-center">
              <Mascot shape="leaf" color="#6e6e76" eyes="sleepy" size={44} />
              <div className="flex-1">
                <div className="text-[16px] font-semibold">macOS is still asleep.</div>
                <div className="text-[14.5px] text-muted">There's no Mac build yet. Watch the repo and you'll hear the moment one ships.</div>
              </div>
              <a href={REPO} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-[14px] font-medium ring-1 ring-white/10 transition hover:bg-white/10">
                <Apple className="h-4 w-4" /> Watch on GitHub
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ---------------- Getting started ---------------- */

const TEMPLATES: { name: string; shape: Shape; color: string; eyes: Eyes }[] = [
  { name: 'Chief of Staff', shape: 'leaf', color: '#4cbe6c', eyes: 'dots' },
  { name: 'Researcher', shape: 'hex', color: '#3b82f6', eyes: 'wide' },
  { name: 'Writer', shape: 'pill', color: '#ec4899', eyes: 'happy' },
  { name: 'Engineer', shape: 'diamond', color: '#8b5cf6', eyes: 'dots' },
  { name: 'Outreach', shape: 'triangle', color: '#f06f2c', eyes: 'wide' },
  { name: 'Daily Briefer', shape: 'blob', color: '#f2a533', eyes: 'sleepy' },
];

function Templates() {
  const [on, setOn] = useState<number | null>(null);
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-2.5">
        {TEMPLATES.map((t, i) => (
          <button
            key={t.name}
            type="button"
            onMouseEnter={() => setOn(i)}
            onMouseLeave={() => setOn(null)}
            onFocus={() => setOn(i)}
            onBlur={() => setOn(null)}
            aria-label={t.name}
          >
            <Mascot shape={t.shape} color={t.color} eyes={on === i ? 'happy' : t.eyes} size={38} track hop={on === i ? 1 : 0} />
          </button>
        ))}
      </div>
      <div className="mt-3 h-5 font-mono text-[12px] text-faint">
        <AnimatePresence mode="wait">
          <motion.span key={on ?? 'none'} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="block">
            {on === null ? 'six templates to start from' : TEMPLATES[on].name}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Steps({ node }: { node: string }) {
  const steps: { title: string; text: ReactNode; jit: { shape: Shape; color: string; eyes: Eyes }; extra?: ReactNode }[] = [
    {
      title: 'Install Nest',
      text: 'Run what you just downloaded. It installs per user, so no admin prompt and nothing system-wide.',
      jit: { shape: 'square', color: '#3fb5a3', eyes: 'dots' },
    },
    {
      title: 'Sign in to a provider',
      text: (
        <>
          Nest drives the official Codex and Claude Code tools on your own subscription. One is enough. You'll need Node.js {node}.
        </>
      ),
      jit: { shape: 'hex', color: '#3b82f6', eyes: 'wide' },
      extra: (
        <div className="mt-5 space-y-2">
          <CopyLine cmd="npm i -g @openai/codex && codex login" />
          <CopyLine cmd="npm i -g @anthropic-ai/claude-code && claude auth login --claudeai" />
        </div>
      ),
    },
    {
      title: 'Hatch your first agent',
      text: 'Open Nest and start from a template, or from scratch. Every agent gets a jit of its own.',
      jit: { shape: 'blob', color: '#f2a533', eyes: 'happy' },
      extra: <Templates />,
    },
  ];

  return (
    <section id="start" className="relative scroll-mt-24 px-5 py-28">
      <div className="mx-auto max-w-6xl">
        <Heading title="Three steps to your first agent." />
        <div className="relative mt-16 grid gap-12 lg:grid-cols-3 lg:gap-8">
          <div className="pointer-events-none absolute top-[38px] right-[16%] left-[8%] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14)_12%,rgba(255,255,255,0.14)_88%,transparent)] lg:block" aria-hidden="true" />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px 0px' }}
              transition={{ duration: 0.8, delay: i * 0.12, ease }}
              className="relative min-w-0"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-[76px] w-[76px] place-items-center rounded-[24px] border border-line bg-bg">
                  <Mascot shape={s.jit.shape} color={s.jit.color} eyes={s.jit.eyes} size={48} track />
                </div>
                <span className="relative bg-bg pr-3 font-mono text-[12px] text-faint">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-[24px] font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 max-w-sm text-[15.5px] leading-relaxed text-muted">{s.text}</p>
              {s.extra}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Verify ---------------- */

function Verify({ list }: { list: Build[] }) {
  const hashed = list.filter((b) => sha(b));
  const [tab, setTab] = useState<'windows' | 'linux'>(() => (detectOS() === 'linux' ? 'linux' : 'windows'));
  const shown = hashed.filter((b) => (tab === 'windows' ? b.platform.os === 'windows' : b.platform.os !== 'windows'));
  if (!hashed.length) return null;

  return (
    <section className="relative px-5 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Reveal>
            <motion.div animate={{ rotate: [-4, 4, -4], y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="inline-block">
              <Mascot shape="diamond" color="#8b5cf6" eyes="wide" size={72} track />
            </motion.div>
          </Reveal>
          <Heading className="mt-8" title="Unsigned, for now." lede="The installers aren't code-signed yet, so SmartScreen and some Linux desktops will warn the first time you run one. GitHub publishes a SHA-256 for every file, so you can check yours matches before you open it." />
        </div>

        <Reveal delay={0.1} className="min-w-0">
          <div className="overflow-hidden rounded-[20px] border border-line-2 bg-[#0d0d10] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
            <div className="flex h-11 items-center gap-1 border-b border-line px-2">
              {(['windows', 'linux'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${tab === t ? 'text-ink' : 'text-faint hover:text-muted'}`}
                >
                  {tab === t && <motion.span layoutId="verify-tab" className="absolute inset-0 rounded-lg bg-white/[0.07]" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className="relative">{osIcon(t, 'h-3.5 w-3.5')}</span>
                  <span className="relative">{t === 'windows' ? 'PowerShell' : 'Terminal'}</span>
                </button>
              ))}
            </div>
            <div className="space-y-5 p-5">
              {shown.map((b) => {
                const cmd = tab === 'windows' ? `(Get-FileHash .\\${b.asset.name}).Hash.ToLower()` : `sha256sum ${b.asset.name}`;
                return (
                  <div key={b.platform.kind}>
                    <CopyLine cmd={cmd} prompt={tab === 'windows' ? '>' : '$'} />
                    <div className="mt-2 flex gap-2 px-1 font-mono text-[11.5px] leading-relaxed">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok" strokeWidth={3} />
                      <span className="break-all text-ok/80">{sha(b)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Release notes ---------------- */

function Notes({ release }: { release: Release }) {
  const { intro, sections: all } = useMemo(() => sections(release.body), [release.body]);
  // The downloads table is the cards above, so leave it out; housekeeping goes last so the good stuff shows first.
  const later = (t: string) => /^(requirements?|notes?|known issues)$/i.test(t.trim());
  const parts = all.filter((s) => !/^downloads?$/i.test(s.title.trim())).sort((a, b) => Number(later(a.title)) - Number(later(b.title)));
  const [open, setOpen] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const [tall, setTall] = useState(true);
  useEffect(() => {
    if (body.current) setTall(body.current.scrollHeight > 760);
  }, [release.body]);

  if (!release.body.trim()) return null;

  return (
    <section className="relative px-5 py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.6fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Heading title={`What's in ${version(release)}.`} />
          <Reveal delay={0.15} className="mt-6 space-y-1.5 font-mono text-[12.5px] text-faint">
            <div>{release.name}</div>
            <div>{formatDate(release.publishedAt)}</div>
            <a href={release.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-ink-2 underline decoration-white/20 underline-offset-4 transition hover:text-ink hover:decoration-white/60">
              Read on GitHub <ArrowUpRight className="h-3 w-3" />
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="min-w-0">
          <div className="relative">
            <motion.div
              ref={body}
              initial={false}
              animate={{ height: open || !tall ? 'auto' : 720 }}
              transition={{ duration: 0.6, ease }}
              className="overflow-hidden"
            >
              {intro.length > 0 && (
                <div className="text-[18px] leading-relaxed text-ink-2 [&_p]:text-[18px]">
                  <Blocks blocks={intro} />
                </div>
              )}
              {parts.map((s) => (
                <div key={s.title} className="mt-12 border-t border-line pt-10">
                  <h3 className="mb-6 text-[13px] font-medium uppercase tracking-[0.16em] text-muted">{s.title}</h3>
                  <Blocks blocks={s.blocks} />
                </div>
              ))}
            </motion.div>
            {tall && (
              <div className={`${open ? 'mt-10' : 'absolute inset-x-0 bottom-0 pt-40'} flex justify-center bg-gradient-to-t from-bg via-bg/90 to-transparent`}>
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.06] px-5 text-[14px] font-medium ring-1 ring-white/10 transition hover:bg-white/10"
                >
                  {open ? 'Show less' : 'Read all the notes'}
                  <ArrowDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Older releases ---------------- */

function Older({ releases }: { releases: Release[] }) {
  if (!releases.length) return null;
  return (
    <section className="relative px-5 pb-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h3 className="text-[13px] font-medium uppercase tracking-[0.16em] text-muted">Earlier releases</h3>
        </Reveal>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {releases.map((r) => (
            <Reveal key={r.tag} y={12}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
                <a href={r.url} target="_blank" rel="noopener" className="w-28 font-mono text-[14px] text-ink hover:underline">
                  {r.tag}
                </a>
                <span className="w-40 text-[14px] text-faint">{formatDate(r.publishedAt)}</span>
                {r.prerelease && <span className="rounded-full bg-warn/10 px-2 py-0.5 font-mono text-[11px] text-warn">pre-release</span>}
                <div className="flex flex-1 flex-wrap justify-end gap-2">
                  {builds(r).map((b) => (
                    <a
                      key={b.platform.kind}
                      href={b.asset.url}
                      className="inline-flex h-8 items-center gap-2 rounded-full bg-white/[0.05] px-3 text-[12.5px] text-ink-2 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-ink"
                    >
                      {osIcon(b.platform.os, 'h-3.5 w-3.5')} {b.platform.title}
                      <span className="font-mono text-[11px] text-faint">{formatSize(b.asset.size)}</span>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- After you click ---------------- */

function Started({ build, onClose }: { build: Build | null; onClose: () => void }) {
  useEffect(() => {
    if (!build) return;
    const t = setTimeout(onClose, 9000);
    return () => clearTimeout(t);
  }, [build, onClose]);

  return (
    <AnimatePresence>
      {build && (
        <motion.div
          key={build.asset.name}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          role="status"
          className="fixed inset-x-4 bottom-5 z-[65] mx-auto flex max-w-[560px] items-center gap-4 rounded-[22px] border border-white/10 bg-[#141417]/90 p-3 pr-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
        >
          <Mascot shape={build.platform.jit.shape} color={build.platform.jit.color} eyes="happy" size={44} hop={1} />
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-semibold">On its way.</div>
            <div className="truncate text-[13px] text-muted">
              {build.asset.name} ·{' '}
              <a href={build.asset.url} className="text-ink-2 underline decoration-white/20 underline-offset-4 hover:decoration-white/60">
                didn't start?
              </a>
            </div>
          </div>
          <a href="#start" onClick={onClose} className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-bg transition hover:bg-white sm:inline-flex">
            Next steps <ArrowDown className="h-3.5 w-3.5" />
          </a>
          <button type="button" onClick={onClose} aria-label="Dismiss" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-faint transition hover:bg-white/5 hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Page ---------------- */

export default function Download() {
  useLenis();
  const reduced = useReducedMotion();
  const { latest, older, live } = useReleases();
  const [os] = useState(detectOS);
  const list = useMemo(() => builds(latest), [latest]);
  const primary = pickFor(os, list);
  const others = list.filter((b) => b !== primary);
  const node = /Node\.js\s+v?([\d.]+\+?)/i.exec(latest?.body ?? '')?.[1] ?? '22.12+';

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

  if (!latest) {
    return (
      <div>
        <SubNav label="download" />
        <main className="grid min-h-[100svh] place-items-center px-6 text-center">
          <div>
            <Mascot shape="blob" color="#6e6e76" eyes="sleepy" size={96} className="mx-auto" />
            <p className="mt-6 text-[18px] text-muted">No releases yet. They'll appear here as soon as one is published.</p>
            <a href={`${REPO}/releases`} className="mt-6 inline-flex items-center gap-2 text-ink underline underline-offset-4">
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
      <SubNav label="download" />
      <main>
        <Hero release={latest} primary={primary} os={os} others={others} onGet={onGet} />
        <Platforms release={latest} list={list} mine={primary} live={live} onGet={onGet} />
        <Steps node={node} />
        <Verify list={list} />
        <Notes release={latest} />
        <Older releases={older} />
      </main>
      <Footer home={HOME} />
      <Pops pops={pops} />
      <Started build={started} onClose={close} />
    </div>
  );
}
