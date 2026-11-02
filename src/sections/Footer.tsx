import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Mascot } from '../components/Mascot';
import { DiscordIcon, GitHubIcon } from '../components/icons';
import { Fluted } from '../components/Fluted';
import { ease } from '../components/ui';
import abstract from '../assets/footer-abstract.avif';
import { DISCORD, RELEASES, REPO } from '../lib/links';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      ['How it works', '#orchestra'],
      ['Features', '#features'],
      ['Agents', '#builder'],
      ['Install', '#install'],
    ],
  },
  {
    title: 'Pages',
    links: [
      ['Home', './'],
      ['Download', 'download/'],
      ['Nest Connect', 'connect/'],
      ['Meet the jits', 'jits/'],
    ],
  },
  {
    title: 'Project',
    links: [
      ['Source', REPO],
      ['Releases', RELEASES],
      ['Issues', `${REPO}/issues`],
      ['Discord', DISCORD],
      ['MIT License', `${REPO}/blob/main/LICENSE`],
    ],
  },
] as const;

/** `home` is the path back to the main page, so links work from the sub-pages too. */
export function Footer({ home = '' }: { home?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-12%', '0%']);
  const wordY = useTransform(scrollYProgress, [0, 1], ['40%', '0%']);

  return (
    <footer ref={ref} className="relative overflow-hidden">
      {/* Abstract backdrop: deep blue up top, light rising from the bottom edge. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div style={{ y: bgY }} className="absolute inset-x-0 top-0 h-[150%]">
          <Fluted src={abstract} duration={11} />
        </motion.div>
        <div className="noise absolute inset-0" />
        <div className="fade-from-top absolute inset-x-0 -top-px h-[460px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pt-64">
        <div className="grid gap-12 sm:grid-cols-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="sm:col-span-3 md:col-span-1">
            <div className="flex items-center gap-3 text-[20px] font-semibold tracking-tight text-white">
              <Mascot shape="blob" color="#3b82f6" size={30} track />
              Nest
            </div>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/70">
              A desktop home for AI agents, running on the subscriptions you already have.
            </p>
            <div className="mt-6 flex flex-col items-start gap-3">
            <a
              href={REPO}
              target="_blank"
              rel="noopener"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-[14px] font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <GitHubIcon className="h-4 w-4" /> UseNestBot/Nest-Bot
            </a>
            <a
              href={DISCORD}
              target="_blank"
              rel="noopener"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-[14px] font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <DiscordIcon className="h-4 w-4" /> Join the Discord
            </a>
            <a
              href={`${home}jits/`}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/5 pl-2.5 pr-4 text-[12.5px] font-medium text-white/70 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            >
              <Mascot shape="blob" color="#ffffff" eyeColor="#1d3fb8" size={18} track /> Built by jits on Nest
            </a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href.startsWith('http') ? href : `${home}${href}`}
                      {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
                      className="text-[15px] text-white/80 transition-colors hover:text-white"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-16 max-w-xl text-[12.5px] leading-relaxed text-white/45">
          An independent project, not affiliated with or endorsed by OpenAI or Anthropic. Codex, ChatGPT, Claude and Claude Code are their
          trademarks.
        </p>
      </div>

      {/* Oversized wordmark sitting in the light. */}
      <div className="relative mt-10 overflow-hidden pb-8">
        <motion.div
          style={{ y: wordY }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease }}
          className="select-none text-center text-[clamp(120px,30vw,440px)] font-semibold leading-[0.78] tracking-[-0.07em] text-[#0a2a8a]/85 mix-blend-multiply"
          aria-hidden="true"
        >
          nest
        </motion.div>
      </div>
    </footer>
  );
}
