import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { AnimatePresence, animate, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Mascot } from '../components/Mascot';
import { Fluted } from '../components/Fluted';
import { SubNav } from '../components/SubNav';
import { Heading, Reveal, Words, ease } from '../components/ui';
import { Footer } from '../sections/Footer';
import abstract from '../assets/hero-abstract.avif';
import { useLenis } from '../lib/useLenis';
import { COLOR_LIST, EYES_LABEL, EYES_LIST, EYE_AT, SHAPE_LABEL, SHAPE_LIST, type Eyes, type Shape } from '../lib/shapes';

const HOME = '../';


/* ---------------- Hero: the parade ---------------- */

type Dancer = { shape: Shape; color: string; eyes: Eyes };
const TROUPE: Dancer[] = [
  { shape: 'leaf', color: '#4cbe6c', eyes: 'dots' },
  { shape: 'diamond', color: '#8b5cf6', eyes: 'dots' },
  { shape: 'hex', color: '#3b82f6', eyes: 'wide' },
  { shape: 'pill', color: '#ec4899', eyes: 'happy' },
  { shape: 'triangle', color: '#f06f2c', eyes: 'wide' },
  { shape: 'blob', color: '#f2a533', eyes: 'sleepy' },
  { shape: 'square', color: '#3fb5a3', eyes: 'dots' },
  { shape: 'blob', color: '#3b82f6', eyes: 'dots' },
];

/** Three depths: far ones are small, slow and soft; near ones big and quick. */
const BANDS = [
  { top: 14, size: 46, travel: 46, count: 6, opacity: 0.55, blur: 0, z: 0, offset: 0 },
  { top: 27, size: 70, travel: 34, count: 5, opacity: 0.85, blur: 0, z: 0, offset: 2 },
  { top: 76, size: 104, travel: 26, count: 4, opacity: 1, blur: 0, z: 20, offset: 5 },
];

function DancingJit({ d, size, i }: { d: Dancer; size: number; i: number }) {
  const [happy, setHappy] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setHappy(true);
        setTimeout(() => setHappy(false), 1400);
        loop();
      }, 2500 + Math.random() * 5000);
    };
    loop();
    return () => clearTimeout(t);
  }, []);
  // Same beat for everyone; each jit lands a little after the one in front.
  return (
    <div className="bop" style={{ animationDelay: `${-((i * 0.13) % 1.1)}s` }}>
      <Mascot shape={d.shape} color={d.color} eyes={happy ? 'happy' : d.eyes} size={size} gaze={[0.9, -0.15]} />
    </div>
  );
}

function Parade({ front }: { front: boolean }) {
  const reduced = useReducedMotion();
  const scale = typeof window === 'undefined' ? 1 : Math.max(0.6, Math.min(1, window.innerWidth / 1300));
  if (reduced) return null;
  return (
    <>
      {BANDS.filter((b) => (b.z > 0) === front).map((b, bi) =>
        Array.from({ length: b.count }).map((_, k) => {
          const d = TROUPE[(k + b.offset) % TROUPE.length];
          const style: CSSProperties = {
            top: `${b.top}%`,
            animationDuration: `${b.travel}s`,
            animationDelay: `${-(k / b.count) * b.travel - bi * 3.1}s`,
            opacity: b.opacity,
            filter: b.blur ? `blur(${b.blur}px)` : undefined,
          };
          return (
            <div key={`${bi}-${k}`} className="parade" style={style}>
              <DancingJit d={d} size={Math.round(b.size * scale)} i={k + b.offset} />
            </div>
          );
        }),
      )}
    </>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div className="absolute inset-x-0 top-[-20%] h-[130%]" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease }}>
          <Fluted src={abstract} />
        </motion.div>
        <div className="noise absolute inset-0" />
        <div className="fade-to-bottom absolute inset-x-0 -bottom-px h-[34%]" />
      </div>

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Parade front={false} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
        <h1 className="text-[clamp(56px,11vw,156px)] font-semibold leading-[0.9] tracking-[-0.055em] text-white [text-shadow:0_4px_60px_rgba(0,24,90,0.45)]">
          <motion.span className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4, ease }}>
            Meet the jits.
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.65, ease }}
          className="mx-auto mt-7 max-w-lg text-[clamp(17px,1.6vw,20px)] leading-relaxed text-white/85 [text-shadow:0_1px_24px_rgba(0,24,90,0.45)]"
        >
          The little shapes that live in Nest. Every agent gets one, they never stop looking around, and none of them has a mouth.
        </motion.p>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
        <Parade front />
      </div>
    </section>
  );
}

/* ---------------- Anatomy ---------------- */

