import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react';
import { ArrowUp, Check, FolderOpen, Inbox, LoaderCircle, Mic, Paperclip, ShieldCheck } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { SectionHead } from '../components/ui';

const ASK = 'Ship the v0.2 changelog and draft a launch post for it.';
const REPLY = "On it. I'll split this across the team.";
const FINAL = 'All done. CHANGELOG.md is updated and the launch post is waiting in your Inbox for a once-over.';

// [step reached, ms to wait before the next step]
const TIMELINE = [600, 2300, 500, 900, 1300, 900, 1000, 1700, 1300, 1100, 1100, 2400, 3800];

type Activity = { id: string; icon: 'run' | 'mem' | 'del' | 'ok' | 'tool'; text: string };

function activityFor(step: number): Activity[] {
  const all: [number, Activity][] = [
    [2, { id: 'a1', icon: 'run', text: 'Run started · Claude Code' }],
    [3, { id: 'a2', icon: 'mem', text: 'Included 2 memory notes' }],
    [5, { id: 'a3', icon: 'del', text: 'delegate → Engineer (Codex)' }],
    [6, { id: 'a4', icon: 'del', text: 'delegate → Writer (Claude Code)' }],
    [8, { id: 'a5', icon: 'tool', text: 'npm test · allowed for session' }],
    [9, { id: 'a6', icon: 'ok', text: 'Engineer finished · 42 tests passed' }],
    [10, { id: 'a7', icon: 'ok', text: 'Writer finished · draft in Inbox' }],
  ];
  return all.filter(([s]) => step >= s).map(([, a]) => a).reverse();
}

function Stream({ text, speed = 22 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setN((v) => (v >= text.length ? v : v + 2)), speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-ink-2" />}
    </>
  );
}

function Dots() {
  return (
    <div className="flex gap-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-muted" animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </div>
  );
}

function Status({ done }: { done: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {done ? (
        <motion.span key="d" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className="flex items-center gap-1 rounded-full bg-ok/15 px-2.5 py-1 text-[11.5px] font-semibold text-ok">
          <Check className="h-3 w-3" strokeWidth={3} /> Done
        </motion.span>
      ) : (
        <motion.span key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
          className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11.5px] font-semibold text-accent-2">
          <LoaderCircle className="h-3 w-3 animate-spin" /> Working
        </motion.span>
      )}
    </AnimatePresence>
  );
}

const spring = { type: 'spring', stiffness: 380, damping: 30 } as const;

