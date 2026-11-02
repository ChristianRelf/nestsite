import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { Mascot } from '../components/Mascot';
import type { Eyes, Shape } from '../lib/shapes';

/* One run, traced. Time runs 0..100 across a four-minute run. */

type LaneId = 'you' | 'chief' | 'res' | 'eng' | 'wri';
const LANES: { id: LaneId; name: string; provider?: string; shape?: Shape; color: string; eyes?: Eyes }[] = [
  { id: 'you', name: 'You', color: '#f4f4f6' },
  { id: 'chief', name: 'Chief of Staff', provider: 'Claude Code', shape: 'leaf', color: '#4cbe6c' },
  { id: 'res', name: 'Researcher', provider: 'Claude Code', shape: 'hex', color: '#3b82f6', eyes: 'wide' },
  { id: 'eng', name: 'Engineer', provider: 'Codex', shape: 'diamond', color: '#8b5cf6' },
  { id: 'wri', name: 'Writer', provider: 'Claude Code', shape: 'pill', color: '#ec4899', eyes: 'happy' },
];
const ROW = 68;
const BAR_Y = 42; // bar centre within a lane
const idx = (id: LaneId) => LANES.findIndex((l) => l.id === id);
const lane = (id: LaneId) => LANES[idx(id)];

type SpanT = { lane: LaneId; start: number; end: number; label: string; wait?: boolean };
const SPANS: SpanT[] = [
  { lane: 'chief', start: 2, end: 10, label: 'reads the ask' },
  { lane: 'res', start: 11, end: 38, label: 'finds launch posts from similar tools' },
  { lane: 'eng', start: 13, end: 29, label: 'collects merged PRs' },
  { lane: 'eng', start: 29, end: 36, label: 'needs approval', wait: true },
  { lane: 'eng', start: 36, end: 52, label: 'tests, writes CHANGELOG.md' },
  { lane: 'chief', start: 52, end: 56, label: 'briefs' },
  { lane: 'wri', start: 56, end: 84, label: 'drafts the launch post' },
  { lane: 'chief', start: 85, end: 93, label: 'sums up' },
];

const MARKS: { t: number; label: string }[] = [
  { t: 1.5, label: 'sends the ask' },
  { t: 36, label: 'allows npm test' },
  { t: 94, label: 'gets the result' },
];

const LINKS: { from: LaneId; to: LaneId; t: number }[] = [
  { from: 'you', to: 'chief', t: 1.5 },
  { from: 'chief', to: 'res', t: 11 },
  { from: 'chief', to: 'eng', t: 13 },
  { from: 'eng', to: 'you', t: 29 },
  { from: 'you', to: 'eng', t: 36 },
  { from: 'res', to: 'chief', t: 38 },
  { from: 'eng', to: 'chief', t: 52 },
  { from: 'chief', to: 'wri', t: 56 },
  { from: 'wri', to: 'chief', t: 84 },
  { from: 'chief', to: 'you', t: 94 },
];

const LOG: { t: number; from: LaneId; to?: LaneId; text: string }[] = [
  { t: 1.5, from: 'you', to: 'chief', text: 'Ship the v0.2 changelog and a launch post for it.' },
  { t: 3, from: 'chief', text: 'included 2 memory notes' },
  { t: 11, from: 'chief', to: 'res', text: 'delegate("find launch posts from similar tools")' },
  { t: 13, from: 'chief', to: 'eng', text: 'delegate("collect merged PRs since v0.1")' },
  { t: 29, from: 'eng', to: 'you', text: 'wants to run npm test' },
  { t: 36, from: 'you', to: 'eng', text: 'allowed for this session' },
  { t: 38, from: 'res', to: 'chief', text: '6 examples, with links' },
  { t: 52, from: 'eng', to: 'chief', text: 'CHANGELOG.md updated · 42 tests pass' },
  { t: 56, from: 'chief', to: 'wri', text: 'delegate("launch post from the changelog")' },
  { t: 84, from: 'wri', to: 'chief', text: 'draft ready' },
  { t: 94, from: 'chief', to: 'you', text: 'posted to your Inbox' },
];

