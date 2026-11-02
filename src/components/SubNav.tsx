import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Mascot } from './Mascot';
import { GitHubIcon } from './icons';
import { ease } from './ui';
import { REPO } from '../lib/links';

/** Pill nav for pages that live one folder down (/jits, /download). */
export function SubNav({ label, home = '../', action }: { label: string; home?: string; action?: ReactNode }) {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav className="flex h-14 w-full max-w-[760px] items-center gap-4 rounded-full border border-white/10 bg-[#111114]/70 px-3 pl-4 backdrop-blur-xl">
        <a href={home} className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
          <Mascot shape="blob" color="#3b82f6" size={26} track />
          Nest
        </a>
        <span className="text-faint">/</span>
        <span className="text-[15px] text-ink-2">{label}</span>
        <a href={home} className="ml-auto hidden items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[14px] text-muted transition hover:bg-white/5 hover:text-ink sm:flex">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Nest
        </a>
        {action ?? (
          <a
            href={REPO}
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
            className="ml-auto flex h-9 shrink-0 items-center gap-2 rounded-full bg-white/[0.06] px-3 text-[14px] font-medium ring-1 ring-white/10 transition hover:bg-white/10 sm:ml-0 sm:px-4"
          >
            <GitHubIcon className="h-4 w-4" /> <span className="hidden sm:inline">GitHub</span>
          </a>
        )}
      </nav>
    </motion.header>
  );
}
