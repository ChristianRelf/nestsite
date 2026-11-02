import { motion } from 'motion/react';
import { Database, HardDrive, KeyRound, Lock } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { Reveal, Words, ease } from '../components/ui';

const NEVER = [
  'read your provider credentials',
  'scrape chat websites',
  'call undocumented endpoints',
  'upload your voice',
  'bill an API key behind your back',
];

const FACTS = [
  { icon: Database, title: 'Local SQLite', body: 'Agents, chats, memory and activity live in one file on your machine.' },
  { icon: HardDrive, title: 'Daily backups', body: 'A full copy before every upgrade and once a day, newest 10 kept.' },
  { icon: KeyRound, title: 'Per-conversation tokens', body: 'Agent tools reach Nest over a local named pipe, scoped to their own conversation.' },
  { icon: Lock, title: 'Restart safe', body: 'Interrupted runs are marked on the next launch and pending approvals expire.' },
];

export function Never() {
  return (
    <section id="privacy" className="relative overflow-hidden border-y border-line bg-bg-2/50 px-5 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="text-[clamp(34px,5.2vw,64px)] font-semibold leading-[1.02] tracking-[-0.035em]">
              <Words text="Nest doesn’t" />
            </h2>
            <ul className="mt-6 space-y-1">
              {NEVER.map((n, i) => (
                <motion.li
                  key={n}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px 0px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease }}
                  className="relative w-fit py-1 text-[clamp(22px,3vw,36px)] font-medium tracking-tight text-ink-2"
                >
                  <motion.span
                    initial={{ color: '#c8c8ce' }}
                    whileInView={{ color: '#5f5f68' }}
                    viewport={{ once: true, margin: '-60px 0px' }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.18 }}
                  >
                    {n}
                  </motion.span>
                  <motion.span
                    className="absolute left-0 top-1/2 h-[3px] w-full origin-left rounded-full bg-[#e5484d]/80"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: '-60px 0px' }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.18, ease }}
                  />
                </motion.li>
              ))}
            </ul>
            <Reveal delay={0.3}>
              <p className="mt-10 max-w-lg text-[17px] leading-relaxed text-muted">
                Inference goes to the provider you pick. Everything else stays on your computer, in{' '}
                <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[14px] text-ink-2">%APPDATA%\Nest</code>.
              </p>
            </Reveal>
          </div>

          <div className="relative grid content-center gap-3">
            <motion.div className="-mb-6 mr-8 hidden justify-self-end lg:block" initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.4 }}>
              <Mascot shape="square" color="#6e6e76" eyes="sleepy" size={64} />
            </motion.div>
            {FACTS.map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px 0px' }}
                transition={{ duration: 0.7, delay: i * 0.08, ease }}
                whileHover={{ x: 6 }}
                className="card flex items-start gap-4 p-5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ok/10 text-ok"><Icon className="h-5 w-5" /></span>
                <span>
                  <span className="block text-[15.5px] font-semibold">{title}</span>
                  <span className="mt-0.5 block text-[14px] leading-relaxed text-muted">{body}</span>
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