const clock = (t: number) => {
  const s = Math.round((t / 100) * 240);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function status(id: LaneId, now: number): { text: string; tone: 'idle' | 'work' | 'wait' | 'done' } {
  if (id === 'you') {
    if (now >= 29 && now < 36) return { text: 'approval needed', tone: 'wait' };
    if (now >= 94) return { text: 'result in Inbox', tone: 'done' };
    return { text: now > 1.5 ? 'waiting' : 'idle', tone: 'idle' };
  }
  const mine = SPANS.filter((s) => s.lane === id);
  const cur = mine.find((s) => now >= s.start && now < s.end);
  if (cur) return cur.wait ? { text: 'waiting on you', tone: 'wait' } : { text: 'working', tone: 'work' };
  if (now >= Math.max(...mine.map((s) => s.end))) return { text: 'done', tone: 'done' };
  return { text: 'idle', tone: 'idle' };
}

/* --- Trace pieces --- */

function Bar({ p, s }: { p: MotionValue<number>; s: SpanT }) {
  const color = s.wait ? '#e8c27a' : lane(s.lane).color;
  const fill = useTransform(p, [s.start, s.end], [0, 1], { clamp: true });
  const seen = useTransform(p, [s.start, s.start + 0.8], [0, 1], { clamp: true });
  const wide = s.end - s.start >= 8;
  return (
    <motion.div className="absolute" style={{ left: `${s.start}%`, width: `${s.end - s.start}%`, top: idx(s.lane) * ROW, height: ROW, opacity: seen }}>
      <div
        className={`absolute left-0 top-[14px] whitespace-nowrap font-mono text-[11px] tracking-tight ${s.wait ? 'text-warn' : 'text-ink-2'} ${wide ? 'hidden md:block' : 'hidden'}`}
      >
        {s.label}
      </div>
      <div className="absolute inset-x-0 h-[6px] -translate-y-1/2 rounded-full bg-white/[0.04]" style={{ top: BAR_Y }} />
      <motion.div
        className="absolute inset-x-0 h-[6px] origin-left -translate-y-1/2 rounded-full"
        style={{
          top: BAR_Y,
          scaleX: fill,
          background: s.wait ? `repeating-linear-gradient(135deg, ${color} 0 3px, transparent 3px 6px)` : color,
        }}
      />
    </motion.div>
  );
}

function Mark({ p, m }: { p: MotionValue<number>; m: (typeof MARKS)[number] }) {
  const seen = useTransform(p, [m.t, m.t + 0.8], [0, 1], { clamp: true });
  const nearEnd = m.t > 80;
  return (
    <motion.div className="absolute" style={{ left: `${m.t}%`, top: 0, height: ROW, opacity: seen }}>
      <span className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" style={{ top: BAR_Y }} />
      <span className={`absolute top-[14px] hidden whitespace-nowrap font-mono text-[11px] text-ink-2 md:block ${nearEnd ? 'right-2' : 'left-2'}`}>{m.label}</span>
    </motion.div>
  );
}

function Link({ p, l }: { p: MotionValue<number>; l: (typeof LINKS)[number] }) {
  const a = idx(l.from);
  const b = idx(l.to);
  const down = b > a;
  const top = Math.min(a, b) * ROW + BAR_Y + 5;
  const height = Math.abs(b - a) * ROW - 10;
  const grow = useTransform(p, [l.t, l.t + 1.4], [0, 1], { clamp: true });
  const opacity = useTransform(grow, [0, 0.05], [0, 0.55]);
  const color = lane(l.from).color;
  return (
    <motion.div className="absolute w-px -translate-x-1/2" style={{ left: `${l.t}%`, top, height, opacity }}>
      <motion.div className={`absolute inset-0 ${down ? 'origin-top' : 'origin-bottom'}`} style={{ scaleY: grow, background: color }} />
      <span
        className={`absolute left-1/2 -translate-x-1/2 border-x-[3.5px] border-x-transparent ${down ? '-bottom-[4px] border-t-[5px]' : '-top-[4px] border-b-[5px]'}`}
        style={down ? { borderTopColor: color } : { borderBottomColor: color }}
      />
    </motion.div>
  );
}

function Who({ id }: { id: LaneId }) {
  const l = lane(id);
  return (
    <span className="flex items-center gap-1.5">
      {l.shape ? (
        <Mascot shape={l.shape} color={l.color} eyes={l.eyes} size={14} alive={false} />
      ) : (
        <span className="grid h-[14px] w-[14px] place-items-center"><span className="h-1.5 w-1.5 rounded-full bg-ink" /></span>
      )}
      {l.name.split(' ')[0].toLowerCase()}
    </span>
  );
}

const TONE = {
  idle: 'text-faint',
  work: 'text-accent-2',
  wait: 'text-warn',
  done: 'text-ok',
} as const;

export function Orchestra() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useTransform(scrollYProgress, [0.05, 0.9], [0, 100], { clamp: true });
  const [now, setNow] = useState(0);
  useMotionValueEvent(p, 'change', (v) => setNow(v));
  const head = useTransform(p, (v) => `${v}%`);

  const log = LOG.filter((e) => e.t <= now).slice(-4);

  return (
    <section id="orchestra" ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden px-5 max-md:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.02] tracking-[-0.035em]">What happens after you press send.</h2>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted">One message, four agents, two providers. Scroll to run it.</p>
            </div>
            <div className="hidden text-right font-mono md:block">
              <div className="text-[44px] font-medium leading-none tabular-nums tracking-tight text-ink">{clock(now)}</div>
              <div className="mt-2 text-[12px] text-faint">of 4:00</div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-[30px_1fr] gap-x-3 md:mt-14 md:grid-cols-[210px_1fr] md:gap-x-6">
            {/* Lanes */}
            <div className="pt-8">
              {LANES.map((l) => {
                const st = status(l.id, now);
                return (
                  <div key={l.id} className="flex items-center gap-3" style={{ height: ROW, paddingTop: BAR_Y - 34 }}>
                    {l.shape ? (
                      <Mascot shape={l.shape} color={l.color} eyes={st.tone === 'done' ? 'happy' : l.eyes} size={28} hop={st.tone === 'work' ? 1 : 0} />
                    ) : (
                      <span className="grid h-7 w-7 place-items-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-ink" />
                      </span>
                    )}
                    <div className="hidden min-w-0 md:block">
                      <div className="truncate text-[14px] font-medium text-ink">{l.name}</div>
                      <div className="flex items-center gap-1.5 truncate font-mono text-[11px]">
                        {l.provider && <span className="text-faint">{l.provider} ·</span>}
                        <span className={`transition-colors ${TONE[st.tone]}`}>{st.text}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Track */}
            <div className="relative">
              <div className="relative h-8">
                {[0, 1, 2, 3, 4].map((m) => (
                  <span
                    key={m}
                    className={`absolute top-0 font-mono text-[11px] text-faint ${m === 1 || m === 3 ? 'max-md:hidden' : ''}`}
                    style={{ left: `${m * 25}%`, transform: m === 4 ? 'translateX(-100%)' : m === 0 ? undefined : 'translateX(-50%)' }}
                  >
                    {m}:00
                  </span>
                ))}
              </div>

              <div className="relative" style={{ height: LANES.length * ROW }}>
                {[0, 1, 2, 3, 4].map((m) => (
                  <div key={m} className="absolute inset-y-0 w-px bg-white/[0.045]" style={{ left: `${m * 25}%` }} />
                ))}
                {LANES.map((l, i) => (
                  <div key={l.id} className="absolute inset-x-0 h-px bg-white/[0.03]" style={{ top: (i + 1) * ROW }} />
                ))}
                {LINKS.map((l, i) => (
                  <Link key={i} p={p} l={l} />
                ))}
                {SPANS.map((s, i) => (
                  <Bar key={i} p={p} s={s} />
                ))}
                {MARKS.map((m, i) => (
                  <Mark key={i} p={p} m={m} />
                ))}

                <motion.div className="pointer-events-none absolute -top-8 bottom-0 w-px bg-white/70" style={{ left: head }}>
                  <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="mt-8 md:pl-[234px]">
            <div className="h-[164px] overflow-hidden font-mono text-[12.5px]">
              <AnimatePresence initial={false} mode="popLayout">
                {log.map((e, i) => {
                  const latest = i === log.length - 1;
                  return (
                    <motion.div
                      key={e.t}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      className={`flex h-[41px] items-center gap-4 rounded-lg px-3 transition-colors duration-500 ${latest ? 'bg-white/[0.045]' : ''}`}
                    >
                      <span className="w-9 shrink-0 tabular-nums text-faint">{clock(e.t)}</span>
                      <span className="hidden w-[210px] shrink-0 items-center gap-2 text-muted md:flex">
                        <Who id={e.from} />
                        {e.to && (
                          <>
                            <span className="text-faint">→</span>
                            <Who id={e.to} />
                          </>
                        )}
                      </span>
                      <span className={`truncate ${latest ? 'text-ink' : 'text-muted'}`}>{e.text}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {log.length === 0 && <div className="flex h-[41px] items-center px-3 text-faint">Nothing yet. Scroll to send the message.</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
