import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Shuffle } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { SectionHead, Reveal } from '../components/ui';
import { COLOR_LIST, EYES_LABEL, EYES_LIST, SHAPE_LABEL, SHAPE_LIST, type Eyes, type Shape } from '../lib/shapes';

type Spec = { name: string; tagline: string; shape: Shape; color: string; eyes: Eyes; provider: 'Claude Code' | 'Codex' };

const TEMPLATES: Spec[] = [
  { name: 'Chief of Staff', tagline: 'Runs your team: sets up agents, delegates work, brings you decisions.', shape: 'leaf', color: '#4cbe6c', eyes: 'dots', provider: 'Claude Code' },
  { name: 'Engineer', tagline: 'Builds and fixes code in your project folder.', shape: 'diamond', color: '#8b5cf6', eyes: 'dots', provider: 'Codex' },
  { name: 'Researcher', tagline: 'Digs into questions and comes back with sourced answers.', shape: 'hex', color: '#3b82f6', eyes: 'wide', provider: 'Claude Code' },
  { name: 'Writer', tagline: 'Drafts posts, emails and docs in your voice.', shape: 'pill', color: '#ec4899', eyes: 'happy', provider: 'Claude Code' },
  { name: 'Outreach', tagline: 'Finds prospects and drafts personal outreach.', shape: 'triangle', color: '#f06f2c', eyes: 'wide', provider: 'Claude Code' },
  { name: 'Daily Briefer', tagline: 'Sends a short brief on topics you care about.', shape: 'blob', color: '#f2a533', eyes: 'sleepy', provider: 'Claude Code' },
];

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

function Chip({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: ReactNode; label: string }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.9 }}
      className={`relative grid h-14 w-14 cursor-pointer place-items-center rounded-2xl border transition-colors ${active ? 'border-transparent' : 'border-line bg-bg-2/60 hover:border-line-2'}`}
    >
      {active && <motion.span layoutId={`sel-${label.split(':')[0]}`} className="absolute inset-0 rounded-2xl border border-white/40 bg-white/[0.04]" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
      <span className="relative">{children}</span>
    </motion.button>
  );
}

export function Builder() {
  const reduced = useReducedMotion();
  const [spec, setSpec] = useState<Spec>(TEMPLATES[0]);
  const [hop, setHop] = useState(0);
  const [auto, setAuto] = useState(true);

  const update = (s: Partial<Spec>, manual = true) => {
    setSpec((p) => ({ ...p, ...s }));
    setHop((h) => h + 1);
    if (manual) setAuto(false);
  };

  // Cycle through templates until the visitor takes over.
  useEffect(() => {
    if (!auto || reduced) return;
    const iv = setInterval(() => {
      setSpec((p) => TEMPLATES[(TEMPLATES.findIndex((t) => t.name === p.name) + 1) % TEMPLATES.length]);
      setHop((h) => h + 1);
    }, 2600);
    return () => clearInterval(iv);
  }, [auto, reduced]);

  return (
    <section id="builder" className="relative overflow-hidden px-5 py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHead title="Seven shapes, ten colours, four moods." lede="Every agent gets its own. Start from one of the six templates or make one up; it shows everywhere the agent does." />

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-[1.05fr_1fr]">
          {/* Stage */}
          <Reveal className="card relative flex min-h-[460px] flex-col items-center justify-center overflow-hidden p-8">
            <motion.div animate={reduced ? undefined : { y: [0, -10, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} className="relative">
              <Mascot shape={spec.shape} color={spec.color} eyes={spec.eyes} size={210} track hop={hop} />
            </motion.div>
            <motion.div className="relative mt-3 h-3 w-36 rounded-[50%] bg-black/50 blur-sm" animate={reduced ? undefined : { scaleX: [1, 0.8, 1] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} />
            <div className="relative mt-8 h-[76px] text-center">
              <AnimatePresence mode="wait">
                <motion.div key={spec.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  <div className="text-[24px] font-semibold tracking-tight">{spec.name}</div>
                  <div className="mx-auto mt-1 max-w-sm text-[14.5px] text-muted">{spec.tagline}</div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="relative mt-4 flex items-center gap-2 rounded-full border border-line-2 bg-bg-2/80 px-3 py-1 text-[12px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> {spec.provider}
            </div>
          </Reveal>

          {/* Controls */}
          <Reveal delay={0.1} className="card flex flex-col gap-7 p-7">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-ink-2">Templates</span>
                <motion.button
                  type="button"
                  whileTap={{ rotate: 180, scale: 0.9 }}
                  onClick={() => update({ name: 'Your agent', tagline: 'Whatever you need it to be.', shape: pick(SHAPE_LIST), color: pick(COLOR_LIST), eyes: pick(EYES_LIST) })}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line-2 px-3 py-1 text-[12.5px] text-ink-2 transition hover:bg-white/5"
                >
                  <Shuffle className="h-3.5 w-3.5" /> Surprise me
                </motion.button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TEMPLATES.map((t) => (
                  <motion.button
                    key={t.name}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => update(t)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left text-[13px] transition-colors ${spec.name === t.name ? 'border-white/30 bg-white/[0.05] text-ink' : 'border-line text-ink-2 hover:border-line-2'}`}
                  >
                    <Mascot shape={t.shape} color={t.color} eyes={t.eyes} size={24} alive={false} />
                    <span className="truncate">{t.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-[13px] font-semibold text-ink-2">Shape</div>
              <div className="flex flex-wrap gap-2">
                {SHAPE_LIST.map((s) => (
                  <Chip key={s} label={`shape:${SHAPE_LABEL[s]}`} active={spec.shape === s} onClick={() => update({ shape: s })}>
                    <Mascot shape={s} color={spec.color} eyes={spec.eyes} size={32} alive={false} />
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-[13px] font-semibold text-ink-2">Colour</div>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_LIST.map((c) => (
                  <motion.button
                    key={c}
                    type="button"
                    aria-label={`Colour ${c}`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => update({ color: c })}
                    className="relative h-9 w-9 cursor-pointer rounded-full"
                    style={{ background: c }}
                  >
                    {spec.color === c && <motion.span layoutId="color-ring" className="absolute -inset-1.5 rounded-full border-2 border-ink" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-[13px] font-semibold text-ink-2">Mood</div>
              <div className="flex flex-wrap gap-2">
                {EYES_LIST.map((e) => (
                  <motion.button
                    key={e}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => update({ eyes: e })}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border py-1.5 pl-1.5 pr-3 text-[13px] transition-colors ${spec.eyes === e ? 'border-white/30 bg-white/[0.05] text-ink' : 'border-line text-ink-2 hover:border-line-2'}`}
                  >
                    <Mascot shape="blob" color={spec.color} eyes={e} size={26} alive={false} />
                    {EYES_LABEL[e]}
                  </motion.button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
