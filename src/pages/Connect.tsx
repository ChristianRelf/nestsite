import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUpRight, Check, ChevronRight, Laptop, Moon, Server, Smartphone, Sun, X } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { MiniJit } from '../components/MiniJit';
import { Fluted } from '../components/Fluted';
import { SubNav } from '../components/SubNav';
import { GitHubIcon } from '../components/icons';
import { Heading, Reveal, Words, ease } from '../components/ui';
import { Footer } from '../sections/Footer';
import abstract from '../assets/hero-abstract.avif';
import { useLenis } from '../lib/useLenis';
import { REPO } from '../lib/links';
import type { Eyes, Shape } from '../lib/shapes';

const HOME = '../';

type AgentId = 'chief' | 'researcher' | 'writer' | 'engineer' | 'briefer';
type Agent = { id: AgentId; name: string; shape: Shape; color: string; eyes: Eyes };

const AGENTS: Record<AgentId, Agent> = {
  chief: { id: 'chief', name: 'Chief of Staff', shape: 'leaf', color: '#4cbe6c', eyes: 'dots' },
  researcher: { id: 'researcher', name: 'Researcher', shape: 'hex', color: '#3b82f6', eyes: 'wide' },
  writer: { id: 'writer', name: 'Writer', shape: 'pill', color: '#ec4899', eyes: 'dots' },
  engineer: { id: 'engineer', name: 'Engineer', shape: 'diamond', color: '#8b5cf6', eyes: 'dots' },
  briefer: { id: 'briefer', name: 'Daily Briefer', shape: 'blob', color: '#f2a533', eyes: 'sleepy' },
};
const CREW: AgentId[] = ['chief', 'researcher', 'writer', 'engineer'];

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="relative flex min-h-[86svh] items-center overflow-hidden pt-28 pb-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div
          className="absolute inset-x-0 top-[-20%] h-[130%]"
          style={{ filter: 'hue-rotate(38deg) saturate(1.15)' }}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease }}
        >
          <Fluted src={abstract} />
        </motion.div>
        <div className="noise absolute inset-0" />
        <div className="fade-to-bottom absolute inset-x-0 -bottom-px h-[45%]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/25 py-1.5 pr-4 pl-1.5 text-[13px] text-white/85 backdrop-blur-md"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 text-[12px] font-semibold text-black">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f2a533] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#f2a533]" />
            </span>
            In the works
          </span>
          A new way to reach your nest
        </motion.div>

        <h1 className="mt-7 text-[clamp(56px,11vw,156px)] font-semibold leading-[0.9] tracking-[-0.055em] text-white [text-shadow:0_4px_60px_rgba(40,0,90,0.45)]">
          <motion.span className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.45, ease }}>
            Nest Connect.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.7, ease }}
          className="mx-auto mt-7 max-w-xl text-[clamp(17px,1.6vw,20px)] leading-relaxed text-white/80"
        >
          Your jits, wherever you are. Control them from your phone, or run Nest on a home server and drive it from your desktop.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          {[
            { href: '#phone', icon: <Smartphone className="h-4 w-4" />, label: 'From your phone' },
            { href: '#homeserver', icon: <Server className="h-4 w-4" />, label: 'On a home server' },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group inline-flex h-12 items-center gap-2.5 rounded-full border border-white/20 bg-black/25 px-5 text-[15px] font-medium text-white backdrop-blur-md transition hover:bg-black/40"
            >
              {l.icon} {l.label}
              <ArrowDown className="h-4 w-4 opacity-60 transition-transform group-hover:translate-y-0.5" />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- The wire between two devices ---------------- */

type Packet = { id: number; dir: 1 | -1; shape: Shape; color: string };
let packetId = 0;

/** A dashed link with little jits running along it. Horizontal on wide screens, vertical when stacked. */
function Wire({ packets, vertical }: { packets: Packet[]; vertical?: boolean }) {
  return (
    <div className={`relative shrink-0 ${vertical ? 'mx-auto h-20 w-8 lg:hidden' : 'hidden h-8 w-24 self-center lg:block xl:w-32'}`} aria-hidden="true">
      <div className={`absolute ${vertical ? 'inset-y-0 left-1/2 border-l' : 'inset-x-0 top-1/2 border-t'} border-dashed border-white/20`} />
      <span className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ok">
        <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
      </span>
      <AnimatePresence>
        {packets.map((p) => {
          const from = p.dir > 0 ? '0%' : '100%';
          const to = p.dir > 0 ? '100%' : '0%';
          return (
            <motion.div
              key={p.id}
              className={`absolute ${vertical ? 'left-1/2 -ml-[9px] -mt-[9px]' : 'top-1/2 -mt-[9px] -ml-[9px]'}`}
              initial={vertical ? { top: from, scale: 0.4, opacity: 0 } : { left: from, scale: 0.4, opacity: 0 }}
              animate={vertical ? { top: to, scale: 1, opacity: 1 } : { left: to, scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
            >
              <MiniJit shape={p.shape} color={p.color} size={18} happy />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function usePackets() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  /** Sends a jit down the wire, then runs `arrive` when it lands. */
  const send = (dir: 1 | -1, a: Agent, arrive: () => void) => {
    const p: Packet = { id: packetId++, dir, shape: a.shape, color: a.color };
    setPackets((ps) => [...ps, p]);
    later(() => { setPackets((ps) => ps.filter((x) => x !== p)); arrive(); }, 650);
  };
  return { packets, send, later };
}

/* ---------------- Phone remote demo ---------------- */

type Approval = 'pending' | 'allowed' | 'denied';
const START: Record<AgentId, string> = {
  chief: 'Planning your week',
  researcher: 'Reading 4 sources',
  writer: 'Idle',
  engineer: 'Waiting for you',
  briefer: 'Asleep',
};

function StatusDot({ status }: { status: string }) {
  const tone = /waiting/i.test(status) ? 'bg-warn' : /idle|stopped|asleep/i.test(status) ? 'bg-faint' : 'bg-ok';
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} />;
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-[290px] shrink-0 rounded-[46px] border border-white/15 bg-[#0a0a0c] p-2.5 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.95),inset_0_0_0_1px_rgba(255,255,255,0.04)] lg:mx-0">
      <div className="relative h-[600px] overflow-hidden rounded-[37px] bg-[#111114]">
        <div className="absolute top-2.5 left-1/2 z-10 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  );
}

function PhoneDemo() {
  const reduced = useReducedMotion();
  const { packets, send, later } = usePackets();
  const [status, setStatus] = useState(START);
  const [hop, setHop] = useState<Record<string, number>>({});
  const [happy, setHappy] = useState<Record<string, boolean>>({});
  const [ping, setPing] = useState<Record<string, number>>({});
  const [approval, setApproval] = useState<Approval>('pending');
  const [log, setLog] = useState<string>('Linked to your phone');

  const cheer = (id: AgentId, ms = 1300) => {
    setHop((h) => ({ ...h, [id]: (h[id] ?? 0) + 1 }));
    setHappy((h) => ({ ...h, [id]: true }));
    later(() => setHappy((h) => ({ ...h, [id]: false })), ms);
  };

  const poke = (id: AgentId) =>
    send(1, AGENTS[id], () => {
      cheer(id);
      setPing((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
      setLog(`From your phone: said hi to ${AGENTS[id].name}`);
    });

  const wave = () => {
    CREW.forEach((id, i) => later(() => send(1, AGENTS[id], () => cheer(id, 1600)), reduced ? 0 : i * 110));
    setLog('From your phone: waved at everyone');
  };

  const decide = (allow: boolean) => {
    setApproval(allow ? 'allowed' : 'denied');
    send(1, AGENTS.engineer, () => {
      setLog(`From your phone: ${allow ? 'allowed' : 'denied'} npm test`);
      if (!allow) { setStatus((s) => ({ ...s, engineer: 'Stopped' })); return; }
      setStatus((s) => ({ ...s, engineer: 'Running npm test…' }));
      cheer('engineer');
      later(() => {
        setStatus((s) => ({ ...s, engineer: 'Tests passed' }));
        cheer('engineer');
        // And the result travels back to the phone.
        send(-1, AGENTS.engineer, () => setLog('Engineer: 128 tests passed'));
      }, 2200);
    });
  };

  const reset = () => {
    setApproval('pending');
    setStatus(START);
    setLog('Linked to your phone');
  };

  return (
    <section id="phone" className="relative scroll-mt-20 px-5 py-28">
      <div className="mx-auto max-w-6xl">
        <Heading title="Your nest, in your pocket." lede="Nest keeps running on your computer. Your phone becomes the remote: check who's busy, say hi, and answer the permission cards that would otherwise wait at your desk. Try it, the phone works." />

        <Reveal delay={0.15} className="mt-16">
          <div className="flex flex-col items-stretch lg:flex-row lg:items-center lg:justify-center">
            {/* ---- Phone ---- */}
            <PhoneFrame>
              <div className="flex h-full flex-col px-4 pt-12 pb-5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Mascot shape="blob" color="#3b82f6" size={22} />
                    <span className="text-[16px] font-semibold tracking-tight">Nest</span>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-ink-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Desk PC
                  </span>
                </div>

                <div className="mt-5 px-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Agents</div>
                <div className="mt-2 space-y-0.5">
                  {CREW.map((id) => {
                    const a = AGENTS[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => poke(id)}
                        className="flex w-full items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-white/[0.05] active:scale-[0.98]"
                      >
                        <Mascot shape={a.shape} color={a.color} eyes={happy[id] ? 'happy' : a.eyes} size={30} hop={hop[id] ?? 0} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] font-medium">{a.name}</span>
                          <span className="flex items-center gap-1.5 truncate text-[11.5px] text-muted">
                            <StatusDot status={status[id]} /> {status[id]}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-faint" />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex min-h-0 flex-1 flex-col justify-center">
                  <AnimatePresence mode="wait" initial={false}>
                    {approval === 'pending' ? (
                      <motion.div
                        key="card"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12, scale: 0.96 }}
                        className="rounded-2xl border border-warn/25 bg-warn/[0.06] p-3"
                      >
                        <div className="flex items-center gap-2 text-[11.5px] text-warn">
                          <span className="h-1.5 w-1.5 rounded-full bg-warn" /> Needs your OK
                        </div>
                        <div className="mt-1.5 text-[13px] leading-snug text-ink-2">
                          <span className="font-medium text-ink">Engineer</span> wants to run
                        </div>
                        <code className="mt-1.5 block rounded-lg bg-black/40 px-2.5 py-1.5 font-mono text-[12px] text-ink">npm test</code>
                        <div className="mt-2.5 grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => decide(false)} className="h-9 rounded-xl bg-white/[0.06] text-[13px] font-medium text-ink-2 transition hover:bg-white/10">
                            Deny
                          </button>
                          <button type="button" onClick={() => decide(true)} className="h-9 rounded-xl bg-ink text-[13px] font-semibold text-bg transition hover:bg-white">
                            Allow
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
                        <Mascot shape="diamond" color="#8b5cf6" eyes={approval === 'allowed' ? 'happy' : 'sleepy'} size={40} hop={1} />
                        <div className="mt-2 text-[13px] font-medium">All caught up</div>
                        <button type="button" onClick={reset} className="mt-1 text-[12px] text-faint underline decoration-white/20 underline-offset-4 hover:text-muted">
                          do it again
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={wave}
                  className="mt-3 flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white/[0.07] text-[13.5px] font-medium ring-1 ring-white/10 transition hover:bg-white/[0.12] active:scale-[0.98]"
                >
                  <span className="flex gap-1">
                    {CREW.slice(0, 3).map((id) => <MiniJit key={id} shape={AGENTS[id].shape} color={AGENTS[id].color} size={13} />)}
                  </span>
                  Wave at everyone
                </button>
              </div>
            </PhoneFrame>

            <Wire packets={packets} />
            <Wire packets={packets} vertical />

            {/* ---- Desktop ---- */}
            <div className="mx-auto w-full max-w-[560px] min-w-0 overflow-hidden rounded-[20px] border border-line-2 bg-[#0d0d10] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] lg:mx-0">
              <div className="flex h-10 items-center gap-2 border-b border-line px-4">
                <span className="h-3 w-3 rounded-full bg-white/10" />
                <span className="h-3 w-3 rounded-full bg-white/10" />
                <span className="h-3 w-3 rounded-full bg-white/10" />
                <span className="ml-3 text-[12px] text-faint">Nest · Desk PC</span>
                <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted">
                  <Smartphone className="h-3 w-3" /> 1 device linked
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {CREW.map((id) => {
                  const a = AGENTS[id];
                  return (
                    <div key={id} className="relative overflow-hidden rounded-2xl border border-line bg-panel p-4">
                      <AnimatePresence>
                        {ping[id] && (
                          <motion.span
                            key={ping[id]}
                            className="pointer-events-none absolute top-4 left-4 h-14 w-14 rounded-full"
                            style={{ boxShadow: `0 0 0 2px ${a.color}` }}
                            initial={{ scale: 0.6, opacity: 0.9 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                          />
                        )}
                      </AnimatePresence>
                      <Mascot shape={a.shape} color={a.color} eyes={happy[id] ? 'happy' : a.eyes} size={56} track hop={hop[id] ?? 0} />
                      <div className="mt-3 text-[14px] font-semibold tracking-tight">{a.name}</div>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={status[id]}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-1 flex items-center gap-1.5 truncate text-[12px] text-muted"
                        >
                          <StatusDot status={status[id]} /> {status[id]}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 border-t border-line px-4 py-3 font-mono text-[11.5px] text-faint">
                <span className="text-accent-2">●</span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={log} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="truncate">
                    {log}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Home server demo ---------------- */

const ROUTINES: { at: number; agent: AgentId; text: string }[] = [
  { at: 23 * 60, agent: 'researcher', text: 'Nightly reading list' },
  { at: 2 * 60, agent: 'engineer', text: 'Dependency check' },
  { at: 4 * 60 + 30, agent: 'writer', text: 'Drafted Friday update' },
  { at: 7 * 60, agent: 'briefer', text: 'Morning brief ready' },
];
const BAYS: AgentId[] = ['researcher', 'engineer', 'writer', 'briefer'];
const START_AT = 21 * 60 + 30;
const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const isNight = (m: number) => { const h = Math.floor(m / 60) % 24; return h >= 20 || h < 7; };

function HomeServerDemo() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: '-15% 0px' });
  const { packets, send } = usePackets();
  const [clock, setClock] = useState(START_AT);
  const [lidOpen, setLidOpen] = useState(true);
  const [log, setLog] = useState<{ t: number; agent: AgentId; text: string; away: boolean }[]>([]);
  const [hop, setHop] = useState<Record<string, number>>({});
  const [away, setAway] = useState<number | null>(null);
  const lid = useRef(lidOpen);
  lid.current = lidOpen;

  // Half an hour every 1.4s, looping 21:30 → 08:30.
  const clockRef = useRef(START_AT);
  useEffect(() => {
    if (!inView) return;
    const iv = setInterval(() => {
      const c = clockRef.current;
      const next = c + 30 >= 24 * 60 + 8 * 60 + 30 ? START_AT : c + 30;
      clockRef.current = next;
      setClock(next);
      if (next === START_AT) setLog([]);
      const hit = ROUTINES.find((r) => r.at === next % (24 * 60));
      if (!hit) return;
      setHop((h) => ({ ...h, [hit.agent]: (h[hit.agent] ?? 0) + 1 }));
      setLog((l) => [{ t: next, agent: hit.agent, text: hit.text, away: !lid.current }, ...l].slice(0, 4));
      if (lid.current) send(1, AGENTS[hit.agent], () => {});
    }, 1400);
    return () => clearInterval(iv);
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLid = () => {
    if (lidOpen) { setAway(null); setLidOpen(false); return; }
    setAway(log.filter((l) => l.away).length);
    setLog((l) => l.map((x) => ({ ...x, away: false })));
    setLidOpen(true);
  };

  const night = isNight(clock);

  return (
    <section id="homeserver" className="relative scroll-mt-20 px-5 py-28">
      <div className="mx-auto max-w-6xl">
        <Heading title="Or give them a home server." lede="Run Nest on the always-on box in the cupboard and drive it from your desktop. Routines fire on time even with your laptop shut, and everything's waiting when you open it again." />

        <div ref={box} className="mt-16">
          <Reveal delay={0.1}>
            <div className="flex flex-col items-stretch lg:flex-row lg:items-center lg:justify-center">
              {/* ---- Server ---- */}
              <div className="mx-auto w-full max-w-[340px] shrink-0 rounded-[26px] border border-line-2 bg-[linear-gradient(180deg,#1b1b20,#121215)] p-4 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] lg:mx-0">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 font-mono text-[12px] text-ink-2">
                    <Server className="h-3.5 w-3.5 text-muted" /> nest-home
                  </div>
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-ok">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" /> always on
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {BAYS.map((id, i) => {
                    const a = AGENTS[id];
                    const last = log.find((l) => l.agent === id);
                    return (
                      <div key={id} className="flex items-center gap-3 rounded-xl border border-line bg-black/30 px-3 py-2.5">
                        <span className="flex flex-col gap-1">
                          <span className="h-1 w-1 rounded-full bg-ok" style={{ animation: `pulse ${1.2 + i * 0.37}s ease-in-out infinite` }} />
                          <span className="h-1 w-1 rounded-full bg-accent-2/70" style={{ animation: `pulse ${0.9 + i * 0.29}s ease-in-out infinite` }} />
                        </span>
                        <Mascot shape={a.shape} color={a.color} eyes={last && last.t === log[0]?.t ? 'happy' : night && !last ? 'sleepy' : a.eyes} size={30} hop={hop[id] ?? 0} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium">{a.name}</span>
                          <span className="block truncate text-[11.5px] text-muted">{last ? `${hhmm(last.t)} · ${last.text}` : 'Waiting for its routine'}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-black/30 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-[12px] text-muted">
                    {night ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-[#f2a533]" />}
                    {night ? 'Everyone else is asleep' : 'Good morning'}
                  </span>
                  <span className="font-mono text-[18px] font-medium tabular-nums tracking-tight">{hhmm(clock)}</span>
                </div>
              </div>

            <Wire packets={lidOpen ? packets : []} />
            <Wire packets={lidOpen ? packets : []} vertical />

              {/* ---- Laptop ---- */}
              <div className="mx-auto w-full max-w-[520px] min-w-0 lg:mx-0">
                <div className="relative">
                  <motion.div
                    animate={{ scaleY: lidOpen ? 1 : 0.035 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    style={{ transformOrigin: '50% 100%' }}
                    className="overflow-hidden rounded-t-[18px] border border-b-0 border-line-2 bg-[#0d0d10] p-2.5"
                  >
                    <div className="h-[260px] overflow-hidden rounded-[10px] border border-line bg-bg-2 p-4">
                      <div className="flex items-center gap-2 text-[12px] text-faint">
                        <Mascot shape="blob" color="#3b82f6" size={16} /> Nest
                        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-ink-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-ok" /> nest-home
                        </span>
                      </div>
                      <AnimatePresence>
                        {away !== null && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-[12.5px] text-ink-2"
                          >
                            <Check className="h-3.5 w-3.5 text-accent-2" strokeWidth={3} />
                            While you were away: {away} routine{away === 1 ? '' : 's'} ran
                            <button type="button" onClick={() => setAway(null)} className="ml-auto text-faint hover:text-ink" aria-label="Dismiss">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">Activity</div>
                      <div className="mt-2 space-y-1.5">
                        <AnimatePresence initial={false}>
                          {log.length === 0 && (
                            <motion.div key="empty" exit={{ opacity: 0 }} className="py-6 text-center text-[12.5px] text-faint">
                              Quiet so far. Routines will show up here.
                            </motion.div>
                          )}
                          {log.map((l) => {
                            const a = AGENTS[l.agent];
                            return (
                              <motion.div
                                key={`${l.t}-${l.agent}`}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5"
                              >
                                <MiniJit shape={a.shape} color={a.color} size={16} />
                                <span className="truncate text-[12.5px] text-ink-2">
                                  <span className="font-medium text-ink">{a.name}</span> · {l.text}
                                </span>
                                <span className="ml-auto font-mono text-[11px] text-faint">{hhmm(l.t)}</span>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                  <div className="relative h-4 rounded-b-[14px] border border-line-2 bg-[linear-gradient(180deg,#232328,#18181c)]">
                    <div className="absolute top-0 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-b-md bg-black/40" />
                  </div>
                  <AnimatePresence>
                    {!lidOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-10 flex flex-col items-center text-center"
                      >
                        <Mascot shape="blob" color="#3b82f6" eyes="sleepy" size={44} />
                        <div className="mt-2 text-[14px] text-muted">Laptop's asleep. The server isn't.</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={toggleLid}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.06] px-5 text-[14px] font-medium ring-1 ring-white/10 transition hover:bg-white/10"
                  >
                    <Laptop className="h-4 w-4" /> {lidOpen ? 'Close the laptop' : 'Open it back up'}
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Plans ---------------- */

const PLANS: { title: string; text: string; shape: Shape; color: string; eyes: Eyes }[] = [
  { title: 'Approve from anywhere', text: 'Permission cards reach your phone, so an agent never sits waiting because you stepped away.', shape: 'diamond', color: '#8b5cf6', eyes: 'wide' },
  { title: 'Talk to any agent', text: 'Pick up a conversation on your phone. It’s the same thread when you sit back down.', shape: 'pill', color: '#ec4899', eyes: 'happy' },
  { title: 'Routines that never miss', text: 'On a home server, routines run on time whether or not your laptop is open.', shape: 'blob', color: '#f2a533', eyes: 'sleepy' },
  { title: 'See who’s busy', text: 'A live view of every agent: working, waiting on you, or asleep.', shape: 'hex', color: '#3b82f6', eyes: 'dots' },
  { title: 'One nest, many screens', text: 'Phone, laptop and desktop all looking at the same agents, memory and inbox.', shape: 'leaf', color: '#4cbe6c', eyes: 'dots' },
  { title: 'Same rules as ever', text: 'Your devices, your subscriptions, and approvals that still need a yes from you.', shape: 'square', color: '#3fb5a3', eyes: 'dots' },
];

function Plans() {
  return (
    <section className="relative px-5 py-28">
      <div className="mx-auto max-w-6xl">
        <Heading title="What it'll do." lede="Early plans. Some of this will change while it's being built, and that's half the fun." />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <PlanCard key={p.title} plan={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan, i }: { plan: (typeof PLANS)[number]; i: number }) {
  const [hop, setHop] = useState(0);
  const [on, setOn] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px 0px' }}
      transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease }}
      onHoverStart={() => { setHop((h) => h + 1); setOn(true); }}
      onHoverEnd={() => setOn(false)}
      className="card relative overflow-hidden p-6 transition-colors hover:border-line-2"
    >
      <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-20 blur-3xl" style={{ background: plan.color }} aria-hidden="true" />
      <div className="relative flex items-start justify-between">
        <Mascot shape={plan.shape} color={plan.color} eyes={on ? 'happy' : plan.eyes} size={48} track hop={hop} />
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 font-mono text-[10.5px] text-muted">planned</span>
      </div>
      <h3 className="relative mt-6 text-[20px] font-semibold tracking-tight">{plan.title}</h3>
      <p className="relative mt-2 text-[15px] leading-relaxed text-muted">{plan.text}</p>
    </motion.div>
  );
}

/* ---------------- Closing ---------------- */

const LINEUP: { shape: Shape; color: string; eyes: Eyes }[] = [
  { shape: 'leaf', color: '#4cbe6c', eyes: 'dots' },
  { shape: 'diamond', color: '#8b5cf6', eyes: 'dots' },
  { shape: 'hex', color: '#3b82f6', eyes: 'wide' },
  { shape: 'pill', color: '#ec4899', eyes: 'happy' },
  { shape: 'triangle', color: '#f06f2c', eyes: 'wide' },
  { shape: 'blob', color: '#f2a533', eyes: 'sleepy' },
  { shape: 'square', color: '#3fb5a3', eyes: 'dots' },
];

function Closing() {
  return (
    <section className="relative px-5 pt-16 pb-28 text-center">
      <div className="flex items-end justify-center gap-[clamp(6px,2vw,18px)]">
        {LINEUP.map((j, i) => (
          <motion.div
            key={i}
            initial={{ y: 60, opacity: 0, scale: 0.6 }}
            whileInView={{ y: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px 0px' }}
            transition={{ type: 'spring', stiffness: 260, damping: 15, delay: i * 0.06 }}
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.4, delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }}>
              <Mascot shape={j.shape} color={j.color} eyes={j.eyes} size={52} track />
            </motion.div>
          </motion.div>
        ))}
      </div>
      <h2 className="mx-auto mt-12 max-w-3xl text-[clamp(36px,5.4vw,72px)] font-semibold leading-[0.98] tracking-[-0.045em]">
        <Words text="Coming to a nest near you." />
      </h2>
      <Reveal delay={0.15}>
        <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-muted">
          Connect isn't out yet. Watch the repo to see it land, or tell us how you'd use it while there's still time to shape it.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <motion.a
            href={REPO}
            target="_blank"
            rel="noopener"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-bg transition-colors hover:bg-white"
          >
            <GitHubIcon className="h-4 w-4" /> Watch on GitHub
          </motion.a>
          <motion.a
            href={`${REPO}/issues/new?title=${encodeURIComponent('Nest Connect: ')}`}
            target="_blank"
            rel="noopener"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-line-2 px-6 text-[15px] font-semibold transition-colors hover:bg-white/5"
          >
            Tell us how you'd use it <ArrowUpRight className="h-4 w-4" />
          </motion.a>
        </div>
        <a href={`${HOME}download/`} className="mt-6 inline-block text-[14px] text-muted underline decoration-white/20 underline-offset-4 transition hover:text-ink hover:decoration-white/60">
          In the meantime, Nest itself is out today
        </a>
      </Reveal>
    </section>
  );
}

/* ---------------- Page ---------------- */

export default function Connect() {
  useLenis();
  return (
    <div>
      <div className="grain" aria-hidden="true" />
      <SubNav label="connect" />
      <main>
        <Hero />
        <PhoneDemo />
        <HomeServerDemo />
        <Plans />
        <Closing />
      </main>
      <Footer home={HOME} />
    </div>
  );
}
