import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Mascot } from '../components/Mascot';
import { DiscordIcon, GitHubIcon } from '../components/icons';
import { DISCORD, REPO } from '../lib/links';

const LINKS = [
  ['How it works', '#orchestra'],
  ['Features', '#features'],
  ['Agents', '#builder'],
  ['Install', '#install'],
] as const;

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 60));

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <motion.nav
        animate={{
          backgroundColor: scrolled ? 'rgba(17,17,20,0.72)' : 'rgba(17,17,20,0)',
          borderColor: scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0)',
          maxWidth: scrolled ? 760 : 1200,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        className="flex h-14 w-full items-center gap-6 rounded-full border px-3 pl-4 backdrop-blur-xl"
      >
        <a href="#top" className={`flex items-center gap-2.5 text-[17px] font-semibold tracking-tight transition-colors ${scrolled ? 'text-ink' : 'text-[#0b1a3c]'}`}>
          <Mascot shape="blob" color="#3b82f6" size={26} track />
          Nest
        </a>
        <div className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className={`rounded-full px-3.5 py-1.5 text-[14px] transition-colors ${scrolled ? 'text-muted hover:bg-white/5 hover:text-ink' : 'text-[#0b1a3c]/70 hover:bg-black/5 hover:text-[#0b1a3c]'}`}>
              {label}
            </a>
          ))}
        </div>
        <a
          href={DISCORD}
          target="_blank"
          rel="noopener"
          aria-label="Discord"
          className={`ml-auto flex h-9 w-9 items-center justify-center rounded-full transition md:ml-0 ${scrolled ? 'text-muted hover:bg-white/5 hover:text-ink' : 'text-[#0b1a3c]/70 hover:bg-black/5 hover:text-[#0b1a3c]'}`}
        >
          <DiscordIcon className="h-[18px] w-[18px]" />
        </a>
        <a
          href={REPO}
          target="_blank"
          rel="noopener"
          className={`flex h-9 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition ${scrolled ? 'bg-white/[0.06] text-ink ring-1 ring-white/10 hover:bg-white/10' : 'bg-[#0b1a3c] text-white hover:bg-[#13285a]'}`}
        >
          <GitHubIcon className="h-4 w-4" />
          GitHub
        </a>
      </motion.nav>
    </motion.header>
  );
}
