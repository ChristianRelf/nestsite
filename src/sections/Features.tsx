import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Calendar, Check, Globe, Mail, MessageSquare, MousePointer2, GitBranch, FileText } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { SectionHead, ease } from '../components/ui';

/** Re-render on a fixed beat while the card is on screen. */
function useTick(ms: number, n: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-10% 0px' });
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const iv = setInterval(() => setT((v) => (v + 1) % n), ms);
    return () => clearInterval(iv);
  }, [inView, ms, n]);
  return [ref, t] as const;
}

function Card({ title, body, children, className = '', delay = 0 }: { title: string; body: string; children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px 0px' }}
      transition={{ duration: 0.8, delay, ease }}
      className={`group relative flex flex-col overflow-hidden border-r border-b border-white/[0.06] transition-colors hover:bg-white/[0.015] ${className}`}
    >
      <div className="relative flex min-h-[210px] flex-1 items-center justify-center p-6">{children}</div>
      <div className="relative p-7 pt-0">
        <h3 className="text-[19px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{body}</p>
      </div>
    </motion.article>
  );
}

/* --- Visuals --- */

function Subscriptions() {
  const [ref, t] = useTick(1400, 4);
  const keys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'ANTHROPIC_BASE_URL'];
  return (
    <div ref={ref} className="grid w-full max-w-lg gap-4 sm:grid-cols-[1fr_auto]">
      <div className="flex flex-col gap-2.5">
        {[
          ['Codex', 'Signed in with ChatGPT', '#3fb5a3', 'square'],
          ['Claude Code', 'Signed in with Claude', '#f06f2c', 'blob'],
        ].map(([n, s, c, sh], i) => (
          <motion.div key={n} className="flex items-center gap-3 rounded-2xl border border-line bg-bg-2/80 px-3.5 py-3" animate={{ borderColor: t % 2 === i ? 'rgba(62,194,122,0.45)' : 'rgba(255,255,255,0.08)' }}>
            <Mascot shape={sh as 'square'} color={c} size={30} eyes={t % 2 === i ? 'happy' : 'dots'} />
            <div className="flex-1">
              <div className="text-[14px] font-semibold">{n}</div>
              <div className="text-[12.5px] text-muted">{s}</div>
            </div>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ok/15 text-ok"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col justify-center gap-2 rounded-2xl border border-dashed border-line-2 p-3">
        <div className="font-mono text-[10.5px] uppercase tracking-widest text-faint">stripped from env</div>
        {keys.map((k, i) => (
          <div key={k} className="relative font-mono text-[12px] text-ink-2">
            <motion.span animate={{ opacity: t > i ? 0.35 : 1 }}>{k}</motion.span>
            <motion.span className="absolute left-0 top-1/2 h-[1.5px] w-full origin-left bg-[#e5484d]" animate={{ scaleX: t > i ? 1 : 0 }} transition={{ duration: 0.4, ease }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Memory() {
  const [ref, t] = useTick(1100, 5);
  const notes = ['Prefers short, direct replies', 'Ships releases on Fridays', 'Uses pnpm, not npm'];
  return (
    <div ref={ref} className="relative h-[170px] w-full max-w-[280px]">
      <AnimatePresence>
        {notes.slice(0, Math.min(t, 3)).map((n, i) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, y: -30, rotate: -6 }}
            animate={{ opacity: 1, y: i * 44, rotate: [-2, 1.5, -1][i] }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="absolute inset-x-0 flex items-center gap-2.5 rounded-xl border border-line-2 bg-panel-2 px-3 py-2.5 text-[13px] text-ink-2 shadow-lg"
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-[#4cbe6c]" />
            {n}
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="absolute -bottom-2 right-0 font-mono text-[11px] text-faint">included in this run: {Math.min(t, 3)}</div>
    </div>
  );
}

/* Split-flap departures board of upcoming routine runs. */
const RUNS: { day: string; time: string; name: string; agent: 'chief' | 'brief' | 'eng'; missed?: boolean }[] = [
  { day: 'Sun', time: '18:00', name: 'Weekly review', agent: 'chief', missed: true },
  { day: 'Mon', time: '08:00', name: 'Inbox sweep', agent: 'chief' },
  { day: 'Mon', time: '08:30', name: 'Morning brief', agent: 'brief' },
  { day: 'Mon', time: '08:30', name: 'Inbox sweep', agent: 'chief' },
  { day: 'Mon', time: '09:00', name: 'Deps check', agent: 'eng' },
  { day: 'Mon', time: '09:00', name: 'Inbox sweep', agent: 'chief' },
  { day: 'Mon', time: '09:30', name: 'Inbox sweep', agent: 'chief' },
];
const RUN_AGENT = {
  chief: { shape: 'leaf', color: '#4cbe6c', eyes: 'dots' },
  brief: { shape: 'blob', color: '#f2a533', eyes: 'sleepy' },
  eng: { shape: 'diamond', color: '#8b5cf6', eyes: 'dots' },
} as const;

function Flip({ text, width }: { text: string; width: number }) {
  const chars = text.padEnd(width, ' ').slice(0, width).split('');
  return (
    <span className="inline-flex">
      {chars.map((c, i) => (
        <span key={i} className="relative inline-block h-[1.35em] w-[1ch] overflow-hidden text-center">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={c}
              className="block"
              initial={{ y: '-105%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '105%', opacity: 0 }}
              transition={{ duration: 0.28, delay: i * 0.025, ease: [0.3, 0.7, 0.2, 1] }}
            >
              {c === ' ' ? ' ' : c}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

function Routines() {
  const [ref, t] = useTick(2600, RUNS.length);
  const rows = [0, 1, 2, 3].map((k) => RUNS[(t + k) % RUNS.length]);
  return (
    <div ref={ref} className="w-full max-w-[310px] font-mono text-[12px]">
      <div className="mb-2 flex items-center justify-between px-1 text-[10.5px] text-faint">
        <span>upcoming</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f2a533]" />live</span>
      </div>
      <div className="divide-y divide-white/[0.05] rounded-xl border border-line bg-[#0d0d10]">
        {rows.map((r, k) => {
          const a = RUN_AGENT[r.agent];
          return (
            <div key={k} className={`relative flex items-center gap-3 overflow-hidden px-3 py-2.5 ${k === 0 ? 'text-ink' : k === 1 ? 'text-ink-2' : 'text-muted'}`}>
              {k === 0 && (
                <motion.span
                  key={t}
                  className={`absolute inset-y-0 left-0 ${r.missed ? 'bg-ok/[0.07]' : 'bg-[#f2a533]/[0.07]'}`}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.6, ease: 'linear' }}
                />
              )}
              <span className="relative tabular-nums text-faint"><Flip text={`${r.day} ${r.time}`} width={9} /></span>
              <span className="relative"><Flip text={r.name} width={13} /></span>
              <span className="relative ml-auto flex items-center gap-2">
                <Mascot shape={a.shape} color={a.color} eyes={a.eyes} size={16} alive={false} />
                <span className={`w-[58px] text-right text-[10.5px] ${k === 0 ? (r.missed ? 'text-ok' : 'text-[#f2a533]') : 'text-faint'}`}>
                  {k === 0 ? (r.missed ? 'caught up' : 'running') : k === 1 ? 'next' : 'queued'}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Approvals() {
  const [ref, t] = useTick(900, 6);
  const clicked = t >= 3;
  return (
    <div ref={ref} className="relative w-full max-w-[290px]">
      <motion.div
        animate={{ borderColor: clicked ? 'rgba(62,194,122,0.5)' : 'rgba(74,61,31,1)', backgroundColor: clicked ? 'rgba(62,194,122,0.08)' : 'rgba(42,36,22,1)' }}
        className="rounded-2xl border px-4 py-3.5 text-[13px]"
      >
        <div className={clicked ? 'text-ok' : 'text-warn'}>
          <b>{clicked ? 'Allowed once' : 'Engineer wants to edit'}</b>
        </div>
        <div className="mt-1 font-mono text-[12px] text-ink-2">src/release.ts</div>
        <div className="mt-3 flex gap-1.5 text-[12px]">
          <span className="rounded-lg border border-line-2 bg-panel px-2.5 py-1 text-ink-2">Deny</span>
          <motion.span animate={{ scale: t === 3 ? 0.9 : 1 }} className={`rounded-lg px-2.5 py-1 font-medium ${clicked ? 'bg-ok text-bg' : 'bg-ink text-bg'}`}>
            {clicked ? <span className="flex items-center gap-1"><Check className="h-3 w-3" strokeWidth={3} />Allowed</span> : 'Allow once'}
          </motion.span>
        </div>
      </motion.div>
      <motion.div className="absolute" animate={{ left: t < 2 ? '85%' : '42%', top: t < 2 ? '110%' : '72%' }} transition={{ duration: 0.8, ease }}>
        <MousePointer2 className="h-5 w-5 fill-white text-black drop-shadow" />
      </motion.div>
    </div>
  );
}

function Switch() {
  const [ref, t] = useTick(1800, 2);
  return (
    <div ref={ref} className="flex w-full max-w-[290px] flex-col items-center gap-5">
      <div className="relative grid w-full grid-cols-2 rounded-full border border-line-2 bg-bg-2 p-1 text-[13px] font-semibold">
        <motion.span className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-ink" animate={{ left: t ? 'calc(50% + 0px)' : '4px' }} transition={{ type: 'spring', stiffness: 300, damping: 26 }} />
        <span className={`relative z-10 py-2 text-center transition-colors ${t ? 'text-muted' : 'text-bg'}`}>Codex</span>
        <span className={`relative z-10 py-2 text-center transition-colors ${t ? 'text-bg' : 'text-muted'}`}>Claude Code</span>
      </div>
      <div className="relative h-12 w-full">
        <motion.div
          key={t}
          initial={{ left: t ? '0%' : '36%', opacity: 0 }}
          animate={{ left: t ? '36%' : '0%', opacity: [0, 1, 1] }}
          transition={{ duration: 0.9, ease }}
          className="absolute top-0 w-[64%] rounded-xl border border-line-2 bg-panel-2 px-3 py-2 font-mono text-[10.5px] leading-tight text-ink-2"
        >
          &lt;transferred-context&gt;<br /><span className="text-faint">only what it hasn't seen</span>
        </motion.div>
      </div>
    </div>
  );
}

function Voice() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-20 items-center gap-[5px]">
        {Array.from({ length: 26 }).map((_, i) => (
          <motion.span
            key={i}
            className="w-[5px] rounded-full bg-ink-2"
            animate={{ height: [8, 14 + ((i * 37) % 52), 10, 20 + ((i * 53) % 40), 8] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.05, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <div className="rounded-full border border-line-2 bg-bg-2 px-3 py-1 font-mono text-[11px] text-faint">whisper · on device · audio never uploaded</div>
    </div>
  );
}

function Connectors() {
  const icons = [Mail, Calendar, MessageSquare, Globe, GitBranch, FileText];
  return (
    <div className="relative grid h-[220px] w-[220px] place-items-center">
      {[1, 0.68].map((r, k) => (
        <div key={k} className="absolute rounded-full border border-dashed border-line-2" style={{ width: `${r * 100}%`, height: `${r * 100}%` }} />
      ))}
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
        {icons.map((Icon, i) => {
          const a = (i / icons.length) * Math.PI * 2;
          return (
            <motion.div
              key={i}
              className="absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl border border-line-2 bg-panel-2 shadow-lg"
              style={{ left: `${50 + Math.cos(a) * 50}%`, top: `${50 + Math.sin(a) * 50}%` }}
              animate={{ rotate: -360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            >
              <Icon className="h-4.5 w-4.5 text-ink-2" />
            </motion.div>
          );
        })}
      </motion.div>
      <Mascot shape="hex" color="#3fb5a3" eyes="wide" size={70} track />
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative px-5 py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHead title="Codex and Claude Code, with memory, routines and a team." lede="Each agent keeps its name, instructions, notes and working folder between sessions. Every run records what it read and what it did." />
        <div className="mt-16 grid border-t border-l border-white/[0.06] md:grid-cols-3">
          <Card className="md:col-span-2" title="Your subscriptions, not API bills." body="Nest runs the unmodified codex app-server and claude CLI. Sign-in stays with each tool, and stray API keys are stripped so nothing bills by accident.">
            <Subscriptions />
          </Card>
          <Card delay={0.08} title="Memory you can read." body="Plain-text notes per agent or shared. Every run records exactly which notes it included.">
            <Memory />
          </Card>
          <Card title="Routines." body="Daily, weekdays, weekly or every N minutes. Missed runs catch up when Nest opens.">
            <Routines />
          </Card>
          <Card delay={0.08} title="Approvals for anything risky." body="Conservative defaults, no bypass mode, and session approvals never become permanent rules.">
            <Approvals />
          </Card>
          <Card delay={0.16} title="Switch providers mid-chat." body="Move a conversation between Codex and Claude Code. The new side gets a bounded summary of only what it missed.">
            <Switch />
          </Card>
          <Card title="On-device voice." body="Dictate with Whisper running locally. Your audio never leaves your computer.">
            <Voice />
          </Card>
          <Card className="md:col-span-2" delay={0.08} title="Connectors and a real browser." body="Agents use the Gmail, Calendar, Slack and MCP servers you've already connected, allowed per agent. Claude agents can browse your real Chrome with Claude in Chrome.">
            <Connectors />
          </Card>
        </div>
      </div>
    </section>
  );
}