const PARTS = [
  { id: 'body', title: 'Body', text: 'One of seven shapes, drawn on a 100 × 100 grid. The pointy ones get soft corners from a thick, rounded stroke in their own colour.' },
  { id: 'eyes', title: 'Eyes', text: 'Always two, eight units either side of a centre point. Four styles, and the style is the whole personality.' },
  { id: 'glance', title: 'Glance', text: 'The eyes sit a little up and to the right of centre, so every jit looks like it just noticed something off to the side.' },
  { id: 'colour', title: 'Colour', text: 'Ten flat colours: brown, red, orange, amber, green, teal, blue, purple, pink and grey. No gradients, no outlines.' },
  { id: 'mouth', title: 'Mouth', text: 'None. Jits say everything with their eyes, which turns out to be plenty.' },
] as const;
type Part = (typeof PARTS)[number]['id'];

function Anatomy() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<Part>('body');
  const [auto, setAuto] = useState(true);
  const [k, setK] = useState(0);
  const [hop, setHop] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const iv = setInterval(() => setK((v) => v + 1), 950);
    return () => clearInterval(iv);
  }, [reduced]);
  useEffect(() => {
    if (!auto || reduced) return;
    const iv = setInterval(() => setActive((a) => PARTS[(PARTS.findIndex((p) => p.id === a) + 1) % PARTS.length].id), 4200);
    return () => clearInterval(iv);
  }, [auto, reduced]);
  useEffect(() => setHop((h) => h + 1), [active]);

  const shape: Shape = active === 'body' ? SHAPE_LIST[k % SHAPE_LIST.length] : active === 'glance' ? 'blob' : 'hex';
  const eyes: Eyes = active === 'eyes' ? EYES_LIST[k % EYES_LIST.length] : active === 'mouth' ? 'happy' : 'dots';
  const color = active === 'colour' ? COLOR_LIST[k % COLOR_LIST.length] : '#3b82f6';
  const SIZE = 280;
  const [ex, ey] = EYE_AT[shape];
  const caption =
    active === 'body' ? `${SHAPE_LABEL[shape]}, ${SHAPE_LIST.indexOf(shape) + 1} of 7`
    : active === 'eyes' ? `${EYES_LABEL[eyes]}, ${EYES_LIST.indexOf(eyes) + 1} of 4`
    : active === 'glance' ? `eyes at ${ex}, ${ey} · centre at 50, 50`
    : active === 'colour' ? color
    : 'no mouth';

  return (
    <section className="relative px-5 pt-24 pb-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative mx-auto grid h-[440px] w-full max-w-[480px] place-items-center">
          <motion.div
            className="absolute inset-0 [mask-image:radial-gradient(circle_at_50%_50%,#000_22%,transparent_62%)]"
            animate={{ opacity: active === 'body' || active === 'glance' ? 1 : 0.4 }}
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: `${SIZE / 10}px ${SIZE / 10}px`,
              backgroundPosition: 'center',
            }}
          />
          <motion.div className="relative" style={{ width: SIZE, height: SIZE }} animate={reduced ? undefined : { y: [0, -10, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}>
            <Mascot shape={shape} color={color} eyes={eyes} size={SIZE} hop={hop} gaze={active === 'glance' ? [0, 0] : null} track={active !== 'glance'} />
            <AnimatePresence>
              {active === 'glance' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  className="pointer-events-none absolute"
                  style={{ left: `${ex}%`, top: `${ey}%` }}
                >
                  <span className="absolute -left-12 top-0 h-px w-24 bg-white/70" />
                  <span className="absolute -top-12 left-0 h-24 w-px bg-white/70" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div key={caption} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute bottom-0 font-mono text-[12px] text-faint">
              {caption}
            </motion.div>
          </AnimatePresence>
        </div>

        <div>
          <Heading title="What a jit is made of." />
          <div className="mt-10 space-y-1">
            {PARTS.map((p, i) => {
              const on = p.id === active;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setActive(p.id); setAuto(false); }}
                  onMouseEnter={() => { setActive(p.id); setAuto(false); }}
                  className="group block w-full py-3 text-left"
                >
                  <div className="flex items-baseline gap-4">
                    <span className={`font-mono text-[12px] transition-colors ${on ? 'text-ink-2' : 'text-faint'}`}>0{i + 1}</span>
                    <span className={`text-[24px] font-semibold tracking-tight transition-colors ${on ? 'text-ink' : 'text-faint group-hover:text-muted'}`}>{p.title}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease }}
                        className="overflow-hidden pl-9 text-[16px] leading-relaxed text-muted"
                      >
                        <span className="block max-w-md pt-2">{p.text}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Shapes: a strip that drifts past as you scroll ---------------- */

const SHAPES_INFO: { shape: Shape; color: string; eyes: Eyes; text: string }[] = [
  { shape: 'blob', color: '#3b82f6', eyes: 'dots', text: 'The original. It’s the Nest app icon, so it’s usually the first jit anyone meets.' },
  { shape: 'square', color: '#3fb5a3', eyes: 'dots', text: 'Corners rounded to 24 units, so it’s a lot less strict than it looks.' },
  { shape: 'hex', color: '#3b82f6', eyes: 'wide', text: 'Likes things orderly. The Researcher is one, and it’s wide-eyed about everything.' },
  { shape: 'pill', color: '#ec4899', eyes: 'happy', text: 'Long, low and comfortable. The Writer is a pill, and it’s almost always happy.' },
  { shape: 'diamond', color: '#8b5cf6', eyes: 'dots', text: 'Balances on a single corner and has never once fallen over. The Engineer’s shape.' },
  { shape: 'leaf', color: '#4cbe6c', eyes: 'dots', text: 'A drop, and the Chief of Staff’s shape. Small, green and quietly in charge.' },
  { shape: 'triangle', color: '#f06f2c', eyes: 'wide', text: 'Its eyes sit lower than anyone else’s, down where there’s room. The Outreach jit.' },
];

function Shapes() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dist = useRef(0);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (track.current) dist.current = Math.max(0, track.current.scrollWidth - window.innerWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, (v) => -v * dist.current);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(SHAPES_INFO.length - 1, Math.round(v * (SHAPES_INFO.length - 1)))));

  return (
    <section ref={ref} className="relative" style={{ height: `${SHAPES_INFO.length * 50 + 60}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-5">
          <Heading title="Seven shapes." lede="Each has a favourite agent. Keep scrolling to meet them all." />
        </div>
        <motion.div ref={track} style={{ x }} className="mt-16 flex w-max items-start gap-[6vw] pr-[30vw] pl-[max(20px,calc((100vw-72rem)/2+20px))]">
          {SHAPES_INFO.map((s, i) => {
            const on = i === active;
            return (
              <div key={s.shape} className="w-[min(300px,70vw)] shrink-0" style={{ marginTop: i % 2 ? 64 : 0 }}>
                <motion.div animate={{ scale: on ? 1.08 : 0.92, opacity: on ? 1 : 0.55 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="origin-bottom-left">
                  <Mascot shape={s.shape} color={s.color} eyes={on ? 'happy' : s.eyes} size={150} track hop={on ? 1 : 0} />
                </motion.div>
                <motion.div animate={{ opacity: on ? 1 : 0.4 }} className="mt-8">
                  <div className="font-mono text-[12px] text-faint">0{i + 1}</div>
                  <h3 className="mt-1 text-[26px] font-semibold tracking-tight">{SHAPE_LABEL[s.shape]}</h3>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{s.text}</p>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Moods ---------------- */

const MOODS: { eyes: Eyes; color: string; text: string }[] = [
  { eyes: 'dots', color: '#3b82f6', text: 'Two slanted marks. The default. Blinks.' },
  { eyes: 'happy', color: '#ec4899', text: 'Two little arcs, for when something just went well.' },
  { eyes: 'wide', color: '#3fb5a3', text: 'Fully open. Blinks too, a bit more dramatically.' },
  { eyes: 'sleepy', color: '#f2a533', text: 'Halfway through a blink, permanently. Doesn’t mind.' },
];

function Moods() {
  return (
    <section className="relative px-5 py-36">
      <div className="mx-auto max-w-6xl">
        <Heading title="Four moods." lede="Only curious and wide-eyed jits blink. Happy and sleepy ones are already halfway there." />
        <div className="mt-20 grid gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {MOODS.map((m, i) => (
            <motion.div
              key={m.eyes}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px 0px' }}
              transition={{ duration: 0.8, delay: i * 0.1, ease }}
              className={`flex flex-col items-center text-center ${i % 2 ? 'lg:mt-16' : ''}`}
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 3.6 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.08 }}
              >
                <Mascot shape="blob" color={m.color} eyes={m.eyes} size={128} track />
              </motion.div>
              <h3 className="mt-7 text-[22px] font-semibold tracking-tight">{EYES_LABEL[m.eyes]}</h3>
              <p className="mt-2 max-w-[220px] text-[15px] leading-relaxed text-muted">{m.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Numbers, as one run of type ---------------- */

function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref} className="tabular-nums">{n}</span>;
}

const NUMBERS = [
  { n: 280, text: 'possible jits.', note: '7 shapes × 10 colours × 4 moods' },
  { n: 2, text: 'eyes each.', note: 'sixteen units apart, every time' },
  { n: 0, text: 'mouths.', note: 'not needed' },
];

function Numbers() {
  return (
    <section className="relative px-5 py-28">
      <div className="mx-auto max-w-6xl space-y-6">
        {NUMBERS.map((x, i) => (
          <motion.div
            key={x.text}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px 0px' }}
            transition={{ duration: 0.8, delay: i * 0.08, ease }}
            className="flex flex-wrap items-baseline gap-x-6 gap-y-1"
          >
            <span className="text-[clamp(48px,9vw,128px)] font-semibold leading-[0.95] tracking-[-0.05em]">
              <Count to={x.n} /> <span className="text-muted">{x.text}</span>
            </span>
            <span className="font-mono text-[13px] text-faint">{x.note}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Playground ---------------- */

type Jit = { id: number; shape: Shape; color: string; eyes: Eyes; x: number; y: number; size: number };
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
let nextId = 0;
const makeJit = (x = 6 + Math.random() * 88, y = 25 + Math.random() * 60): Jit => ({
  id: nextId++,
  shape: pick(SHAPE_LIST),
  color: pick(COLOR_LIST),
  eyes: pick(['dots', 'dots', 'wide', 'sleepy', 'happy'] as Eyes[]),
  x,
  y,
  size: 44 + Math.round(Math.random() * 40),
});

function Playground() {
  const [jits, setJits] = useState<Jit[]>([]);
  const [cheered, setCheered] = useState<Record<number, number>>({});
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { once: true, margin: '-80px 0px' });

  useEffect(() => {
    if (inView && jits.length === 0) setJits(Array.from({ length: 14 }, () => makeJit()));
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  const cheer = (id: number) => {
    setCheered((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    setTimeout(
      () =>
        setCheered((c) => {
          const next = { ...c };
          delete next[id];
          return next;
        }),
      1500,
    );
  };

  const add = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    setJits((js) => [...js.slice(js.length >= 60 ? 1 : 0), makeJit(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100)]);
  };

  return (
    <section className="relative pb-24">
      <div className="mx-auto max-w-6xl px-5">
        <Heading title="Say hi." lede="Click anywhere below to add a jit. Click a jit to cheer it up." />
        <Reveal className="mt-6 flex items-center gap-5 font-mono text-[13px]">
          <span className="text-faint tabular-nums">{jits.length} jits</span>
          <button type="button" onClick={() => jits.forEach((j, i) => setTimeout(() => cheer(j.id), i * 45))} className="text-ink-2 underline decoration-white/20 underline-offset-4 transition hover:text-ink hover:decoration-white/60">
            wave
          </button>
          <button type="button" onClick={() => setJits([])} className="text-muted underline decoration-white/20 underline-offset-4 transition hover:text-ink hover:decoration-white/60">
            clear
          </button>
        </Reveal>
      </div>

      <div ref={box} onClick={add} className="relative mt-6 h-[480px] cursor-crosshair overflow-hidden">
        {jits.length === 0 && inView && <div className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-[13px] text-faint">empty nest. click to add one.</div>}
        <AnimatePresence>
          {jits.map((j, i) => (
            <motion.button
              key={j.id}
              type="button"
              aria-label="Cheer up this jit"
              onClick={() => cheer(j.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${j.x}%`, top: `${j.y}%` }}
              initial={{ y: -520, opacity: 0, rotate: (i % 2 ? 1 : -1) * 25 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 220, damping: 15, delay: jits.length > 14 ? 0 : i * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
            >
              <Mascot shape={j.shape} color={j.color} eyes={cheered[j.id] ? 'happy' : j.eyes} size={j.size} track hop={cheered[j.id] ?? 0} />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------------- Page ---------------- */

export default function Jits() {
  useLenis();
  return (
    <div>
      <div className="grain" aria-hidden="true" />
      <SubNav label="jits" />
      <main>
        <Hero />
        <Anatomy />
        <Shapes />
        <Moods />
        <Numbers />
        <Playground />
        <section className="px-5 pt-10 pb-24 text-center">
          <h2 className="mx-auto max-w-3xl text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.05] tracking-[-0.035em]">
            <Words text="Want one of your own?" />
          </h2>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-5 max-w-lg text-[17px] text-muted">Every agent you make in Nest comes with a jit.</p>
            <a href={HOME} className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-[15px] font-semibold text-bg transition hover:bg-white">
              <Mascot shape="blob" color="#3b82f6" size={22} /> Get Nest
            </a>
          </Reveal>
        </section>
      </main>
      <Footer home={HOME} />
    </div>
  );
}
