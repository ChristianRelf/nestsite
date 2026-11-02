import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { SectionHead, Reveal } from '../components/ui';
import { LinuxIcon, WindowsIcon } from '../components/icons';
import { DOWNLOAD } from '../lib/links';
import { builds } from '../lib/release';
import { SNAPSHOT } from '../lib/release-snapshot';

/** File names from the latest release baked in at build time. */
const files = (os: string, fallback: string) =>
  builds(SNAPSHOT.find((r) => !r.prerelease)).filter((b) => b.platform.os === os).map((b) => b.asset.name).join(' · ') || fallback;

type Line = { kind: 'cmd' | 'out' | 'ok' | 'gap'; text: string };

const SCRIPT: Line[] = [
  { kind: 'cmd', text: 'npm i -g @openai/codex @anthropic-ai/claude-code' },
  { kind: 'gap', text: '' },
  { kind: 'cmd', text: 'codex login' },
  { kind: 'ok', text: 'Signed in with ChatGPT' },
  { kind: 'cmd', text: 'claude auth login --claudeai' },
  { kind: 'ok', text: 'Signed in with your Claude account' },
  { kind: 'gap', text: '' },
  { kind: 'cmd', text: 'git clone https://github.com/UseNestBot/Nest-Bot && cd Nest-Bot' },
  { kind: 'cmd', text: 'npm install && npm run build && npm start' },
  { kind: 'out', text: 'Nest is open. 2 providers ready.' },
];

function Terminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!inView || line >= SCRIPT.length) return;
    const l = SCRIPT[line];
    if (l.kind === 'cmd' && chars < l.text.length) {
      const t = setTimeout(() => setChars((c) => c + 1), 18 + Math.random() * 30);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setLine((n) => n + 1); setChars(0); }, l.kind === 'cmd' ? 420 : 260);
    return () => clearTimeout(t);
  }, [inView, line, chars]);

  return (
    <div ref={ref} className="overflow-hidden rounded-[20px] border border-line-2 bg-[#0d0d10] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
      <div className="flex h-10 items-center gap-2 border-b border-line px-4">
        <span className="h-3 w-3 rounded-full bg-white/10" />
        <span className="h-3 w-3 rounded-full bg-white/10" />
        <span className="h-3 w-3 rounded-full bg-white/10" />
        <span className="ml-3 font-mono text-[12px] text-faint">~/code</span>
      </div>
      <div className="min-h-[340px] p-5 font-mono text-[13px] leading-[1.9]">
        {SCRIPT.slice(0, line + 1).map((l, i) => {
          if (i === line && l.kind !== 'cmd') return null;
          const text = i === line ? l.text.slice(0, chars) : l.text;
          if (l.kind === 'gap') return <div key={i} className="h-3" />;
          return (
            <motion.div key={i} initial={{ opacity: l.kind === 'cmd' ? 1 : 0, x: l.kind === 'cmd' ? 0 : -6 }} animate={{ opacity: 1, x: 0 }} className="break-all">
              {l.kind === 'cmd' && <span className="mr-2 text-[#4cbe6c]">❯</span>}
              {l.kind === 'ok' && <Check className="mr-2 inline h-3.5 w-3.5 text-ok" strokeWidth={3} />}
              {l.kind === 'out' && <span className="mr-2 text-accent-2">●</span>}
              <span className={l.kind === 'cmd' ? 'text-ink' : l.kind === 'ok' ? 'text-ok' : 'text-accent-2'}>{text}</span>
              {i === line && <span className="ml-0.5 inline-block h-4 w-2 translate-y-[3px] animate-pulse bg-ink-2" />}
            </motion.div>
          );
        })}
        {line >= SCRIPT.length && (
          <div><span className="mr-2 text-[#4cbe6c]">❯</span><span className="inline-block h-4 w-2 translate-y-[3px] animate-pulse bg-ink-2" /></div>
        )}
      </div>
    </div>
  );
}

function Download({ icon, os, file }: { icon: ReactNode; os: string; file: string }) {
  return (
    <motion.a
      href={DOWNLOAD}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="card group flex items-center gap-4 p-5"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] text-ink">{icon}</span>
      <span className="flex-1">
        <span className="block text-[16px] font-semibold">{os}</span>
        <span className="block font-mono text-[12px] text-faint">{file}</span>
      </span>
      <ArrowUpRight className="h-5 w-5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
    </motion.a>
  );
}

function CopyLine({ cmd }: { cmd: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard?.writeText(cmd); setDone(true); setTimeout(() => setDone(false), 1400); }}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-line bg-bg-2/80 px-4 py-3 text-left font-mono text-[13px] text-ink-2 transition hover:border-line-2"
    >
      <span className="text-faint">$</span>
      <span className="flex-1 truncate">{cmd}</span>
      {done ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4 text-faint" />}
    </button>
  );
}

export function Install() {
  return (
    <section id="install" className="relative px-5 py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <SectionHead title="Get Nest." lede="Windows or Linux, plus at least one of Codex or Claude Code. Nest finds them on PATH, in their default folders or behind npm shims. Building from source needs Node 24." />
          <Reveal delay={0.2} className="mt-10 grid gap-3">
            <Download icon={<WindowsIcon className="h-5 w-5" />} os="Windows" file={`${files('windows', 'Nest Setup.exe')} · no admin needed`} />
            <Download icon={<LinuxIcon className="h-6 w-6" />} os="Linux" file={files('linux', 'AppImage · .deb')} />
          </Reveal>
          <Reveal delay={0.3} className="mt-6 space-y-2">
            <CopyLine cmd="codex login" />
            <CopyLine cmd="claude auth login --claudeai" />
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <Terminal />
        </Reveal>
      </div>
    </section>
  );
}