export function LiveDemo() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: '-25% 0px -25% 0px' });
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(0);

  const { scrollYProgress } = useScroll({ target: box, offset: ['start end', 'center center'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  // Drive the script while visible; restart from the top each loop.
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % TIMELINE.length), TIMELINE[step]);
    return () => clearTimeout(t);
  }, [step, inView]);

  useEffect(() => {
    if (step !== 1) { setTyped(step === 0 ? 0 : ASK.length); return; }
    setTyped(0);
    const iv = setInterval(() => setTyped((n) => Math.min(ASK.length, n + 1)), 34);
    return () => clearInterval(iv);
  }, [step]);

  const working = (who: 'eng' | 'wri') => (who === 'eng' ? step >= 5 && step < 9 : step >= 6 && step < 10);
  const inbox = step >= 10 ? 2 : step >= 9 ? 1 : 0;
  const activity = activityFor(step);

  const agents = [
    { name: 'Chief of Staff', shape: 'leaf', color: '#4cbe6c', eyes: step >= 11 ? 'happy' : 'dots', busy: step >= 2 && step < 12 },
    { name: 'Engineer', shape: 'diamond', color: '#8b5cf6', eyes: step >= 9 && step < 12 ? 'happy' : 'dots', busy: working('eng') },
    { name: 'Writer', shape: 'pill', color: '#ec4899', eyes: 'happy', busy: working('wri') },
    { name: 'Researcher', shape: 'hex', color: '#3b82f6', eyes: 'wide', busy: false },
    { name: 'Daily Briefer', shape: 'blob', color: '#f2a533', eyes: 'sleepy', busy: false },
  ] as const;

  return (
    <section className="relative px-5 pt-36 pb-24">
      <SectionHead center title="You ask one agent. It brings in the others." lede="A Chief of Staff splits the request, hands each part to the agent that fits, stops to ask before running anything, and reports back." />

      <div ref={box} className="mx-auto mt-16 max-w-[1180px] [perspective:1600px]">
        <motion.div
          style={{ rotateX, scale, opacity, transformOrigin: '50% 0%' }}
          className="relative overflow-hidden rounded-[22px] border border-line-2 bg-panel shadow-[0_60px_160px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.03)_inset]"
        >
          {/* Title bar */}
          <div className="relative flex h-10 items-center gap-2 border-b border-line bg-bg-2 px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]/80" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]/80" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]/80" />
            <span className="absolute left-1/2 -translate-x-1/2 text-[12px] text-faint">Nest</span>
          </div>

          <div className="relative grid h-[560px] grid-cols-1 md:grid-cols-[210px_1fr] lg:grid-cols-[210px_1fr_250px]">
            {/* Sidebar */}
            <aside className="hidden flex-col gap-0.5 border-r border-line bg-bg-2/60 p-3 text-[13.5px] md:flex">
              <div className="flex items-center justify-between rounded-lg px-2.5 py-2 text-ink-2">
                <span className="flex items-center gap-2.5"><Inbox className="h-4 w-4 text-muted" /> Inbox</span>
                <AnimatePresence>
                  {inbox > 0 && (
                    <motion.span key={inbox} initial={{ scale: 0 }} animate={{ scale: [1.5, 1] }} exit={{ scale: 0 }} className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">
                      {inbox}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="px-2.5 pt-4 pb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">Agents</div>
              {agents.map((a, i) => (
                <div key={a.name} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] ${i === 0 ? 'bg-white/[0.06] text-ink' : 'text-ink-2'}`}>
                  <Mascot shape={a.shape} color={a.color} eyes={a.eyes} size={22} />
                  {a.name}
                  <AnimatePresence>
                    {a.busy && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative ml-auto h-2 w-2">
                        <span className="absolute inset-0 animate-ping rounded-full bg-accent-2/70" />
                        <span className="absolute inset-0 rounded-full bg-accent-2" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <div className="px-2.5 pt-4 pb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">Routines</div>
              <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-muted">
                <span className="grid h-[22px] w-[22px] place-items-center"><span className="h-2 w-2 rounded-full border border-muted" /></span>
                Morning brief · 08:30
              </div>
            </aside>

            {/* Chat */}
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-3 border-b border-line px-5 py-3">
                <Mascot shape="leaf" color="#4cbe6c" eyes={agents[0].eyes} size={28} gaze={step >= 5 && step < 11 ? [0.2, 0.8] : null} />
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold">Chief of Staff</div>
                  <div className="flex items-center gap-1 text-[12px] text-faint"><FolderOpen className="h-3 w-3" /> ~/projects/nest</div>
                </div>
                <div className="ml-auto flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1 text-[12px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Claude Code
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-end gap-4 overflow-hidden px-5 py-5 text-[14px]">
                <AnimatePresence mode="popLayout">
                  {step >= 2 && (
                    <motion.div key="ask" layout initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring}
                      className="max-w-[78%] self-end rounded-[18px] rounded-br-md bg-ink px-4 py-2.5 text-bg">
                      {ASK}
                    </motion.div>
                  )}
                  {step === 3 && (
                    <motion.div key="think" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Dots /></motion.div>
                  )}
                  {step >= 4 && (
                    <motion.div key="reply" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="max-w-[92%] text-ink-2">
                      <Stream text={REPLY} />
                    </motion.div>
                  )}
                  {step >= 5 && (
                    <motion.div key="cards" layout className="flex max-w-[92%] flex-col gap-2">
                      {([
                        ['eng', 'Engineer', 'diamond', '#8b5cf6', 'dots', 'Collect merged changes since v0.1 into CHANGELOG.md', 5, 'Codex'],
                        ['wri', 'Writer', 'pill', '#ec4899', 'happy', 'Launch post in your voice, from the changelog', 6, 'Claude Code'],
                      ] as const).map(([id, name, shape, color, eyes, task, at, prov]) =>
                        step >= at ? (
                          <motion.div key={id} layout initial={{ opacity: 0, x: -24, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={spring}
                            className="flex items-center gap-3 rounded-2xl border border-line bg-bg-2/80 p-3">
                            <Mascot shape={shape} color={color} eyes={eyes} size={30} hop={step === at ? 1 : 0} />
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-semibold text-ink">Delegated to {name} <span className="font-normal text-faint">· {prov}</span></div>
                              <div className="truncate text-[12.5px] text-muted">{task}</div>
                            </div>
                            <Status done={!working(id)} />
                          </motion.div>
                        ) : null,
                      )}
                    </motion.div>
                  )}
                  {step === 7 && (
                    <motion.div key="approve" layout initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={spring}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#4a3d1f] bg-[#2a2416] px-4 py-3 text-[13px] text-warn">
                      <span><b>Engineer wants to run</b> <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[12px] text-ink">npm test</code></span>
                      <div className="flex gap-1.5 text-[12px]">
                        <span className="rounded-lg border border-line-2 bg-panel px-2.5 py-1 text-ink-2">Deny</span>
                        <span className="rounded-lg border border-line-2 bg-panel px-2.5 py-1 text-ink-2">Allow once</span>
                        <motion.span animate={{ scale: [1, 1, 0.92, 1], boxShadow: ['0 0 0 0 rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0)', '0 0 0 6px rgba(255,255,255,0.15)', '0 0 0 0 rgba(255,255,255,0)'] }} transition={{ duration: 1.4, times: [0, 0.6, 0.75, 1] }}
                          className="rounded-lg bg-ink px-2.5 py-1 font-medium text-bg">Allow for session</motion.span>
                      </div>
                    </motion.div>
                  )}
                  {step >= 8 && (
                    <motion.div key="allowed" layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-2 text-[12.5px] text-muted">
                      <ShieldCheck className="h-3.5 w-3.5 text-ok" /> You allowed <code className="font-mono text-ink-2">npm test</code> for this session
                    </motion.div>
                  )}
                  {step >= 11 && (
                    <motion.div key="final" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="max-w-[92%] text-ink-2">
                      <Stream text={FINAL} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Composer */}
              <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl border border-line-2 bg-bg-2/70 py-2.5 pl-4 pr-2.5 text-[14px]">
                <Paperclip className="h-4 w-4 shrink-0 text-faint" />
                <div className="min-w-0 flex-1 truncate">
                  {step === 1 ? (
                    <span className="text-ink">{ASK.slice(0, typed)}<span className="ml-px inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-accent-2" /></span>
                  ) : (
                    <span className="text-faint">Message Chief of Staff…</span>
                  )}
                </div>
                <Mic className="h-4 w-4 shrink-0 text-faint" />
                <motion.span animate={{ scale: step === 1 && typed === ASK.length ? [1, 0.85, 1] : 1 }} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${step === 1 && typed > 0 ? 'bg-ink text-bg' : 'bg-white/10 text-faint'}`}>
                  <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                </motion.span>
              </div>
            </div>

            {/* Activity */}
            <aside className="hidden flex-col border-l border-line bg-bg-2/40 lg:flex">
              <div className="flex items-center justify-between border-b border-line px-4 py-3.5 text-[13px] font-semibold">
                Activity
                <span className="font-mono text-[11px] font-normal text-faint">this run</span>
              </div>
              <div className="flex flex-col gap-2 p-3">
                <AnimatePresence initial={false}>
                  {activity.map((a) => (
                    <motion.div key={a.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={spring}
                      className="flex items-start gap-2.5 rounded-xl border border-line bg-panel px-3 py-2.5 text-[12.5px] text-ink-2">
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${{ run: 'bg-accent-2', mem: 'bg-[#4cbe6c]', del: 'bg-[#8b5cf6]', ok: 'bg-ok', tool: 'bg-warn' }[a.icon]}`} />
                      <span className={a.icon === 'del' ? 'font-mono text-[11.5px]' : ''}>{a.text}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {activity.length === 0 && <div className="px-1 py-2 text-[12.5px] text-faint">Nothing yet. Runs show every tool call, memory note and handoff here.</div>}
              </div>
            </aside>
          </div>
        </motion.div>
        <div className="mx-auto mt-6 flex justify-center gap-1.5" aria-hidden="true">
          {TIMELINE.map((_, i) => (
            <motion.span key={i} className="h-1 rounded-full bg-white/15" animate={{ width: i === step ? 22 : 6, backgroundColor: i <= step ? 'rgba(106,165,255,0.9)' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>
    </section>
  );
}
